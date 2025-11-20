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


    public OCRServiceImpl(@Value("${tesseract.datapath:src/main/resources/tessdata}") String tessdataPath) {
        this.tessdataPath = tessdataPath;
        this.tesseract = new Tesseract();
        initializeTesseract();
    }

    private void initializeTesseract() {
        try {
            Path tessdata = findTessdataPath();
            
            if (tessdata != null && Files.exists(tessdata)) {
                String absolutePath = tessdata.toAbsolutePath().toString();
                tesseract.setDatapath(absolutePath);
                log.info("Tesseract datapath set to: {}", absolutePath);
                
                // Check which language files are available
                String language = determineAvailableLanguage(tessdata);
                tesseract.setLanguage(language);
                log.info("Tesseract language set to: {}", language);
            } else {
                log.error("Tessdata path not found. OCR will not work correctly.");
                // Set default language anyway
                tesseract.setLanguage("eng");
            }

            // Set OCR Engine Mode
            tesseract.setOcrEngineMode(1); // LSTM OCR Engine

            // Set Page Segmentation Mode
            tesseract.setPageSegMode(1); // Automatic page segmentation with OSD

        } catch (Exception e) {
            log.error("Failed to initialize Tesseract: {}", e.getMessage(), e);
            // Don't throw exception during initialization - allow app to start
            // OCR will fail gracefully when called
            log.warn("OCR service may not work correctly due to initialization error");
        }
    }
    
    private Path findTessdataPath() {
        // Strategy 1: Try classpath resources (works in JAR and IDE)
        try {
            InputStream engStream = getClass().getClassLoader().getResourceAsStream("tessdata/eng.traineddata");
            if (engStream != null) {
                // Extract to temp directory
                Path tempDir = Files.createTempDirectory("tessdata");
                tempDir.toFile().deleteOnExit();
                
                // Copy eng.traineddata
                Path engFile = tempDir.resolve("eng.traineddata");
                Files.copy(engStream, engFile, StandardCopyOption.REPLACE_EXISTING);
                engStream.close();
                
                log.info("Extracted tessdata from classpath to: {}", tempDir);
                return tempDir;
            }
        } catch (Exception e) {
            log.debug("Could not load tessdata from classpath: {}", e.getMessage());
        }
        
        // Strategy 2: Try relative path from current directory
        Path tessdata = Paths.get(tessdataPath);
        if (Files.exists(tessdata) && Files.exists(tessdata.resolve("eng.traineddata"))) {
            log.info("Found tessdata at relative path: {}", tessdata.toAbsolutePath());
            return tessdata;
        }
        
        // Strategy 3: Try absolute path from user.dir
        String currentPath = System.getProperty("user.dir");
        Path absoluteTessdata = Paths.get(currentPath, tessdataPath);
        if (Files.exists(absoluteTessdata) && Files.exists(absoluteTessdata.resolve("eng.traineddata"))) {
            log.info("Found tessdata at absolute path: {}", absoluteTessdata.toAbsolutePath());
            return absoluteTessdata;
        }
        
        // Strategy 4: Try in resources directory (for development)
        Path resourcesPath = Paths.get(currentPath, "teacher-service", "src", "main", "resources", "tessdata");
        if (Files.exists(resourcesPath) && Files.exists(resourcesPath.resolve("eng.traineddata"))) {
            log.info("Found tessdata in resources: {}", resourcesPath.toAbsolutePath());
            return resourcesPath;
        }
        
        log.error("Could not find tessdata directory. Tried: {}, {}, {}", 
                tessdata.toAbsolutePath(), absoluteTessdata.toAbsolutePath(), resourcesPath.toAbsolutePath());
        return null;
    }

    private String determineAvailableLanguage(Path tessdataPath) {
        // If tessdata path doesn't exist, default to English
        if (tessdataPath == null || !Files.exists(tessdataPath)) {
            log.warn("Tessdata path does not exist. Defaulting to English language.");
            return "eng";
        }
        
        // Check for Vietnamese language file
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
            return "eng"; // Default to English, but will likely fail
        }
    }



    @Override
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
            return processImage(file);
        } else {
            throw GenericErrorResponse.builder()
                    .message("Unsupported file format: " + fileName)
                    .httpStatus(HttpStatus.BAD_REQUEST)
                    .build();
        }
    }

    @Override
    public OCRResultDTO processImage(File imageFile) {
        // Convert model File to java.io.File
        java.io.File physicalFile = new java.io.File(imageFile.getFilePath());
        try {
            log.info("Processing image file: {}", physicalFile.getName());

            // Perform OCR
            String ocrText = tesseract.doOCR(physicalFile);

            log.info("OCR completed. Text length: {}", ocrText != null ? ocrText.length() : 0);

            // Parse extracted text
            return parseOCRText(ocrText != null ? ocrText : "");

        } catch (TesseractException e) {
            log.error("OCR processing failed for image: {}", physicalFile.getName(), e);
            // Return empty result instead of throwing exception
            log.warn("Returning empty OCR result due to processing error");
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
    public OCRResultDTO processPDF(File pdfFile) {
        // Convert model File to java.io.File
        java.io.File physicalFile = new java.io.File(pdfFile.getFilePath());
        List<String> allPagesText = new ArrayList<>();

        try (PDDocument document = Loader.loadPDF(Paths.get(pdfFile.getFilePath()).toFile())) {
            log.info("Processing PDF file: {} ({} pages)", physicalFile.getName(), document.getNumberOfPages());

            PDFRenderer pdfRenderer = new PDFRenderer(document);

            // Process each page
            for (int page = 0; page < document.getNumberOfPages(); page++) {
                try {
                    // Render page to image
                    BufferedImage image = pdfRenderer.renderImageWithDPI(page, 300); // 300 DPI for better quality

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
                        // Catch Tesseract errors and memory access errors
                        log.warn("Failed to process page {}: {}", page + 1, e.getMessage());
                        allPagesText.add(""); // Add empty string for this page
                    } finally {
                        // Clean up temp file
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

            // Parse extracted text
            return parseOCRText(fullText);

        } catch (IOException e) {
            log.error("Failed to read PDF file: {}", physicalFile.getName(), e);
            throw GenericErrorResponse.builder()
                    .message("Failed to read PDF file: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }


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

        return result;
    }

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

    private void extractFullName(String text, String normalizedText, OCRResultDTO result) {
        // Pattern 1: "Họ tên: Nguyễn Văn A" or "Họ và tên: ..."
        Pattern pattern1 = Pattern.compile(
                "(?:Họ\\s+tên|Tên|Họ\\s+và\\s+tên|Full\\s+name|Name|Họ\\s+tên\\s+giảng\\s+viên)[:：]?\\s*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );

        Matcher matcher1 = pattern1.matcher(text);
        if (matcher1.find()) {
            String name = matcher1.group(1).trim();
            if (isValidVietnameseName(name)) {
                result.setOcrFullName(name);
                log.debug("Extracted full name (pattern1): {}", name);
                return;
            }
        }

        // Pattern 2: Look for Vietnamese name patterns (2-4 words, starting with capital)
        Pattern pattern2 = Pattern.compile(
                "([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+){1,3})",
                Pattern.MULTILINE
        );

        Matcher matcher2 = pattern2.matcher(text);
        while (matcher2.find()) {
            String name = matcher2.group(1).trim();
            if (isValidVietnameseName(name)) {
                result.setOcrFullName(name);
                log.debug("Extracted full name (pattern2): {}", name);
                return;
            }
        }
    }

    private void extractEvaluator(String text, String normalizedText, OCRResultDTO result) {
        Pattern pattern = Pattern.compile(
                "(?:Người\\s+đánh\\s+giá|Đánh\\s+giá\\s+bởi|Evaluator|Reviewed\\s+by|Người\\s+chấm|Chấm\\s+bởi|Người\\s+kiểm\\s+tra|Kiểm\\s+tra\\s+bởi)[:：]?\\s*([A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+(?:\\s+[A-ZÀÁẠẢÃÂẦẤẬẨẪĂẰẮẶẲẴÈÉẸẺẼÊỀẾỆỂỄÌÍỊỈĨÒÓỌỎÕÔỒỐỘỔỖƠỜỚỢỞỠÙÚỤỦŨƯỪỨỰỬỮỲÝỴỶỸĐ][a-zàáạảãâầấậẩẫăằắặẳẵèéẹẻẽêềếệểễìíịỉĩòóọỏõôồốộổỗơờớợởỡùúụủũưừứựửữỳýỵỷỹđ]+)*)",
                Pattern.CASE_INSENSITIVE | Pattern.MULTILINE
        );

        Matcher matcher = pattern.matcher(text);
        if (matcher.find()) {
            String evaluator = matcher.group(1).trim();
            if (isValidVietnameseName(evaluator)) {
                result.setOcrEvaluator(evaluator);
                log.debug("Extracted evaluator: {}", evaluator);
            }
        }
    }

    private boolean isValidVietnameseName(String name) {
        if (name == null || name.trim().isEmpty()) {
            return false;
        }

        String trimmed = name.trim();
        String[] words = trimmed.split("\\s+");

        // Vietnamese name typically has 2-4 words
        if (words.length < 2 || words.length > 4) {
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

    private String normalizeVietnamese(String text) {
        return text.replace("đ", "d")
                .replace("Đ", "D");
    }
}
