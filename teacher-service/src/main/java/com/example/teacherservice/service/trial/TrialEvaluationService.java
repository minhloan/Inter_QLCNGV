package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;

import java.util.List;

public interface TrialEvaluationService {
    TrialEvaluationDto createEvaluation(String attendeeId, String trialId, Integer score, String comments, String conclusion, String imageFileId, String currentUserId);
    TrialEvaluationDto updateEvaluation(String evaluationId, Integer score, String comments, String conclusion, String imageFileId);
    TrialEvaluationDto getEvaluationByAttendeeId(String attendeeId);
    List<TrialEvaluationDto> getEvaluationsByTrialId(String trialId);
    List<TrialEvaluationDto> getAllEvaluations();
}
