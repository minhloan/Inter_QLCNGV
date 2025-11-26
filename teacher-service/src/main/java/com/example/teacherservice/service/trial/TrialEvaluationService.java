package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.request.trial.TrialEvaluationRequest;

import java.util.List;

public interface TrialEvaluationService {
    TrialEvaluationDto createEvaluation(String attendeeId, String trialId, Integer score, String comments, String conclusion, String imageFileId, String currentUserId);
    
    // Method mới: nhận TrialEvaluationRequest (có thể có criteria chi tiết)
    TrialEvaluationDto createEvaluationWithDetails(TrialEvaluationRequest request, String currentUserId);
    
    TrialEvaluationDto updateEvaluation(String evaluationId, Integer score, String comments, String conclusion, String imageFileId);
    
    // Method mới: update với details
    TrialEvaluationDto updateEvaluationWithDetails(String evaluationId, TrialEvaluationRequest request);
    
    TrialEvaluationDto getEvaluationByAttendeeId(String attendeeId);
    List<TrialEvaluationDto> getEvaluationsByTrialId(String trialId);
    List<TrialEvaluationDto> getAllEvaluations();
}
