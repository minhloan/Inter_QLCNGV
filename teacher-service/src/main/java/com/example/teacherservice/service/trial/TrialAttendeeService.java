package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialAttendeeDto;
import com.example.teacherservice.dto.trial.TrialTeachingDto;

import java.util.List;

public interface TrialAttendeeService {
    TrialAttendeeDto addAttendee(String trialId, String attendeeName, String attendeeRole, String attendeeUserId);
    List<TrialAttendeeDto> getAttendeesByTrial(String trialId);
    List<TrialAttendeeDto> getMyAttendees(String userId);
    void removeAttendee(String attendeeId);
}
