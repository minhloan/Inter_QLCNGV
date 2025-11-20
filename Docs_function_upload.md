
```xml
<!-- Tesseract OCR -->
<dependency>
    <groupId>net.sourceforge.tess4j</groupId>
    <artifactId>tess4j</artifactId>
    <version>5.8.0</version>
</dependency>

<!-- PDF Processing (để xử lý PDF files) -->
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox</artifactId>
    <version>3.0.1</version>
</dependency>
<dependency>
    <groupId>org.apache.pdfbox</groupId>
    <artifactId>pdfbox-tools</artifactId>
    <version>3.0.1</version>
</dependency>

<!-- ImageIO for image processing -->
<dependency>
    <groupId>com.twelvemonkeys.imageio</groupId>
    <artifactId>imageio-core</artifactId>
    <version>3.10.1</version>
</dependency>
<dependency>
    <groupId>com.twelvemonkeys.imageio</groupId>
    <artifactId>imageio-jpeg</artifactId>
    <version>3.10.1</version>
</dependency>
```

```plaintext
   teacher-service/src/main/resources/tessdata/
```

```java
package com.example.teacherservice.dto.evidence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceDTO {
    private String teacherId;
    private String subjectId;
    private String submittedDate; // Format: "yyyy-MM-dd"
}
```

```java
package com.example.teacherservice.dto.evidence;

import com.example.teacherservice.enums.ExamResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OCRResultDTO {
    private String ocrText;
    private String ocrFullName;
    private String ocrEvaluator;
    private ExamResult ocrResult;
}
```

```java
package com.example.teacherservice.dto.evidence;

import com.example.teacherservice.enums.EvidenceStatus;
import com.example.teacherservice.enums.ExamResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceResponseDTO {
    private String id;
    private String teacherId;
    private String teacherName;
    private String subjectId;
    private String subjectName;
    private String fileId;
    private String ocrText;
    private String ocrFullName;
    private String ocrEvaluator;
    private ExamResult ocrResult;
    private EvidenceStatus status;
    private LocalDate submittedDate;
    private String verifiedById;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private LocalDateTime creationTimestamp;
    private LocalDateTime updateTimestamp;
}
```

```java
package com.example.teacherservice.dto.evidence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOCRTextDTO {
    private String ocrText;
    private String ocrFullName;
    private String ocrEvaluator;
}
```

```java
package com.example.teacherservice.service.ocr;

import com.example.teacherservice.dto.evidence.OCRResultDTO;
import java.io.File;

public interface OCRService {
    OCRResultDTO processFile(File file);
    OCRResultDTO processImage(File imageFile);
    OCRResultDTO processPDF(File pdfFile);
}
```

```java
package com.example.teacherservice.service.ocr;

import com.example.teacherservice.dto.evidence.OCRResultDTO;
import com.example.teacherservice.enums.ExamResult;
import com.example.teacherservice.exception.GenericErrorResponse;
import lombok.extern.slf4j.Slf4j;
import net.sourceforge.tess4j.ITesseract;
import net.sourceforge.tess4j.Tesseract;
import net.sourceforge.tess4j.TesseractException;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.rendering.PDFRenderer;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import javax.imageio.ImageIO;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
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
            // Set tessdata path
            Path tessdata = Paths.get(tessdataPath);
            if (!Files.exists(tessdata)) {
                // Try absolute path
                String currentPath = System.getProperty("user.dir");
                tessdata = Paths.get(currentPath, tessdataPath);
            }
            
            if (Files.exists(tessdata)) {
                tesseract.setDatapath(tessdata.toAbsolutePath().toString());
                log.info("Tesseract datapath set to: {}", tessdata.toAbsolutePath());
            } else {
                log.warn("Tessdata path not found: {}. OCR may not work correctly.", tessdata);
            }
            
            // Set language: Vietnamese + English
            tesseract.setLanguage("vie+eng");
            
            // Set OCR Engine Mode
            tesseract.setOcrEngineMode(1); // LSTM OCR Engine
            
            // Set Page Segmentation Mode
            tesseract.setPageSegMode(1); // Automatic page segmentation with OSD
            
        } catch (Exception e) {
            log.error("Failed to initialize Tesseract: {}", e.getMessage(), e);
            throw GenericErrorResponse.builder()
                    .message("Failed to initialize OCR service: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @Override
    public OCRResultDTO processFile(File file) {
        String fileName = file.getName().toLowerCase();
        
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
        try {
            log.info("Processing image file: {}", imageFile.getName());
            
            // Perform OCR
            String ocrText = tesseract.doOCR(imageFile);
            
            log.info("OCR completed. Text length: {}", ocrText.length());
            
            // Parse extracted text
            return parseOCRText(ocrText);
            
        } catch (TesseractException e) {
            log.error("OCR processing failed for image: {}", imageFile.getName(), e);
            throw GenericErrorResponse.builder()
                    .message("OCR processing failed: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @Override
    public OCRResultDTO processPDF(File pdfFile) {
        List<String> allPagesText = new ArrayList<>();
        
        try (PDDocument document = PDDocument.load(pdfFile)) {
            log.info("Processing PDF file: {} ({} pages)", pdfFile.getName(), document.getNumberOfPages());
            
            PDFRenderer pdfRenderer = new PDFRenderer(document);
            
            // Process each page
            for (int page = 0; page < document.getNumberOfPages(); page++) {
                try {
                    // Render page to image
                    BufferedImage image = pdfRenderer.renderImageWithDPI(page, 300); // 300 DPI for better quality
                    
                    // Create temporary file for this page
                    File tempImageFile = File.createTempFile("pdf_page_" + page + "_", ".png");
                    ImageIO.write(image, "png", tempImageFile);
                    
                    try {
                        // Perform OCR on this page
                        String pageText = tesseract.doOCR(tempImageFile);
                        allPagesText.add(pageText);
                        log.debug("Processed page {}: {} characters", page + 1, pageText.length());
                    } finally {
                        // Clean up temp file
                        tempImageFile.delete();
                    }
                    
                } catch (Exception e) {
                    log.warn("Failed to process page {}: {}", page + 1, e.getMessage());
                }
            }
            
            // Combine all pages text
            String fullText = String.join("\n\n--- Page Break ---\n\n", allPagesText);
            log.info("PDF OCR completed. Total text length: {}", fullText.length());
            
            // Parse extracted text
            return parseOCRText(fullText);
            
        } catch (IOException e) {
            log.error("Failed to read PDF file: {}", pdfFile.getName(), e);
            throw GenericErrorResponse.builder()
                    .message("Failed to read PDF file: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        } catch (TesseractException e) {
            log.error("OCR processing failed for PDF: {}", pdfFile.getName(), e);
            throw GenericErrorResponse.builder()
                    .message("OCR processing failed: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    /**
     * Parse OCR text to extract structured information
     */
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

    /**
     * Validate if extracted text looks like a Vietnamese name
     */
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

    /**
     * Normalize Vietnamese characters for better matching
     */
    private String normalizeVietnamese(String text) {
        return text.replace("đ", "d")
                   .replace("Đ", "D");
    }
}
```

