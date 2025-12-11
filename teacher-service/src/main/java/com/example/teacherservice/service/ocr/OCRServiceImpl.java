package com.example.teacherservice.service.ocr;

import com.example.teacherservice.dto.evidence.OCRResultDTO;
import com.example.teacherservice.enums.ExamResult;
import com.example.teacherservice.exception.GenericErrorResponse;
import com.example.teacherservice.model.File;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.Loader;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@Slf4j
public class OCRServiceImpl implements OCRService {
    private final ITesseract tesseract;
    private final String tessdataPath;

    // Constructor: Spring sẽ inject giá trị cấu hình `tesseract.datapath`
    // Nếu không cấu hình thì mặc định dùng `src/main/resources/tessdata`
    public OCRServiceImpl(@Value("${tesseract.datapath:src/main/resources/tessdata}") String metadataPath) {
        this.tessdataPath = metadataPath;
        this.tesseract = new Tesseract();
        initializeTesseract();
    }

    // Hàm khởi tạo cấu hình cho Tesseract
    // - Tìm thư mục tessdata khả dụng
    // - Set datapath + ngôn ngữ
    // - Cấu hình chế độ OCR và Page Segmentation
    private void initializeTesseract() {
        Path metadata = findTessdataPath();

        // Nếu tìm được thư mục tessdata
        if (metadata != null && Files.exists(metadata)) {
            String absolutePath = metadata.toAbsolutePath().toString();
            tesseract.setDatapath(absolutePath);
            // Check which language files are available
            String language = determineAvailableLanguage(metadata);
            tesseract.setLanguage(language);
        } else {
            // Set default language anyway
            tesseract.setLanguage("eng+vie"); // Ưu tiên kết hợp eng+vie để đọc tốt hơn văn bản tiếng Anh và Việt
        }

        // Set OCR Engine Mode
        tesseract.setOcrEngineMode(1); // LSTM OCR Engine

        // Set Page Segmentation Mode - Thay đổi sang 3 (Fully automatic page segmentation, no OSD) để đọc tốt hơn các tài liệu có cấu trúc như bảng
        tesseract.setPageSegMode(3);
    }

    // Tìm đường dẫn tessdata theo nhiều chiến lược:
    // 1. Tìm trong classpath (khi chạy bằng JAR, lấy resource và copy ra thư mục tạm)
    // 2. Tìm theo đường dẫn cấu hình tương đối
    // 3. Tìm theo đường dẫn tuyệt đối (dựa trên user.dir)
    // 4. Tìm trực tiếp trong thư mục resources của project (khi chạy trong IDE)
    private Path findTessdataPath() {
        try {
            InputStream engStream = getClass().getClassLoader().getResourceAsStream("tessdata/eng.traineddata");
            InputStream vieStream = getClass().getClassLoader().getResourceAsStream("tessdata/vie.traineddata"); // Thêm kiểm tra vie
            if (engStream != null || vieStream != null) {
                // Extract to temp directory
                Path tempDir = Files.createTempDirectory("tessdata");
                tempDir.toFile().deleteOnExit();

                // Copy eng.traineddata if available
                if (engStream != null) {
                    Path engFile = tempDir.resolve("eng.traineddata");
                    Files.copy(engStream, engFile, StandardCopyOption.REPLACE_EXISTING);
                    engStream.close();
                }

                // Copy vie.traineddata if available
                if (vieStream != null) {
                    Path vieFile = tempDir.resolve("vie.traineddata");
                    Files.copy(vieStream, vieFile, StandardCopyOption.REPLACE_EXISTING);
                    vieStream.close();
                }

                return tempDir;
            }
        } catch (Exception e) {
            log.debug("Could not load tessdata from classpath: {}", e.getMessage());
        }

        // Strategy 2: Try relative path from current directory
        Path tessdata = Paths.get(tessdataPath);
        if (Files.exists(tessdata) && (Files.exists(tessdata.resolve("eng.traineddata")) || Files.exists(tessdata.resolve("vie.traineddata")))) {
            log.info("Found tessdata at relative path: {}", tessdata.toAbsolutePath());
            return tessdata;
        }

        // Strategy 3: Try absolute path from user.dir
        String currentPath = System.getProperty("user.dir");
        Path absoluteTessdata = Paths.get(currentPath, tessdataPath);
        if (Files.exists(absoluteTessdata) && (Files.exists(absoluteTessdata.resolve("eng.traineddata")) || Files.exists(absoluteTessdata.resolve("vie.traineddata")))) {
            log.info("Found tessdata at absolute path: {}", absoluteTessdata.toAbsolutePath());
            return absoluteTessdata;
        }

        // Strategy 4: Try in resources directory (for development)
        Path resourcesPath = Paths.get(currentPath, "teacher-service", "src", "main", "resources", "tessdata");
        if (Files.exists(resourcesPath) && (Files.exists(resourcesPath.resolve("eng.traineddata")) || Files.exists(resourcesPath.resolve("vie.traineddata")))) {
            log.info("Found tessdata in resources: {}", resourcesPath.toAbsolutePath());
            return resourcesPath;
        }
        return null;
    }

