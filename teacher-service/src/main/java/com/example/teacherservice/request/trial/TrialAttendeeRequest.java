package com.example.teacherservice.request.trial;

import com.example.teacherservice.enums.TrialAttendeeRole;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class    TrialAttendeeRequest {
    private String trialId;
    private String attendeeUserId;
    private String attendeeName;
    private TrialAttendeeRole attendeeRole;
}