```java
package com.example.teacherservice.repository;

import com.example.teacherservice.enums.EvidenceStatus;
import com.example.teacherservice.model.Evidence;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface EvidenceRepository extends JpaRepository<Evidence, String> {
    
    List<Evidence> findByTeacherId(String teacherId);
    
    List<Evidence> findBySubjectId(String subjectId);
    
    List<Evidence> findByStatus(EvidenceStatus status);
    
    List<Evidence> findByTeacherIdAndSubjectId(String teacherId, String subjectId);
    
    List<Evidence> findBySubmittedDateBetween(LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT e FROM Evidence e WHERE e.teacher.id = :teacherId AND e.status = :status")
    List<Evidence> findByTeacherIdAndStatus(@Param("teacherId") String teacherId, 
                                            @Param("status") EvidenceStatus status);
    
    @Query("SELECT e FROM Evidence e WHERE e.ocrText IS NULL AND e.status = 'PENDING'")
    List<Evidence> findPendingOCRProcessing();
}
```

```java
package com.example.teacherservice.service.evidence;

import com.example.teacherservice.dto.evidence.EvidenceDTO;
import com.example.teacherservice.dto.evidence.EvidenceResponseDTO;
import com.example.teacherservice.dto.evidence.UpdateOCRTextDTO;
import com.example.teacherservice.model.Evidence;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EvidenceService {
    EvidenceResponseDTO uploadEvidence(EvidenceDTO dto, MultipartFile file);
    EvidenceResponseDTO findById(String id);
    List<EvidenceResponseDTO> findByTeacherId(String teacherId);
    List<EvidenceResponseDTO> findByStatus(String status);
    EvidenceResponseDTO updateOCRText(String id, UpdateOCRTextDTO dto);
    EvidenceResponseDTO verifyEvidence(String id, String verifiedById, boolean approved);
    void processOCRAsync(String evidenceId);
    List<EvidenceResponseDTO> findAll();
}
```