    // Xác định ngôn ngữ OCR nào có thể dùng dựa vào các file *.traineddata hiện có
    // Ưu tiên: có cả vie + eng -> dùng "vie+eng"
    // Chỉ có eng -> dùng "eng"
    // Chỉ có vie -> dùng "vie"
    // Không có file nào -> log lỗi và trả về "eng+vie" (khả năng cao sẽ lỗi OCR)
    private String determineAvailableLanguage(Path tessdataPath) {
        // If tessdata path doesn't exist, default to English + Vietnamese
        if (tessdataPath == null || !Files.exists(tessdataPath)) {
            log.warn("Tessdata path does not exist. Defaulting to English + Vietnamese language.");
            return "eng+vie";
        }

        // Check for Vietnamese and English language files
        Path vieFile = tessdataPath.resolve("vie.traineddata");
        Path engFile = tessdataPath.resolve("eng.traineddata");

        boolean hasVie = Files.exists(vieFile);
        boolean hasEng = Files.exists(engFile);

        if (hasVie && hasEng) {
            return "vie+eng";
        } else if (hasEng) {
            log.warn("Vietnamese language file not found. Using English only.");
            return "eng";
        } else if (hasVie) {
            log.warn("English language file not found. Using Vietnamese only.");
            return "vie";
        } else {
            log.error("No language files found in tessdata directory. OCR will likely fail.");
            return "eng+vie"; // Default to both, but may fail
        }
    }

    @Override
    // Hàm này là entry chung để xử lý mọi loại file minh chứng
    // - Nhận vào model File (đường dẫn vật lý + tên file)
    // - Phân loại file: PDF hay ảnh, sau đó gọi hàm tương ứng
    public OCRResultDTO processFile(File file) {
        // Convert model File to java.io.File
        java.io.File physicalFile = new java.io.File(file.getFilePath());
        if (!physicalFile.exists()) {
            throw GenericErrorResponse.builder()
                    .message("File not found: " + file.getFilePath())
                    .httpStatus(HttpStatus.NOT_FOUND)
                    .build();
        }
        String fileName = file.getFileName() != null ? file.getFileName().toLowerCase() : physicalFile.getName().toLowerCase();
        if (fileName.endsWith(".pdf")) {
            return processPDF(file);
        } else if (fileName.endsWith(".jpg") || fileName.endsWith(".jpeg")
                || fileName.endsWith(".png") || fileName.endsWith(".bmp")
                || fileName.endsWith(".tiff") || fileName.endsWith(".tif")) {
            return processAptechCertificate(file); // Sử dụng processAptechCertificate cho hình ảnh để phù hợp với định dạng trong ví dụ
        } else {
            throw GenericErrorResponse.builder()
                    .message("Unsupported file format: " + fileName)
                    .httpStatus(HttpStatus.BAD_REQUEST)
                    .build();
        }
    }

