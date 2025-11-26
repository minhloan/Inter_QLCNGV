package com.example.teacherservice.controller;

import com.example.teacherservice.dto.aptech.AptechExamDto;
import com.example.teacherservice.dto.aptech.AptechExamHistoryDto;
import com.example.teacherservice.dto.aptech.AptechExamSessionDto;
import com.example.teacherservice.dto.aptech.AptechOCRResponseDto;
import com.example.teacherservice.dto.evidence.OCRResultDTO;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.model.File;
import com.example.teacherservice.request.AptechExamRegisterRequest;
import com.example.teacherservice.service.aptech.AptechExamService;
import com.example.teacherservice.service.file.FileService;
import com.example.teacherservice.service.ocr.OCRService;
import com.example.teacherservice.dto.aptech.AptechExamScoreUpdateDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/v1/teacher/aptech-exam")
@RequiredArgsConstructor
@Slf4j
public class AptechExamController {

    private final AptechExamService examService;
    private final FileService fileService;
    private final OCRService ocrService;
    private final JwtUtil jwtUtil;

    // ========================
    // TEACHER APIs
    // ========================
    @GetMapping
    public ResponseEntity<List<AptechExamDto>> getExamsByTeacher(HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        return ResponseEntity.ok(examService.getExamsByTeacher(teacherId));
    }

    @GetMapping("/{examId}")
    public ResponseEntity<AptechExamDto> getExamById(
            @PathVariable String examId,
            HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        try {
            AptechExamDto exam = examService.getExamForTeacher(examId, teacherId);
            return ResponseEntity.ok(exam);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/history/{subjectId}")
    public ResponseEntity<List<AptechExamHistoryDto>> getExamHistory(
            @PathVariable String subjectId, HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        return ResponseEntity.ok(examService.getExamHistory(teacherId, subjectId));
    }

    @PostMapping("/{examId}/exam-proof")
    public ResponseEntity<?> uploadExamProof(
            @PathVariable String examId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        boolean validExam = examService.getExamsByTeacher(teacherId)
                .stream().anyMatch(e -> e.getId().equals(examId));

        if (!validExam) return ResponseEntity.badRequest().build();

        try {
            // 1. Save file physically
            File savedFile = fileService.saveFile(file, "exam-proofs");
            
            // 2. Run OCR to extract Aptech certificate info
            OCRResultDTO ocrResult = ocrService.processAptechCertificate(savedFile);
            
            // 3. Upload certificate with OCR data and get response
            AptechOCRResponseDto response = examService.uploadExamProofWithOCR(examId, savedFile, ocrResult);
            
            // 4. Return OCR results to frontend for auto-fill
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to upload exam proof for exam {}", examId, e);
            return ResponseEntity.badRequest()
                .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{examId}/certificate")
    public ResponseEntity<?> uploadFinalCertificate(
            @PathVariable String examId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        boolean validExam = examService.getExamsByTeacher(teacherId)
                .stream().anyMatch(e -> e.getId().equals(examId));

        if (!validExam) return ResponseEntity.badRequest().build();

        try {
            File savedFile = fileService.saveFile(file, "certificates");
            examService.uploadCertificate(examId, savedFile);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            log.error("Failed to upload final certificate for exam {}", examId, e);
            return ResponseEntity.badRequest()
                    .body(java.util.Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{examId}/certificate")
    public ResponseEntity<Resource> downloadCertificate(
            @PathVariable String examId, HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        boolean validExam = examService.getExamsByTeacher(teacherId)
                .stream().anyMatch(e -> e.getId().equals(examId));

        if (!validExam) return ResponseEntity.notFound().build();

        try {
            File certificate = examService.downloadCertificate(examId);
            Resource resource = fileService.loadFileAsResource(certificate.getFilePath());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + certificate.getOriginalFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PostMapping("/register")
    public ResponseEntity<AptechExamDto> registerExam(
            @RequestBody AptechExamRegisterRequest req, HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        AptechExamDto exam = examService.registerExam(
                teacherId, req.getSessionId(), req.getSubjectId());
        return ResponseEntity.ok(exam);
    }

    // ========================
    // ADMIN APIs
    // ========================
    @GetMapping("/all")
    public ResponseEntity<List<AptechExamDto>> getAllExams() {
        return ResponseEntity.ok(examService.getAllExams());
    }

    /**
     * ADMIN / REVIEWER VIEW:
     * Lấy danh sách kỳ thi Aptech của một giáo viên bất kỳ (dùng trong màn quản lý,
     * xem chứng nhận & bằng của giáo viên được phân công / giảng thử).
     */
    @GetMapping("/admin/teacher/{teacherId}")
    public ResponseEntity<List<AptechExamDto>> getExamsByTeacherForAdmin(
            @PathVariable String teacherId
    ) {
        return ResponseEntity.ok(examService.getExamsByTeacher(teacherId));
    }

    @GetMapping("/sessions")
    public ResponseEntity<List<AptechExamSessionDto>> getAllSessions() {
        return ResponseEntity.ok(examService.getAllSessions());
    }

    @PostMapping("/admin/{examId}/certificate")
    public ResponseEntity<Void> adminUploadCertificate(
            @PathVariable String examId, @RequestParam("file") MultipartFile file) {
        try {
            File savedFile = fileService.saveFile(file, "certificates");
            examService.uploadCertificate(examId, savedFile);
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @GetMapping("/admin/{examId}/certificate")
    public ResponseEntity<Resource> adminDownloadCertificate(@PathVariable String examId) {
        try {
            File certificate = examService.downloadCertificate(examId);
            Resource resource = fileService.loadFileAsResource(certificate.getFilePath());
            return ResponseEntity.ok()
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .header(HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + certificate.getOriginalFileName() + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/export/list")
    public ResponseEntity<?> exportExamList(
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String generatedBy) {
        try {
            byte[] document = examService.exportExamListDocument(sessionId, generatedBy);
            HttpHeaders headers = buildDocxHeaders("BM06.35-Danh_sach_thi_chung_nhan.docx");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            log.error("Failed to export Aptech exam list document", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/export/summary")
    public ResponseEntity<?> exportExamSummary(
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String generatedBy) {
        try {
            byte[] document = examService.exportExamSummaryDocument(sessionId, generatedBy);
            HttpHeaders headers = buildDocxHeaders("BM06.36-Tong_hop_ket_qua_thi.docx");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            log.error("Failed to export Aptech exam summary document", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }

    @GetMapping("/export/stats")
    public ResponseEntity<?> exportExamStats(
            @RequestParam(required = false) String sessionId,
            @RequestParam(required = false) String generatedBy) {
        try {
            byte[] document = examService.exportExamStatsDocument(sessionId, generatedBy);
            HttpHeaders headers = buildDocxHeaders("BM06.37-Thong_ke_giao_vien_thi.docx");
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (IOException e) {
            log.error("Failed to export Aptech exam stats document", e);
            return ResponseEntity.internalServerError().body(e.getMessage());
        }
    }
    @PutMapping("/{id}/score")
    public ResponseEntity<?> updateScore(@PathVariable String id, @RequestBody AptechExamScoreUpdateDto request) {
        examService.updateScore(id, request.getScore(), request.getResult());
        return ResponseEntity.ok("Score updated");
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> adminUpdateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> req) {
        String status = req.get("status");
        if (status == null) return ResponseEntity.badRequest().body("Missing status");
        examService.updateStatus(id, status);
        return ResponseEntity.ok("Status updated");
    }

    private HttpHeaders buildDocxHeaders(String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.parseMediaType(
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
        headers.set(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"");
        return headers;
    }

}