```java
package com.example.teacherservice.service.evidence;

import com.example.teacherservice.dto.evidence.EvidenceDTO;
import com.example.teacherservice.dto.evidence.EvidenceResponseDTO;
import com.example.teacherservice.dto.evidence.OCRResultDTO;
import com.example.teacherservice.dto.evidence.UpdateOCRTextDTO;
import com.example.teacherservice.enums.EvidenceStatus;
import com.example.teacherservice.exception.GenericErrorResponse;
import com.example.teacherservice.model.Evidence;
import com.example.teacherservice.model.File;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.EvidenceRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.service.file.FileService;
import com.example.teacherservice.service.ocr.OCRService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.File as JavaFile;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class EvidenceServiceImpl implements EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final FileService fileService;
    private final OCRService ocrService;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public EvidenceResponseDTO uploadEvidence(EvidenceDTO dto, MultipartFile file) {
        log.info("Uploading evidence for teacher: {}, subject: {}", dto.getTeacherId(), dto.getSubjectId());
        
        // 1. Validate teacher exists
        User teacher = userRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Teacher not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());
        
        // 2. Upload file
        String fileId = fileService.uploadImageToFileSystem(file);
        File fileEntity = fileService.findFileById(fileId);
        
        // 3. Create Evidence entity
        Evidence evidence = Evidence.builder()
                .teacher(teacher)
                .subject(teacher.getSubject()) // Assuming User has subject relationship
                .file(fileEntity)
                .submittedDate(dto.getSubmittedDate() != null 
                        ? LocalDate.parse(dto.getSubmittedDate()) 
                        : LocalDate.now())
                .status(EvidenceStatus.PENDING)
                .build();
        
        evidence = evidenceRepository.save(evidence);
        log.info("Evidence created with ID: {}", evidence.getId());
        
        // 4. Trigger async OCR processing
        processOCRAsync(evidence.getId());
        
        return convertToDTO(evidence);
    }

    @Override
    @Async
    public void processOCRAsync(String evidenceId) {
        log.info("Starting async OCR processing for evidence: {}", evidenceId);
        
        try {
            Evidence evidence = evidenceRepository.findById(evidenceId)
                    .orElseThrow(() -> {
                        log.error("Evidence not found: {}", evidenceId);
                        return GenericErrorResponse.builder()
                                .message("Evidence not found")
                                .httpStatus(HttpStatus.NOT_FOUND)
                                .build();
                    });
            
            // Get file
            File fileEntity = evidence.getFile();
            if (fileEntity == null) {
                log.warn("Evidence {} has no file attached", evidenceId);
                return;
            }
            
            JavaFile physicalFile = new JavaFile(fileEntity.getFilePath());
            if (!physicalFile.exists()) {
                log.error("Physical file not found: {}", fileEntity.getFilePath());
                return;
            }
            
            // Process OCR
            log.info("Processing OCR for file: {}", physicalFile.getName());
            OCRResultDTO ocrResult = ocrService.processFile(physicalFile);
            
            // Update Evidence with OCR results
            evidence.setOcrText(ocrResult.getOcrText());
            evidence.setOcrFullName(ocrResult.getOcrFullName());
            evidence.setOcrEvaluator(ocrResult.getOcrEvaluator());
            evidence.setOcrResult(ocrResult.getOcrResult());
            
            evidenceRepository.save(evidence);
            
            log.info("OCR processing completed for evidence: {}. Extracted: name={}, evaluator={}, result={}", 
                    evidenceId, 
                    ocrResult.getOcrFullName(), 
                    ocrResult.getOcrEvaluator(), 
                    ocrResult.getOcrResult());
            
        } catch (Exception e) {
            log.error("OCR processing failed for evidence: {}", evidenceId, e);
            // Optionally update evidence status to indicate OCR failure
            try {
                Evidence evidence = evidenceRepository.findById(evidenceId).orElse(null);
                if (evidence != null) {
                    // You might want to add an OCR_FAILED status or keep as PENDING
                    evidenceRepository.save(evidence);
                }
            } catch (Exception ex) {
                log.error("Failed to update evidence after OCR failure", ex);
            }
        }
    }

    @Override
    @Transactional(readOnly = true)
    public EvidenceResponseDTO findById(String id) {
        Evidence evidence = evidenceRepository.findById(id)
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Evidence not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());
        
        return convertToDTO(evidence);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvidenceResponseDTO> findByTeacherId(String teacherId) {
        List<Evidence> evidences = evidenceRepository.findByTeacherId(teacherId);
        return evidences.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvidenceResponseDTO> findByStatus(String status) {
        EvidenceStatus evidenceStatus = EvidenceStatus.valueOf(status.toUpperCase());
        List<Evidence> evidences = evidenceRepository.findByStatus(evidenceStatus);
        return evidences.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public EvidenceResponseDTO updateOCRText(String id, UpdateOCRTextDTO dto) {
        Evidence evidence = evidenceRepository.findById(id)
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Evidence not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());
        
        if (dto.getOcrText() != null) {
            evidence.setOcrText(dto.getOcrText());
        }
        if (dto.getOcrFullName() != null) {
            evidence.setOcrFullName(dto.getOcrFullName());
        }
        if (dto.getOcrEvaluator() != null) {
            evidence.setOcrEvaluator(dto.getOcrEvaluator());
        }
        
        evidence = evidenceRepository.save(evidence);
        return convertToDTO(evidence);
    }

    @Override
    @Transactional
    public EvidenceResponseDTO verifyEvidence(String id, String verifiedById, boolean approved) {
        Evidence evidence = evidenceRepository.findById(id)
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Evidence not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());
        
        User verifier = userRepository.findById(verifiedById)
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Verifier not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());
        
        evidence.setVerifiedBy(verifier);
        evidence.setVerifiedAt(java.time.LocalDateTime.now());
        evidence.setStatus(approved ? EvidenceStatus.VERIFIED : EvidenceStatus.REJECTED);
        
        evidence = evidenceRepository.save(evidence);
        return convertToDTO(evidence);
    }

    @Override
    @Transactional(readOnly = true)
    public List<EvidenceResponseDTO> findAll() {
        List<Evidence> evidences = evidenceRepository.findAll();
        return evidences.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    private EvidenceResponseDTO convertToDTO(Evidence evidence) {
        return EvidenceResponseDTO.builder()
                .id(evidence.getId())
                .teacherId(evidence.getTeacher() != null ? evidence.getTeacher().getId() : null)
                .teacherName(evidence.getTeacher() != null ? 
                        (evidence.getTeacher().getUserDetails() != null ? 
                                evidence.getTeacher().getUserDetails().getFullName() : 
                                evidence.getTeacher().getUsername()) : null)
                .subjectId(evidence.getSubject() != null ? evidence.getSubject().getId() : null)
                .subjectName(evidence.getSubject() != null ? evidence.getSubject().getName() : null)
                .fileId(evidence.getFile() != null ? evidence.getFile().getId() : null)
                .ocrText(evidence.getOcrText())
                .ocrFullName(evidence.getOcrFullName())
                .ocrEvaluator(evidence.getOcrEvaluator())
                .ocrResult(evidence.getOcrResult())
                .status(evidence.getStatus())
                .submittedDate(evidence.getSubmittedDate())
                .verifiedById(evidence.getVerifiedBy() != null ? evidence.getVerifiedBy().getId() : null)
                .verifiedByName(evidence.getVerifiedBy() != null ? 
                        (evidence.getVerifiedBy().getUserDetails() != null ? 
                                evidence.getVerifiedBy().getUserDetails().getFullName() : 
                                evidence.getVerifiedBy().getUsername()) : null)
                .verifiedAt(evidence.getVerifiedAt())
                .creationTimestamp(evidence.getCreationTimestamp())
                .updateTimestamp(evidence.getUpdateTimestamp())
                .build();
    }
}
```

