package com.example.teacherservice.controller;

import com.example.teacherservice.dto.aptech.AptechExamDto;
import com.example.teacherservice.dto.aptech.AptechExamHistoryDto;
import com.example.teacherservice.dto.aptech.AptechExamSessionDto;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.model.File;
import com.example.teacherservice.request.AptechExamRegisterRequest;
import com.example.teacherservice.service.aptech.AptechExamService;
import com.example.teacherservice.service.file.FileService;
import com.example.teacherservice.dto.aptech.AptechExamScoreUpdateDto;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/aptech-exam")
@RequiredArgsConstructor
public class AptechExamController {

    private final AptechExamService examService;
    private final FileService fileService;
    private final JwtUtil jwtUtil;

    // ========================
    // TEACHER APIs
    // ========================
    @Autowired
    private AptechExamService aptechExamService;


    @GetMapping
    public ResponseEntity<List<AptechExamDto>> getExamsByTeacher(HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        return ResponseEntity.ok(examService.getExamsByTeacher(teacherId));
    }

    @GetMapping("/history/{subjectId}")
    public ResponseEntity<List<AptechExamHistoryDto>> getExamHistory(
            @PathVariable String subjectId, HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        return ResponseEntity.ok(examService.getExamHistory(teacherId, subjectId));
    }

    @PostMapping("/{examId}/certificate")
    public ResponseEntity<Void> uploadCertificate(
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
            return ResponseEntity.badRequest().build();
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
    @PutMapping("/{id}/score")
    public ResponseEntity<?> updateScore(@PathVariable String id, @RequestBody AptechExamScoreUpdateDto request) {
        aptechExamService.updateScore(id, request.getScore(), request.getResult());
        return ResponseEntity.ok("Score updated");
    }

    @PutMapping("/admin/{id}/status")
    public ResponseEntity<?> adminUpdateStatus(@PathVariable String id, @RequestBody java.util.Map<String, String> req) {
        String status = req.get("status");
        if (status == null) return ResponseEntity.badRequest().body("Missing status");
        aptechExamService.updateStatus(id, status);
        return ResponseEntity.ok("Status updated");
    }



}
