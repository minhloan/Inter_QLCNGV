package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialTeachingDto;
import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.enums.TrialStatus;
import com.example.teacherservice.request.trial.TrialTeachingRequest;

import java.util.List;


public interface TrialTeachingService {

    TrialTeachingDto createTrial(TrialTeachingRequest request);
    TrialTeachingDto updateStatus(String trialId, TrialStatus status);
    TrialTeachingDto finalizeResult(String trialId, TrialConclusion finalResult);
    
    // Smart evaluation methods
    void recalculateTrialResult(String trialId);
    TrialTeachingDto adminOverrideResult(String trialId, TrialConclusion finalResult, String resultNote);
    
    // Query methods
    List<TrialTeachingDto> getAllTrials();
    List<TrialTeachingDto> getTrialsByTeacher(String teacherId);
    List<TrialTeachingDto> getTrialsForEvaluation(String evaluatorUserId);
    TrialTeachingDto getTrialById(String id);
    
    // Date filtering methods for statistics
    List<TrialTeachingDto> getTrialsByDateRange(java.time.LocalDate startDate, java.time.LocalDate endDate);
    List<TrialTeachingDto> getTrialsByMonth(Integer year, Integer month);
    List<TrialTeachingDto> getTrialsByYear(Integer year);
}