```java
package com.example.teacherservice.controller;

import com.example.teacherservice.dto.evidence.EvidenceDTO;
import com.example.teacherservice.dto.evidence.EvidenceResponseDTO;
import com.example.teacherservice.dto.evidence.UpdateOCRTextDTO;
import com.example.teacherservice.service.evidence.EvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/evidence")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping("/upload")
    public ResponseEntity<EvidenceResponseDTO> uploadEvidence(
            @RequestParam("file") MultipartFile file,
            @RequestParam("teacherId") String teacherId,
            @RequestParam("subjectId") String subjectId,
            @RequestParam(value = "submittedDate", required = false) String submittedDate) {
        
        EvidenceDTO dto = EvidenceDTO.builder()
                .teacherId(teacherId)
                .subjectId(subjectId)
                .submittedDate(submittedDate)
                .build();
        
        EvidenceResponseDTO evidence = evidenceService.uploadEvidence(dto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(evidence);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvidenceResponseDTO> getEvidenceById(@PathVariable String id) {
        EvidenceResponseDTO evidence = evidenceService.findById(id);
        return ResponseEntity.ok(evidence);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<EvidenceResponseDTO>> getEvidenceByTeacher(
            @PathVariable String teacherId) {
        List<EvidenceResponseDTO> evidences = evidenceService.findByTeacherId(teacherId);
        return ResponseEntity.ok(evidences);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EvidenceResponseDTO>> getEvidenceByStatus(
            @PathVariable String status) {
        List<EvidenceResponseDTO> evidences = evidenceService.findByStatus(status);
        return ResponseEntity.ok(evidences);
    }

    @GetMapping
    public ResponseEntity<List<EvidenceResponseDTO>> getAllEvidence() {
        List<EvidenceResponseDTO> evidences = evidenceService.findAll();
        return ResponseEntity.ok(evidences);
    }

    @PutMapping("/{id}/ocr-text")
    public ResponseEntity<EvidenceResponseDTO> updateOCRText(
            @PathVariable String id,
            @RequestBody UpdateOCRTextDTO dto) {
        EvidenceResponseDTO evidence = evidenceService.updateOCRText(id, dto);
        return ResponseEntity.ok(evidence);
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<EvidenceResponseDTO> verifyEvidence(
            @PathVariable String id,
            @RequestParam("verifiedById") String verifiedById,
            @RequestParam("approved") boolean approved) {
        EvidenceResponseDTO evidence = evidenceService.verifyEvidence(id, verifiedById, approved);
        return ResponseEntity.ok(evidence);
    }

    @PostMapping("/{id}/reprocess-ocr")
    public ResponseEntity<String> reprocessOCR(@PathVariable String id) {
        evidenceService.processOCRAsync(id);
        return ResponseEntity.ok("OCR reprocessing started");
    }
}
```

```java
package com.example.teacherservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;

@Configuration
@EnableAsync
public class AsyncConfig {

    @Bean(name = "ocrTaskExecutor")
    public Executor ocrTaskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(2);
        executor.setMaxPoolSize(5);
        executor.setQueueCapacity(100);
        executor.setThreadNamePrefix("ocr-");
        executor.initialize();
        return executor;
    }
}
```

```properties
# Tesseract OCR Configuration
tesseract.datapath=src/main/resources/tessdata
tesseract.language=vie+eng
```

```shellscript
   tesseract --version
   ```

### Bước 5: Test

1. Upload file qua API:
```

```plaintext