    @Override
    public OCRResultDTO processFile(String filePath, String fileName) {
        java.io.File physicalFile = new java.io.File(filePath);
        if (!physicalFile.exists()) {
            throw GenericErrorResponse.builder()
                    .message("File not found: " + filePath)
                    .httpStatus(HttpStatus.NOT_FOUND)
                    .build();
        }
        String fileNameLower = fileName != null ? fileName.toLowerCase() : physicalFile.getName().toLowerCase();
        if (fileNameLower.endsWith(".pdf")) {
            return processPDF(filePath, fileName);
        } else if (fileNameLower.endsWith(".jpg") || fileNameLower.endsWith(".jpeg")
                || fileNameLower.endsWith(".png") || fileNameLower.endsWith(".bmp")
                || fileNameLower.endsWith(".tiff") || fileNameLower.endsWith(".tif")) {
            return processAptechCertificate(filePath, fileName); // Chuyển sang processAptechCertificate để match pattern tốt hơn
        } else {
            throw GenericErrorResponse.builder()
                    .message("Unsupported file format: " + fileNameLower)
                    .httpStatus(HttpStatus.BAD_REQUEST)
                    .build();
        }
    }

    @Override
    public OCRResultDTO processImage(String filePath, String fileName) {
        java.io.File physicalFile = new java.io.File(filePath);
        try {
            // Perform OCR
            String ocrText = tesseract.doOCR(physicalFile);
            // Parse extracted text using Aptech parser for better matching
            return parseAptechCertificateText(ocrText != null ? ocrText : "");
        } catch (TesseractException e) {
            // Return empty result instead of throwing exception
            return OCRResultDTO.builder()
                    .ocrText("")
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error during OCR processing for image: {}", physicalFile.getName(), e);
            // Return empty result instead of throwing exception
            return OCRResultDTO.builder()
                    .ocrText("")
                    .build();
        }
    }

