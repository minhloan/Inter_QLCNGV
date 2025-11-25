package com.example.teacherservice.controller;

import com.example.teacherservice.dto.trial.TrialTeachingDto;
import com.example.teacherservice.enums.TrialStatus;
import com.example.teacherservice.request.trial.AdminTrialOverrideRequest;
import com.example.teacherservice.request.trial.TrialTeachingRequest;
import com.example.teacherservice.service.trial.TrialTeachingService;
import com.example.teacherservice.jwt.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/trial")
@RequiredArgsConstructor
public class TrialTeachingController {

    private final TrialTeachingService trialTeachingService;
    private final JwtUtil jwtUtil;

    @PostMapping
    public ResponseEntity<TrialTeachingDto> createTrial(
            @RequestBody TrialTeachingRequest request
    ) {
        TrialTeachingDto dto = trialTeachingService.createTrial(request);
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<TrialTeachingDto>> getAllTrials() {
        List<TrialTeachingDto> trials = trialTeachingService.getAllTrials();
        return ResponseEntity.ok(trials);
    }

    @GetMapping("/my")
    public ResponseEntity<List<TrialTeachingDto>> getMyTrials(HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        List<TrialTeachingDto> trials = trialTeachingService.getTrialsByTeacher(teacherId);
        return ResponseEntity.ok(trials);
    }

    @GetMapping("/my-reviews")
    public ResponseEntity<List<TrialTeachingDto>> getMyReviews(HttpServletRequest request) {
        String evaluatorId = jwtUtil.ExtractUserId(request);
        List<TrialTeachingDto> trials = trialTeachingService.getTrialsForEvaluation(evaluatorId);
        return ResponseEntity.ok(trials);
    }

    @GetMapping("/{trialId}")
    public ResponseEntity<TrialTeachingDto> getTrialById(@PathVariable String trialId) {
        TrialTeachingDto dto = trialTeachingService.getTrialById(trialId);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{trialId}/status")
    public ResponseEntity<TrialTeachingDto> updateStatus(
            @PathVariable String trialId,
            @RequestParam("status") TrialStatus status
    ) {
        TrialTeachingDto dto = trialTeachingService.updateStatus(trialId, status);
        return ResponseEntity.ok(dto);
    }

    @PatchMapping("/{trialId}/finalize")
    public ResponseEntity<TrialTeachingDto> finalizeResult(
            @PathVariable String trialId,
            @RequestParam("result") String result
    ) {
        com.example.teacherservice.enums.TrialConclusion conclusion = 
            com.example.teacherservice.enums.TrialConclusion.valueOf(result.toUpperCase());
        TrialTeachingDto dto = trialTeachingService.finalizeResult(trialId, conclusion);
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/{trialId}/admin-override")
    public ResponseEntity<TrialTeachingDto> adminOverrideResult(
            @PathVariable String trialId,
            @RequestBody AdminTrialOverrideRequest request
    ) {
        TrialTeachingDto dto = trialTeachingService.adminOverrideResult(
                trialId,
                request.getFinalResult(),
                request.getResultNote()
        );
        return ResponseEntity.ok(dto);
    }
}