2. Kiểm tra OCR status:
```

```plaintext

3. Xem OCR text:
   - Response sẽ có `ocrText`, `ocrFullName`, `ocrEvaluator`, `ocrResult`

### Lưu ý

1. Tessdata: Đảm bảo file `vie.traineddata` và `eng.traineddata` có trong `src/main/resources/tessdata/`
2. File size: Xử lý file lớn có thể mất thời gian, nên dùng async
3. Error handling: OCR có thể không chính xác 100%, cần cho phép admin chỉnh sửa
4. Performance: Với PDF nhiều trang, xem xét giới hạn số trang hoặc tối ưu DPI

Bạn muốn tôi tạo thêm file nào hoặc giải thích phần nào chi tiết hơn không?
```

---

**User**

Giải thích flow nó hoạt động đi, ví dụ như upload thì cần cái gì, và Bước 4: Cài đặt Tesseract trên Windows
Tải Tesseract installer:
Link: https://github.com/UB-Mannheim/tesseract/wiki là gì 


---

**Cursor**


Giải thích flow hoạt động và cách cài đặt Tesseract:



Giải thích flow hoạt động và cách cài đặt Tesseract:

## FLOW HOẠT ĐỘNG CHI TIẾT

### 1. Flow Upload Evidence (Upload bằng chứng)

#### Bước 1: Client gửi request
```
POST /v1/teacher/evidence/upload
Content-Type: multipart/form-data

