package com.example.teacherservice.dto.trial;

import com.example.teacherservice.enums.TrialAttendeeRole;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrialAttendeeDto {
    private String id;
    private String trialId;
    private String attendeeUserId;
    private String attendeeName;
    private TrialAttendeeRole attendeeRole;
    private String position; // Chức vụ của người đánh giá
}
