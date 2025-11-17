package com.example.teacherservice.controller;

import com.example.teacherservice.dto.trial.TrialTeachingDto;
import com.example.teacherservice.enums.TrialStatus;
import com.example.teacherservice.request.trial.TrialTeachingRequest;
import com.example.teacherservice.service.trial.TrialTeachingService;
import com.example.teacherservice.service.trial.TrialEvaluationService;
import com.example.teacherservice.service.trial.TrialAttendeeService;
import com.example.teacherservice.jwt.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/teacher/trial")
@RequiredArgsConstructor
public class TrialTeachingController {

    private final TrialTeachingService trialTeachingService;
    private final TrialEvaluationService trialEvaluationService;
    private final TrialAttendeeService trialAttendeeService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<TrialTeachingDto> createTrial(
            @RequestBody TrialTeachingRequest request,
            HttpServletRequest httpRequest) {
        // Lấy teacherId từ JWT
        String teacherId = jwtUtil.ExtractUserId(httpRequest);
        request.setTeacherId(teacherId);
        TrialTeachingDto dto = trialTeachingService.createTrial(request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @PatchMapping("/{trialId}/status")
    public ResponseEntity<TrialTeachingDto> updateStatus(
            @PathVariable String trialId,
            @RequestParam(name = "status", required = true) TrialStatus status) {
        TrialTeachingDto dto = trialTeachingService.updateStatus(trialId, status);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TrialTeachingDto>> getMyTrials(HttpServletRequest httpRequest) {
        String teacherId = jwtUtil.ExtractUserId(httpRequest);
        List<TrialTeachingDto> trials = trialTeachingService.getTrialsByTeacher(teacherId);
        return ResponseEntity.ok(trials);
    }

    @GetMapping("/{trialId}")
    public ResponseEntity<TrialTeachingDto> getTrialById(@PathVariable String trialId) {
        TrialTeachingDto dto = trialTeachingService.getTrialById(trialId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping
    public ResponseEntity<List<TrialTeachingDto>> getAllTrials() {
        List<TrialTeachingDto> trials = trialTeachingService.getAllTrials();
        return ResponseEntity.ok(trials);
    }

    // Note: Evaluation endpoints are handled by TrialEvaluationController
    // Attendee endpoints are handled by TrialAttendeeController
    // These endpoints are duplicated and causing conflicts

    // File endpoints
    @PostMapping("/upload-trial-report")
    public ResponseEntity<Map<String, String>> uploadTrialReport(
            @RequestParam("file") MultipartFile file,
            @RequestParam("trialId") String trialId) {
        // Implementation would depend on file service
        // For now, return success
        Map<String, String> response = Map.of("message", "File uploaded successfully", "fileId", "dummy-file-id");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/download-trial-report/{fileId}")
    public ResponseEntity<byte[]> downloadTrialReport(@PathVariable String fileId) {
        // Implementation would depend on file service
        // For now, return empty response
        return ResponseEntity.ok(new byte[0]);
    }
}