Form Data:
- file: [File PDF hoặc Image] (BẮT BUỘC)
- teacherId: "uuid-cua-giao-vien" (BẮT BUỘC)
- subjectId: "uuid-cua-mon-hoc" (BẮT BUỘC)
- submittedDate: "2024-01-15" (TÙY CHỌN, mặc định = hôm nay)
```

Ví dụ với Postman:
- Tab: Body → form-data
- Key: `file` (Type: File) → chọn file
- Key: `teacherId` (Type: Text) → nhập ID giáo viên
- Key: `subjectId` (Type: Text) → nhập ID môn học
- Key: `submittedDate` (Type: Text) → "2024-01-15" (tùy chọn)

#### Bước 2: Controller nhận request
```java
EvidenceController.uploadEvidence()
```
- Nhận `MultipartFile` và các tham số
- Tạo `EvidenceDTO` từ request
- Gọi `EvidenceService.uploadEvidence()`

#### Bước 3: Service xử lý upload
```java
EvidenceServiceImpl.uploadEvidence()
```

Chi tiết:
1. Validate Teacher:
   ```java
   User teacher = userRepository.findById(teacherId)
   // Kiểm tra teacher có tồn tại không
   ```
2. Upload file:
   ```java
   String fileId = fileService.uploadImageToFileSystem(file)
   // File được lưu vào: teacher-service/src/main/resources/attachments/{uuid}
   // Trả về fileId để lưu vào database
   ```
3. Tạo Evidence record:
   ```java
   Evidence evidence = Evidence.builder()
       .teacher(teacher)
       .subject(subject)
       .file(fileEntity)
       .submittedDate(LocalDate.parse(submittedDate))
       .status(EvidenceStatus.PENDING) // Mặc định = PENDING
       .build()
   ```
   - Lưu vào database với status = `PENDING`
   - Các field OCR (`ocrText`, `ocrFullName`, etc.) = `null` (chưa xử lý)
4. Trigger OCR (async):
   ```java
   processOCRAsync(evidence.getId())
   // Gọi async, không đợi kết quả
   ```
5. Trả response ngay:
   ```json
   {
     "id": "evidence-uuid",
     "teacherId": "...",
     "status": "PENDING",
     "ocrText": null,  // Chưa có
     "ocrFullName": null,
     "ocrResult": null,
     ...
   }
   ```

#### Bước 4: OCR xử lý nền (async)

```java
@Async
processOCRAsync(evidenceId)
```

Chi tiết:
1. Lấy Evidence từ DB:
   ```java
   Evidence evidence = evidenceRepository.findById(evidenceId)
   File fileEntity = evidence.getFile()
   ```
2. Đọc file vật lý:
   ```java
   File physicalFile = new File(fileEntity.getFilePath())
   // Đường dẫn: .../attachments/{uuid}
   ```
3. Xác định loại file:
   - PDF → `processPDF()`
   - Image (jpg, png, etc.) → `processImage()`
4. Xử lý OCR:
   
   Với Image:
   ```java
   String ocrText = tesseract.doOCR(imageFile)
   // Tesseract đọc text từ image
   ```
   
   Với PDF:
   ```java
   // 1. Render từng trang PDF thành image (300 DPI)
   BufferedImage image = pdfRenderer.renderImageWithDPI(page, 300)
   
   // 2. OCR từng trang
   String pageText = tesseract.doOCR(tempImageFile)
   
   // 3. Gộp tất cả các trang lại
   String fullText = String.join("\n\n--- Page Break ---\n\n", allPagesText)
   ```
5. Parse text để trích xuất thông tin:
   ```java
   OCRResultDTO result = parseOCRText(ocrText)
   ```
   
   Tìm:
   - Result (PASS/FAIL):
     - Patterns: "PASS", "ĐẠT", "FAIL", "KHÔNG ĐẠT", etc.
   - Full Name:
     - Pattern: "Họ tên: Nguyễn Văn A"
     - Hoặc tìm chuỗi 2-4 từ, mỗi từ bắt đầu bằng chữ hoa
   - Evaluator:
     - Pattern: "Người đánh giá: Trần Thị B"
6. Cập nhật Evidence:
   ```java
   evidence.setOcrText(ocrResult.getOcrText())
   evidence.setOcrFullName(ocrResult.getOcrFullName())
   evidence.setOcrEvaluator(ocrResult.getOcrEvaluator())
   evidence.setOcrResult(ocrResult.getOcrResult()) // PASS hoặc FAIL
   
   evidenceRepository.save(evidence)
   ```

#### Bước 5: Client kiểm tra kết quả

Sau khi upload, client có thể:
1. Polling (thường xuyên kiểm tra):
   ```
   GET /v1/teacher/evidence/{id}
   ```
   - Lần 1: `ocrText = null` (đang xử lý)
   - Lần 2: `ocrText = "..."` (đã xong)
2. Hoặc đợi vài giây rồi check lại

Response khi OCR xong:
```json
{
  "id": "evidence-uuid",
  "teacherId": "teacher-123",
  "teacherName": "Nguyễn Văn A",
  "subjectId": "subject-456",
  "status": "PENDING",
  "ocrText": "PHIẾU ĐÁNH GIÁ GIẢNG DẠY\nHọ tên: Nguyễn Văn A\n...",
  "ocrFullName": "Nguyễn Văn A",
  "ocrEvaluator": "Trần Thị B",
  "ocrResult": "PASS",
  "submittedDate": "2024-01-15"
}
```

### 2. Flow Verify Evidence (Admin xác nhận)

```
POST /v1/teacher/evidence/{id}/verify
Body:
{
  "verifiedById": "admin-uuid",
  "approved": true  // true = VERIFIED, false = REJECTED
}
```

Flow:
1. Admin xem evidence và OCR text
2. Admin xác nhận đúng/sai
3. Cập nhật:
   - `status` = `VERIFIED` hoặc `REJECTED`
   - `verifiedBy` = admin user
   - `verifiedAt` = thời gian hiện tại

---

## TESSERACT OCR LÀ GÌ?

### Tesseract là gì?
- Công cụ OCR mã nguồn mở của Google
- Đọc text từ hình ảnh/PDF
- Hỗ trợ nhiều ngôn ngữ (tiếng Việt, tiếng Anh, v.v.)

### Tại sao cần cài Tesseract?
- Java library (Tess4J) cần Tesseract engine cài sẵn trên máy
- Tess4J gọi Tesseract executable để xử lý

### Cài đặt Tesseract trên Windows

#### Bước 1: Tải installer
- Link: https://github.com/UB-Mannheim/tesseract/wiki
- Chọn phiên bản phù hợp (ví dụ: `tesseract-ocr-w64-setup-5.x.x.exe`)
- Lưu ý: UB-Mannheim là bản build sẵn cho Windows

#### Bước 2: Cài đặt
1. Chạy file `.exe`
2. Chọn thư mục cài đặt (mặc định: `C:\Program Files\Tesseract-OCR`)
3. Chọn components:
   - Tesseract OCR executable
   - Additional language data (Vietnamese, English)
4. Hoàn tất cài đặt

#### Bước 3: Kiểm tra
Mở Command Prompt:
```bash
tesseract --version
# Kết quả: tesseract 5.x.x
```

#### Bước 4: Cấu hình trong project
Có 2 cách:

Cách 1: Dùng tessdata trong project (khuyến nghị)
- Tải `vie.traineddata` và `eng.traineddata` từ: https://github.com/tesseract-ocr/tessdata
- Đặt vào: `teacher-service/src/main/resources/tessdata/`
- Cấu hình:
  ```properties
  tesseract.datapath=src/main/resources/tessdata
  ```

Cách 2: Dùng tessdata của Tesseract đã cài
- Nếu cài vào `C:\Program Files\Tesseract-OCR`
- Tessdata thường ở: `C:\Program Files\Tesseract-OCR\tessdata`
- Cấu hình:
  ```properties
  tesseract.datapath=C:/Program Files/Tesseract-OCR/tessdata
  ```

### Cấu trúc thư mục sau khi setup

```
teacher-service/
├── src/
│   └── main/
│       └── resources/
│           ├── tessdata/          ← Tạo thư mục này
│           │   ├── vie.traineddata  ← Download từ GitHub
│           │   └── eng.traineddata  ← Download từ GitHub
│           └── attachments/        ← File upload sẽ lưu ở đây
│               └── {uuid}
└── pom.xml
```

### Lưu ý quan trọng

1. Tessdata files:
   - `vie.traineddata`: cho tiếng Việt
   - `eng.traineddata`: cho tiếng Anh
   - Kích thước mỗi file ~10-20MB

2. Performance:
   - OCR 1 trang PDF ~2-5 giây
   - PDF 10 trang ~20-50 giây
   - Nên dùng async để không block request

3. Accuracy:
   - OCR không 100% chính xác
   - Cần cho phép admin chỉnh sửa OCR text
   - Chất lượng ảnh càng tốt, kết quả càng chính xác

4. Deployment:
   - Trên server, cần cài Tesseract tương tự
   - Hoặc dùng Docker image có sẵn Tesseract

Bạn muốn tôi giải thích thêm phần nào không?

```plaintext
POST /v1/teacher/evidence/upload
Content-Type: multipart/form-data

