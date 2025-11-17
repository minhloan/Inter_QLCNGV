package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialTeachingDto;
import com.example.teacherservice.enums.TrialStatus;
import com.example.teacherservice.request.trial.TrialTeachingRequest;

import java.util.List;


public interface TrialTeachingService {

    TrialTeachingDto createTrial(TrialTeachingRequest request);
    TrialTeachingDto updateStatus(String trialId, TrialStatus status);
    List<TrialTeachingDto> getAllTrials();
    List<TrialTeachingDto> getTrialsByTeacher(String teacherId);
    TrialTeachingDto getTrialById(String id);
}
