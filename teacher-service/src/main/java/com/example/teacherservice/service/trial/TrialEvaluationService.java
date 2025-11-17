package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;

import java.util.List;

public interface TrialEvaluationService {
    TrialEvaluationDto createEvaluation(String trialId, Integer score, String comments, String conclusion);
    TrialEvaluationDto updateEvaluation(String trialId, Integer score, String comments, String conclusion);
    TrialEvaluationDto getEvaluationByTrialId(String trialId);
    List<TrialEvaluationDto> getAllEvaluations();
}