Form Data:
- file: [File PDF hoặc Image] (BẮT BUỘC)
- teacherId: "uuid-cua-giao-vien" (BẮT BUỘC)
- subjectId: "uuid-cua-mon-hoc" (BẮT BUỘC)
- submittedDate: "2024-01-15" (TÙY CHỌN, mặc định = hôm nay)
```

```java
EvidenceController.uploadEvidence()
```

```java
EvidenceServiceImpl.uploadEvidence()
```

```java
   User teacher = userRepository.findById(teacherId)
   // Kiểm tra teacher có tồn tại không
```

```java
   String fileId = fileService.uploadImageToFileSystem(file)
   // File được lưu vào: teacher-service/src/main/resources/attachments/{uuid}
   // Trả về fileId để lưu vào database
```

```java
   Evidence evidence = Evidence.builder()
       .teacher(teacher)
       .subject(subject)
       .file(fileEntity)
       .submittedDate(LocalDate.parse(submittedDate))
       .status(EvidenceStatus.PENDING) // Mặc định = PENDING
       .build()
```

```java
   processOCRAsync(evidence.getId())
   // Gọi async, không đợi kết quả
```

```json
   {
     "id": "evidence-uuid",
     "teacherId": "...",
     "status": "PENDING",
     "ocrText": null,  // Chưa có
     "ocrFullName": null,
     "ocrResult": null,
     ...
   }
```

```java
@Async
processOCRAsync(evidenceId)
```

```java
   Evidence evidence = evidenceRepository.findById(evidenceId)
   File fileEntity = evidence.getFile()

```

```java
   File physicalFile = new File(fileEntity.getFilePath())
   // Đường dẫn: .../attachments/{uuid}
```

```java
   String ocrText = tesseract.doOCR(imageFile)
   // Tesseract đọc text từ image
   ```
   
   Với PDF:
   ```java
   // 1. Render từng trang PDF thành image (300 DPI)
   BufferedImage image = pdfRenderer.renderImageWithDPI(page, 300)
   
   // 2. OCR từng trang
   String pageText = tesseract.doOCR(tempImageFile)
   
   // 3. Gộp tất cả các trang lại
   String fullText = String.join("\n\n--- Page Break ---\n\n", allPagesText)
   ```
5. Parse text để trích xuất thông tin:
   ```java
   OCRResultDTO result = parseOCRText(ocrText)
   ```
   
   Tìm:
   - Result (PASS/FAIL):
     - Patterns: "PASS", "ĐẠT", "FAIL", "KHÔNG ĐẠT", etc.
   - Full Name:
     - Pattern: "Họ tên: Nguyễn Văn A"
     - Hoặc tìm chuỗi 2-4 từ, mỗi từ bắt đầu bằng chữ hoa
   - Evaluator:
     - Pattern: "Người đánh giá: Trần Thị B"
6. Cập nhật Evidence:
   ```java
   evidence.setOcrText(ocrResult.getOcrText())
   evidence.setOcrFullName(ocrResult.getOcrFullName())
   evidence.setOcrEvaluator(ocrResult.getOcrEvaluator())
   evidence.setOcrResult(ocrResult.getOcrResult()) // PASS hoặc FAIL
   
   evidenceRepository.save(evidence)
   ```

#### Bước 5: Client kiểm tra kết quả

Sau khi upload, client có thể:
1. Polling (thường xuyên kiểm tra):
   ```
   GET /v1/teacher/evidence/{id}
