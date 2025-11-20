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
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.service.file.FileService;
import com.example.teacherservice.service.ocr.OCRService;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EvidenceServiceImpl implements EvidenceService {

    private final EvidenceRepository evidenceRepository;
    private final FileService fileService;
    private final OCRService ocrService;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

    @Override
    public EvidenceResponseDTO uploadEvidence(EvidenceDTO dto, MultipartFile file) {

        // 1. Validate teacher exists
        User teacher = userRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Teacher not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());

        // 2. Validate subject exists
        if (dto.getSubjectId() == null || dto.getSubjectId().isBlank()) {
            throw GenericErrorResponse.builder()
                    .message("Subject ID is required")
                    .httpStatus(HttpStatus.BAD_REQUEST)
                    .build();
        }
        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Subject not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());

        // 3. Upload file
        String fileId = fileService.uploadImageToFileSystem(file);
        File fileEntity = fileService.findFileById(fileId);

        // 4. Create Evidence entity
        Evidence evidence = Evidence.builder()
                .teacher(teacher)
                .subject(subject)
                .file(fileEntity)
                .submittedDate(dto.getSubmittedDate() != null
                        ? LocalDate.parse(dto.getSubmittedDate())
                        : LocalDate.now())
                .status(EvidenceStatus.PENDING)
                .build();

        evidence = evidenceRepository.save(evidence);

        // 5. Trigger async OCR processing
        processOCRAsync(evidence.getId());

        return convertToDTO(evidence);
    }

    @Override
    @Transactional
    public EvidenceResponseDTO findById(String id) {
        Evidence evidence = evidenceRepository.findById(id)
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Evidence not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());

        return convertToDTO(evidence);
    }

    @Override
    @Transactional
    public List<EvidenceResponseDTO> findByTeacherId(String teacherId) {
        List<Evidence> evidences = evidenceRepository.findByTeacherId(teacherId);
        return evidences.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public List<EvidenceResponseDTO> findByStatus(String status) {
        EvidenceStatus evidenceStatus = EvidenceStatus.valueOf(status.toUpperCase());
        List<Evidence> evidences = evidenceRepository.findByStatus(evidenceStatus);
        return evidences.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
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
    public EvidenceResponseDTO verifyEvidence(String id, String verifiedById, boolean approved) {
        Evidence evidence = evidenceRepository.findById(id)
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("Evidence not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());
        User verifier = userRepository.findById(verifiedById)
                .orElseThrow(() -> GenericErrorResponse.builder()
                        .message("User not found")
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build());

        evidence.setVerifiedBy(verifier);
        evidence.setVerifiedAt(java.time.LocalDateTime.now());
        evidence.setStatus(approved ? EvidenceStatus.VERIFIED : EvidenceStatus.REJECTED);

        return convertToDTO(evidenceRepository.save(evidence));
    }

    @Override
    @Async
    public void processOCRAsync(String evidenceId) {

        try {
            Evidence evidence = evidenceRepository.findById(evidenceId)
                    .orElseThrow(() -> {
                        return GenericErrorResponse.builder()
                                .message("Evidence not found")
                                .httpStatus(HttpStatus.NOT_FOUND)
                                .build();
                    });

            // Get file
            File fileEntity = evidence.getFile();
            if (fileEntity == null) {
                return;
            }

            // Check if physical file exists
            java.io.File physicalFile = new java.io.File(fileEntity.getFilePath());
            if (!physicalFile.exists()) {
                return;
            }

            // Process OCR
            try {
                OCRResultDTO ocrResult = ocrService.processFile(fileEntity);

                // Update Evidence with OCR results
                if (ocrResult != null) {
                    evidence.setOcrText(ocrResult.getOcrText());
                    evidence.setOcrFullName(ocrResult.getOcrFullName());
                    evidence.setOcrEvaluator(ocrResult.getOcrEvaluator());
                    evidence.setOcrResult(ocrResult.getOcrResult());
                }

                evidenceRepository.save(evidence);

            } catch (Error e) {
                evidence.setOcrText("OCR processing failed: " + e.getMessage());
                evidenceRepository.save(evidence);
            } catch (Exception e) {
                // Save evidence without OCR results
                evidence.setOcrText("OCR processing failed: " + e.getMessage());
                evidenceRepository.save(evidence);
            }

        } catch (Exception e) {
            try {
                Evidence evidence = evidenceRepository.findById(evidenceId).orElse(null);
                if (evidence != null) {
                    evidence.setOcrText("OCR processing failed: " + e.getMessage());
                    evidenceRepository.save(evidence);
                }
            } catch (Exception ex) {
            }
        }
    }

    @Override
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
                .teacherName(
                        evidence.getTeacher() != null && evidence.getTeacher().getUserDetails() != null
                                ? evidence.getTeacher().getUsername()
                                : null
                )
                .subjectId(evidence.getSubject() != null ? evidence.getSubject().getId() : null)
                .subjectName(evidence.getSubject() != null ? evidence.getSubject().getSubjectName() : null)
                .fileId(evidence.getFile() != null ? evidence.getFile().getId() : null)
                .ocrText(evidence.getOcrText())
                .ocrFullName(evidence.getOcrFullName())
                .ocrEvaluator(evidence.getOcrEvaluator())
                .ocrResult(evidence.getOcrResult())
                .status(evidence.getStatus())
                .submittedDate(evidence.getSubmittedDate())
                .verifiedById(evidence.getVerifiedBy() != null ? evidence.getVerifiedBy().getId() : null)
                .verifiedByName(
                        evidence.getVerifiedBy() != null && evidence.getVerifiedBy().getUserDetails() != null
                                ? evidence.getVerifiedBy().getUsername()
                                : null
                )
                .verifiedAt(evidence.getVerifiedAt())
                .creationTimestamp(evidence.getCreationTimestamp())
                .updateTimestamp(evidence.getUpdateTimestamp())
                .build();
    }
}
