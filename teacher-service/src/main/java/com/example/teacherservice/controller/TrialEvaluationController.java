package com.example.teacherservice.controller;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.request.trial.TrialEvaluationRequest;
import com.example.teacherservice.service.trial.TrialEvaluationService;
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
public class TrialEvaluationController {

    private final TrialEvaluationService trialEvaluationService;
    private final JwtUtil jwtUtil;

    @PostMapping("/evaluate")
    public ResponseEntity<TrialEvaluationDto> evaluateTrial(
            @RequestBody TrialEvaluationRequest request,
            HttpServletRequest httpRequest
    ) {
        String currentUserId = jwtUtil.ExtractUserId(httpRequest);
        
        // Nếu có criteria chi tiết, dùng method mới
        if (request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            TrialEvaluationDto dto = trialEvaluationService.createEvaluationWithDetails(request, currentUserId);
            return new ResponseEntity<>(dto, HttpStatus.CREATED);
        }
        
        // Nếu không có criteria, dùng method cũ (backward compatible)
        TrialEvaluationDto dto = trialEvaluationService.createEvaluation(
                request.getAttendeeId(),
                request.getTrialId(),
                request.getScore(),
                request.getComments(),
                request.getConclusion() != null ? request.getConclusion().toString() : "FAIL",
                request.getImageFileId(),
                currentUserId
        );
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping("/evaluation/attendee/{attendeeId}")
    public ResponseEntity<TrialEvaluationDto> getEvaluationByAttendee(@PathVariable String attendeeId) {
        TrialEvaluationDto dto = trialEvaluationService.getEvaluationByAttendeeId(attendeeId);
        return ResponseEntity.ok(dto);
    }

    @GetMapping("/evaluation/trial/{trialId}")
    public ResponseEntity<List<TrialEvaluationDto>> getEvaluationsByTrial(@PathVariable String trialId) {
        List<TrialEvaluationDto> evaluations = trialEvaluationService.getEvaluationsByTrialId(trialId);
        return ResponseEntity.ok(evaluations);
    }
}