```

```java
{
  "id": "evidence-uuid",
  "teacherId": "teacher-123",
  "teacherName": "Nguyễn Văn A",
  "subjectId": "subject-456",
  "status": "PENDING",
  "ocrText": "PHIẾU ĐÁNH GIÁ GIẢNG DẠY\nHọ tên: Nguyễn Văn A\n...",
  "ocrFullName": "Nguyễn Văn A",
  "ocrEvaluator": "Trần Thị B",
  "ocrResult": "PASS",
  "submittedDate": "2024-01-15"
}
```

```json
{
  "id": "evidence-uuid",
  "teacherId": "teacher-123",
  "teacherName": "Nguyễn Văn A",
  "subjectId": "subject-456",
  "status": "PENDING",
  "ocrText": "PHIẾU ĐÁNH GIÁ GIẢNG DẠY\nHọ tên: Nguyễn Văn A\n...",
  "ocrFullName": "Nguyễn Văn A",
  "ocrEvaluator": "Trần Thị B",
  "ocrResult": "PASS",
  "submittedDate": "2024-01-15"
}
```

```java
POST /v1/teacher/evidence/{id}/verify
Body:
{
  "verifiedById": "admin-uuid",
  "approved": true  // true = VERIFIED, false = REJECTED
}
```

```plaintext
POST /v1/teacher/evidence/{id}/verify
Body:
{
  "verifiedById": "admin-uuid",
  "approved": true  // true = VERIFIED, false = REJECTED
}
```

```java
tesseract --version
# Kết quả: tesseract 5.x.x
```

```shellscript
tesseract --version
# Kết quả: tesseract 5.x.x
```

```plaintext
  tesseract.datapath=src/main/resources/tessdata
  ```

Cách 2: Dùng tessdata của Tesseract đã cài
- Nếu cài vào `C:\Program Files\Tesseract-OCR`
- Tessdata thường ở: `C:\Program Files\Tesseract-OCR\tessdata`
- Cấu hình:
  ```properties
  tesseract.datapath=C:/Program Files/Tesseract-OCR/tessdata
  ```

### Cấu trúc thư mục sau khi setup

```
teacher-service/
├── src/
│   └── main/
│       └── resources/
│           ├── tessdata/          ← Tạo thư mục này
│           │   ├── vie.traineddata  ← Download từ GitHub
│           │   └── eng.traineddata  ← Download từ GitHub
│           └── attachments/        ← File upload sẽ lưu ở đây
│               └── {uuid}
└── pom.xml
```

### Lưu ý quan trọng

1. Tessdata files:
   - `vie.traineddata`: cho tiếng Việt
   - `eng.traineddata`: cho tiếng Anh
   - Kích thước mỗi file ~10-20MB

2. Performance:
   - OCR 1 trang PDF ~2-5 giây
   - PDF 10 trang ~20-50 giây
   - Nên dùng async để không block request

3. Accuracy:
   - OCR không 100% chính xác
   - Cần cho phép admin chỉnh sửa OCR text
   - Chất lượng ảnh càng tốt, kết quả càng chính xác

4. Deployment:
   - Trên server, cần cài Tesseract tương tự
   - Hoặc dùng Docker image có sẵn Tesseract

Bạn muốn tôi giải thích thêm phần nào không?
```

```properties
  tesseract.datapath=src/main/resources/tessdata
  ```

Cách 2: Dùng tessdata của Tesseract đã cài
- Nếu cài vào `C:\Program Files\Tesseract-OCR`
- Tessdata thường ở: `C:\Program Files\Tesseract-OCR\tessdata`
- Cấu hình:
  ```properties
  tesseract.datapath=C:/Program Files/Tesseract-OCR/tessdata
  ```

### Cấu trúc thư mục sau khi setup

```
teacher-service/
├── src/
│   └── main/
│       └── resources/
│           ├── tessdata/          ← Tạo thư mục này
│           │   ├── vie.traineddata  ← Download từ GitHub
│           │   └── eng.traineddata  ← Download từ GitHub
│           └── attachments/        ← File upload sẽ lưu ở đây
│               └── {uuid}
└── pom.xml
```

### Lưu ý quan trọng

1. Tessdata files:
   - `vie.traineddata`: cho tiếng Việt
   - `eng.traineddata`: cho tiếng Anh
   - Kích thước mỗi file ~10-20MB

2. Performance:
   - OCR 1 trang PDF ~2-5 giây
   - PDF 10 trang ~20-50 giây
   - Nên dùng async để không block request

3. Accuracy:
   - OCR không 100% chính xác
   - Cần cho phép admin chỉnh sửa OCR text
   - Chất lượng ảnh càng tốt, kết quả càng chính xác

4. Deployment:
   - Trên server, cần cài Tesseract tương tự
   - Hoặc dùng Docker image có sẵn Tesseract

Bạn muốn tôi giải thích thêm phần nào không?
```

```json
{
  "id": "evidence-uuid",
  "teacherId": "teacher-123",
  "teacherName": "Nguyễn Văn A",
  "subjectId": "subject-456",
  "status": "PENDING",
  "ocrText": "PHIẾU ĐÁNH GIÁ GIẢNG DẠY\nHọ tên: Nguyễn Văn A\n...",
  "ocrFullName": "Nguyễn Văn A",
  "ocrEvaluator": "Trần Thị B",
  "ocrResult": "PASS",
  "submittedDate": "2024-01-15"
}
```

```plaintext
POST /v1/teacher/evidence/{id}/verify
Body:
{
  "verifiedById": "admin-uuid",
  "approved": true  // true = VERIFIED, false = REJECTED
}
```

```shellscript
tesseract --version
# Kết quả: tesseract 5.x.x
```

```properties
  tesseract.datapath=src/main/resources/tessdata
```

```properties
  tesseract.datapath=C:/Program Files/Tesseract-OCR/tessdata
```

```plaintext
teacher-service/
├── src/
│   └── main/
│       └── resources/
│           ├── tessdata/          ← Tạo thư mục này
│           │   ├── vie.traineddata  ← Download từ GitHub
│           │   └── eng.traineddata  ← Download từ GitHub
│           └── attachments/        ← File upload sẽ lưu ở đây
│               └── {uuid}
└── pom.xml
```

