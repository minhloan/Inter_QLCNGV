package com.example.teacherservice.controller;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.request.trial.TrialEvaluationRequest;
import com.example.teacherservice.service.trial.TrialEvaluationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/teacher/trial")
@RequiredArgsConstructor
public class TrialEvaluationController {

    private final TrialEvaluationService trialEvaluationService;

    @PostMapping("/evaluate")
    public ResponseEntity<TrialEvaluationDto> evaluateTrial(@RequestBody TrialEvaluationRequest request) {
        TrialEvaluationDto dto = trialEvaluationService.createEvaluation(
                request.getTrialId(),
                request.getScore(),
                request.getComments(),
                request.getConclusion().toString(),
                request.getImageFileId()
        );
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping("/evaluation/{trialId}")
    public ResponseEntity<TrialEvaluationDto> getTrialEvaluation(@PathVariable String trialId) {
        TrialEvaluationDto dto = trialEvaluationService.getEvaluationByTrialId(trialId);
        return ResponseEntity.ok(dto);
    }
}