    @Override
    public OCRResultDTO processPDF(String filePath, String fileName) {
        java.io.File physicalFile = new java.io.File(filePath);
        List<String> allPagesText = new ArrayList<>();
        try (PDDocument document = Loader.loadPDF(physicalFile)) {
            log.info("Processing PDF file: {} ({} pages)", physicalFile.getName(), document.getNumberOfPages());
            PDFRenderer pdfRenderer = new PDFRenderer(document);
            // Process each page
            for (int page = 0; page < document.getNumberOfPages(); page++) {
                try {
                    // Render page to image with higher DPI for better accuracy
                    BufferedImage image = pdfRenderer.renderImageWithDPI(page, 600); // Tăng DPI từ 300 lên 400 để đọc text rõ hơn
                    // Create temporary file for this page
                    java.io.File tempImageFile = java.io.File.createTempFile("pdf_page_" + page + "_", ".png");
                    ImageIO.write(image, "png", tempImageFile);
                    try {
                        // Perform OCR on this page
                        String pageText = tesseract.doOCR(tempImageFile);
                        if (pageText != null) {
                            allPagesText.add(pageText);
                            log.debug("Processed page {}: {} characters", page + 1, pageText.length());
                        } else {
                            log.warn("OCR returned null for page {}", page + 1);
                            allPagesText.add("");
                        }
                    } catch (TesseractException | Error e) {
                        allPagesText.add(""); // Add empty string for this page
                    } finally {
                        tempImageFile.delete();
                    }
                } catch (Exception e) {
                    log.warn("Failed to process page {}: {}", page + 1, e.getMessage());
                    allPagesText.add(""); // Add empty string for this page
                }
            }
            // Combine all pages text
            String fullText = String.join("\n\n--- Page Break ---\n\n", allPagesText);
            log.info("PDF OCR completed. Total text length: {}", fullText.length());
            // Parse extracted text using Aptech parser
            return parseAptechCertificateText(fullText);
        } catch (IOException e) {
            log.error("Failed to read PDF file: {}", physicalFile.getName(), e);
            throw GenericErrorResponse.builder()
                    .message("Failed to read PDF file: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @Override
    public OCRResultDTO processAptechCertificate(String filePath, String fileName) {
        java.io.File physicalFile = new java.io.File(filePath);
        try {
            // Convert to BufferedImage to avoid image format issues
            BufferedImage bufferedImage = ImageIO.read(physicalFile);
            if (bufferedImage == null) {
                log.error("Failed to read image file: {}", physicalFile.getName());
                return OCRResultDTO.builder().ocrText("").build();
            }
            // Perform OCR on BufferedImage
            String ocrText = tesseract.doOCR(bufferedImage);
            return parseAptechCertificateText(ocrText != null ? ocrText : "");
        } catch (IOException e) {
            log.error("IO error reading image file: {}", physicalFile.getName(), e);
            return OCRResultDTO.builder().ocrText("").build();
        } catch (TesseractException e) {
            log.error("OCR failed for Aptech certificate: {}", physicalFile.getName(), e);
            return OCRResultDTO.builder().ocrText("").build();
        } catch (Exception e) {
            log.error("Unexpected error during Aptech OCR processing: {}", physicalFile.getName(), e);
            return OCRResultDTO.builder().ocrText("").build();
        }
    }

    @Override
    // Xử lý file ảnh: JPG, PNG, TIFF, ...
    // - Gọi trực tiếp Tesseract để đọc text từ file
    // - Parse text để lấy thông tin cần thiết
    public OCRResultDTO processImage(File imageFile) {
        // Convert model File to java.io.File
        java.io.File physicalFile = new java.io.File(imageFile.getFilePath());
        try {
            // Perform OCR
            String ocrText = tesseract.doOCR(physicalFile);
            // Parse extracted text using Aptech parser
            return parseAptechCertificateText(ocrText != null ? ocrText : "");
        } catch (TesseractException e) {
            // Return empty result instead of throwing exception
            return OCRResultDTO.builder()
                    .ocrText("")
                    .build();
        } catch (Exception e) {
            log.error("Unexpected error during OCR processing for image: {}", physicalFile.getName(), e);
            // Return empty result instead of throwing exception
            return OCRResultDTO.builder()
                    .ocrText("")
                    .build();
        }
    }

    @Override
    // Xử lý file PDF:
    // - Dùng PDFBox để render từng trang PDF thành ảnh
    // - Dùng Tesseract OCR trên từng ảnh trang
    // - Ghép text của tất cả các trang lại rồi parse
    public OCRResultDTO processPDF(File pdfFile) {
        // Convert model File to java.io.File
        java.io.File physicalFile = new java.io.File(pdfFile.getFilePath());
        List<String> allPagesText = new ArrayList<>();
        try (PDDocument document = Loader.loadPDF(physicalFile)) {
            log.info("Processing PDF file: {} ({} pages)", physicalFile.getName(), document.getNumberOfPages());
            PDFRenderer pdfRenderer = new PDFRenderer(document);
            // Process each page
            for (int page = 0; page < document.getNumberOfPages(); page++) {
                try {
                    // Render page to image with higher DPI
                    BufferedImage image = pdfRenderer.renderImageWithDPI(page, 400);
                    // Create temporary file for this page
                    java.io.File tempImageFile = java.io.File.createTempFile("pdf_page_" + page + "_", ".png");
                    ImageIO.write(image, "png", tempImageFile);
                    try {
                        // Perform OCR on this page
                        String pageText = tesseract.doOCR(tempImageFile);
                        if (pageText != null) {
                            allPagesText.add(pageText);
                            log.debug("Processed page {}: {} characters", page + 1, pageText.length());
                        } else {
                            log.warn("OCR returned null for page {}", page + 1);
                            allPagesText.add("");
                        }
                    } catch (TesseractException | Error e) {
                        allPagesText.add(""); // Add empty string for this page
                    } finally {
                        tempImageFile.delete();
                    }
                } catch (Exception e) {
                    log.warn("Failed to process page {}: {}", page + 1, e.getMessage());
                    allPagesText.add(""); // Add empty string for this page
                }
            }
            // Combine all pages text
            String fullText = String.join("\n\n--- Page Break ---\n\n", allPagesText);
            log.info("PDF OCR completed. Total text length: {}", fullText.length());
            // Parse extracted text using Aptech parser
            return parseAptechCertificateText(fullText);
        } catch (IOException e) {
            log.error("Failed to read PDF file: {}", physicalFile.getName(), e);
            throw GenericErrorResponse.builder()
                    .message("Failed to read PDF file: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    // Hàm tổng để phân tích text đã OCR:
    // - Lưu toàn bộ text vào DTO
    // - Gọi các hàm con để trích:
    // + Kết quả PASS/FAIL
    // + Họ tên
    // + Người đánh giá
    private OCRResultDTO parseOCRText(String ocrText) {
        OCRResultDTO result = OCRResultDTO.builder()
                .ocrText(ocrText)
                .build();
        if (ocrText == null || ocrText.trim().isEmpty()) {
            return result;
        }
        String upperText = ocrText.toUpperCase();
        String normalizedText = normalizeVietnamese(ocrText);
        // 1. Extract PASS/FAIL result
        extractResult(upperText, normalizedText, result);
        // 2. Extract Full Name
        extractFullName(ocrText, normalizedText, result);
        // 3. Extract Evaluator
        extractEvaluator(ocrText, normalizedText, result);
        // 4. Extract Score (thêm để match định dạng "Your score is XX marks (YY%)")
        extractScore(ocrText, result);
        return result;
    }

    // Thêm hàm extract score vào parseOCRText để hỗ trợ chung
    private void extractScore(String ocrText, OCRResultDTO result) {
        Pattern scorePattern = Pattern.compile(
                "Your\\s+score\\s+is\\s+(\\d+)\\s+marks?\\s*\\((\\d+)%\\)",
                Pattern.CASE_INSENSITIVE
        );
        Matcher scoreMatcher = scorePattern.matcher(ocrText);
        if (scoreMatcher.find()) {
            try {
                int marks = Integer.parseInt(scoreMatcher.group(1));
                int percentage = Integer.parseInt(scoreMatcher.group(2));

                result.setOcrScore(marks);
                result.setOcrPercentage(percentage);

                // Set result based on score (assuming 60% threshold)
                result.setOcrResult(percentage >= 60 ? ExamResult.PASS : ExamResult.FAIL);

                log.debug("Extracted score: {} marks ({}%)", marks, percentage);
            } catch (NumberFormatException e) {
                log.warn("Failed to parse score numbers", e);
            }
        }
    }

    @Override
    /**
     * Xử lý certificate Aptech với format đặc biệt:
     * - Faculty Name: VIẾT HOA TOÀN BỘ
     * - Score: "Your score is XX marks (YY%)"
     * - Skill Name: "1367-PHP (v8.x) with Laravel"
     */
    public OCRResultDTO processAptechCertificate(File imageFile) {
        java.io.File physicalFile = new java.io.File(imageFile.getFilePath());
        try {
            // Convert to BufferedImage to avoid image format issues
            BufferedImage bufferedImage = ImageIO.read(physicalFile);
            if (bufferedImage == null) {
                log.error("Failed to read image file: {}", physicalFile.getName());
                return OCRResultDTO.builder().ocrText("").build();
            }

            // Perform OCR on BufferedImage
            String ocrText = tesseract.doOCR(bufferedImage);
            return parseAptechCertificateText(ocrText != null ? ocrText : "");
        } catch (IOException e) {
            log.error("IO error reading image file: {}", physicalFile.getName(), e);
            return OCRResultDTO.builder().ocrText("").build();
        } catch (TesseractException e) {
            log.error("OCR failed for Aptech certificate: {}", physicalFile.getName(), e);
            return OCRResultDTO.builder().ocrText("").build();
        } catch (Exception e) {
            log.error("Unexpected error during Aptech OCR processing: {}", physicalFile.getName(), e);
            return OCRResultDTO.builder().ocrText("").build();
        }
    }

    /**
     * Parse Aptech certificate OCR text with specific patterns
     * - Cập nhật pattern để match tốt hơn với các ví dụ: Faculty Name, Employee Name, Skill Name, Exam Name, Total Marks, Marks Obtained
     */
    private OCRResultDTO parseAptechCertificateText(String ocrText) {
        log.info("=== APTECH OCR DEBUG START ===");
        log.info("Raw OCR Text length: {}", ocrText != null ? ocrText.length() : 0);
        log.info("Raw OCR Text:\n{}", ocrText);
        log.info("=== APTECH OCR DEBUG END ===");

        OCRResultDTO result = OCRResultDTO.builder()
                .ocrText(ocrText)
                .build();
        if (ocrText == null || ocrText.trim().isEmpty()) {
            log.warn("OCR text is empty, cannot extract anything");
            return result;
        }

        // 1. Extract Score: "Your score is 30 marks (100%)" - Mở rộng pattern để linh hoạt hơn với khoảng trắng và dấu
        Pattern scorePattern = Pattern.compile(
                "Your\\s+score\\s+is\\s+(\\d+)\\s+marks?\\s*\\(?(\\d+)%\\)?",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );
        Matcher scoreMatcher = scorePattern.matcher(ocrText);
        if (scoreMatcher.find()) {
            try {
                int marks = Integer.parseInt(scoreMatcher.group(1));
                int percentage = Integer.parseInt(scoreMatcher.group(2));

                result.setOcrScore(marks);
                result.setOcrPercentage(percentage);

                // Aptech PASS threshold: 60%
                result.setOcrResult(percentage >= 60 ? ExamResult.PASS : ExamResult.FAIL);

                log.debug("Extracted Aptech score: {} marks ({}%)", marks, percentage);
            } catch (NumberFormatException e) {
                log.warn("Failed to parse Aptech score numbers", e);
            }
        }

        // 2. Extract Faculty Name or Employee Name (Teacher Name) - Mở rộng pattern để match "Faculty Name" hoặc "Employee Name", và xử lý tên VIẾT HOA
        Pattern namePattern = Pattern.compile(
                "(?:Faculty\\s+Name|Employee\\s+Name)\\s*[:\\s]+([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ\\s]+?)(?:\\n|Skill|Exam|Login|Total|$)",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );
        Matcher nameMatcher = namePattern.matcher(ocrText);
        if (nameMatcher.find()) {
            String name = nameMatcher.group(1).trim();
            // Chuẩn hóa: SON HONG NGUYEN -> Son Hong Nguyen
            result.setOcrFullName(toTitleCase(name));
            log.debug("Extracted Aptech name: {}", name);
        }

        // 3. Extract Skill/Exam Name - Mở rộng để match các biến thể như "1514-Blender" hoặc "1367-PHP (v8.x) with Laravel"
        Pattern skillPattern = Pattern.compile(
                "(?:Skill\\s+Name|Exam\\s+Name)\\s*[:\\s]+([\\d\\-A-Za-z\\(\\)\\.\\s/]+?)(?:\\n|Faculty|Employee|Thank|Total|Login|$)",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );
        Matcher skillMatcher = skillPattern.matcher(ocrText);
        if (skillMatcher.find()) {
            String skillName = skillMatcher.group(1).trim();
            result.setOcrSubjectName(skillName);
            log.debug("Extracted Aptech skill: {}", skillName);
        }

        Pattern evaluatorPattern = Pattern.compile(
                "(?:Người\\s+đánh\\s+giá|Đánh\\s+giá\\s+bởi|Evaluator|Reviewed\\s+by|Người\\s+chấm|Chấm\\s+bởi|Người\\s+kiểm\\s+tra|Kiểm\\s+tra\\s+bởi)[:：]?\\s*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );
        Matcher evaluatorMatcher = evaluatorPattern.matcher(ocrText);
        if (evaluatorMatcher.find()) {
            String evaluator = evaluatorMatcher.group(1).trim();
            result.setOcrEvaluator(toTitleCase(evaluator));
            log.debug("Extracted evaluator: {}", evaluator);
            }


        return result;
    }

    /**
     * Convert "SON HONG NGUYEN" -> "Son Hong Nguyen"
     */
    private String toTitleCase(String input) {
        if (input == null || input.isEmpty()) return input;

        String[] words = input.split("\\s+");
        StringBuilder result = new StringBuilder();

        for (String word : words) {
            if (word.length() > 0) {
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1).toLowerCase())
                      .append(" ");
            }
        }

        return result.toString().trim();
    }

    // Phần này chỉ tập trung vào việc phát hiện kết quả thi PASS / FAIL
    // bằng cách dò các từ khóa tiếng Anh và tiếng Việt trong đoạn text OCR
    private void extractResult(String upperText, String normalizedText, OCRResultDTO result) {
        // Patterns for PASS
        String[] passPatterns = {
                "PASS", "ĐẠT", "ĐẠT YÊU CẦU", "THÀNH CÔNG",
                "PASSED", "QUALIFIED", "APPROVED", "ĐỖ",
                "ĐẠT ĐIỂM", "ĐẠT CHUẨN"
        };
        // Patterns for FAIL
        String[] failPatterns = {
                "FAIL", "KHÔNG ĐẠT", "TRƯỢT", "KHÔNG ĐẠT YÊU CẦU",
                "FAILED", "NOT PASSED", "REJECTED", "DISQUALIFIED",
                "KHÔNG ĐỖ", "KHÔNG ĐẠT CHUẨN"
        };
        // Check for PASS (higher priority)
        for (String pattern : passPatterns) {
            if (upperText.contains(pattern)) {
                result.setOcrResult(ExamResult.PASS);
                log.debug("Extracted result: PASS (matched pattern: {})", pattern);
                return;
            }
        }
        // Check for FAIL
        for (String pattern : failPatterns) {
            if (upperText.contains(pattern)) {
                result.setOcrResult(ExamResult.FAIL);
                log.debug("Extracted result: FAIL (matched pattern: {})", pattern);
                return;
            }
        }
        log.debug("No result pattern found in OCR text");
    }

    // Cố gắng trích xuất họ tên từ text OCR dựa trên các pattern:
    // - "Họ tên:", "Họ và tên:", "Full name:", "Faculty Name:", "Employee Name:" ...
    // - Pattern tên tiếng Việt 2-4 từ, mỗi từ viết hoa chữ cái đầu
    private void extractFullName(String text, String normalizedText, OCRResultDTO result) {
        // Pattern 1: Mở rộng để bao gồm "Faculty Name" và "Employee Name"
        Pattern pattern1 = Pattern.compile(
                "(?:Họ\\s+tên|Tên|Họ\\s+và\\s+tên|Full\\s+name|Name|Họ\\s+tên\\s+giảng\\s+viên|Faculty\\s+Name|Employee\\s+Name)[:：\\s]*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );
        Matcher matcher1 = pattern1.matcher(text);
        if (matcher1.find()) {
            String name = matcher1.group(1).trim();
            if (isValidVietnameseName(name)) {
                result.setOcrFullName(toTitleCase(name)); // Sử dụng toTitleCase để chuẩn hóa
                log.debug("Extracted full name (pattern1): {}", name);
                return;
            }
        }

        // Pattern 2: Look for Vietnamese name patterns (2-4 words, starting with capital) - Giữ nguyên nhưng ưu tiên pattern1
        Pattern pattern2 = Pattern.compile(
                "([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+){1,3})",
                Pattern.MULTILINE
        );
        Matcher matcher2 = pattern2.matcher(text);
        while (matcher2.find()) {
            String name = matcher2.group(1).trim();
            if (isValidVietnameseName(name)) {
                result.setOcrFullName(toTitleCase(name));
                log.debug("Extracted full name (pattern2): {}", name);
                return;
            }
        }
    }

    // Cố gắng trích xuất tên người đánh giá / người chấm
    // Dựa trên các từ khóa: "Người đánh giá", "Chấm bởi", "Evaluator", ...
    private void extractEvaluator(String text, String normalizedText, OCRResultDTO result) {
        Pattern pattern = Pattern.compile(
                "(?:Người\\s+đánh\\s+giá|Đánh\\s+giá\\s+bởi|Evaluator|Reviewed\\s+by|Người\\s+chấm|Chấm\\s+bởi|Người\\s+kiểm\\s+tra|Kiểm\\s+tra\\s+bởi)[:：]?\\s*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );
        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String evaluator = matcher.group(1).trim();
            if (isValidVietnameseName(evaluator)) {
                result.setOcrEvaluator(toTitleCase(evaluator));
                log.debug("Extracted evaluator: {}", evaluator);
            }
        }
    }

    // Kiểm tra 1 chuỗi có hợp lệ là tên người Việt hay không
    // - 2 đến 4 từ
    // - Mỗi từ viết hoa chữ cái đầu
    // - Độ dài tối thiểu 5 ký tự
    private boolean isValidVietnameseName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }
        String trimmed = name.trim();
        String[] words = trimmed.split("\\s+");
        // Vietnamese name typically has 2-4 words
        if (words.length < 2 || words.length > 5) { // Mở rộng lên 5 để linh hoạt hơn
            return false;
        }
        // Check if all words start with capital letter
        for (String word : words) {
            if (word.isEmpty() || !Character.isUpperCase(word.charAt(0))) {
                return false;
            }
        }
        // Check minimum length
        if (trimmed.length() < 5) {
            return false;
        }
        return true;
    }

    // Chuẩn hóa chữ cái tiếng Việt để dễ so khớp pattern (ví dụ chuyển đ -> d)
    private String normalizeVietnamese(String text) {
        return text.replace("đ", "d")
                .replace("Đ", "D")
                .replaceAll("\\s+", " "); // Normalize spaces để pattern match tốt hơn
    }
}