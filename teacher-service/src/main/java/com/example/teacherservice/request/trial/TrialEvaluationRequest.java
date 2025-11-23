package com.example.teacherservice.request.trial;

import com.example.teacherservice.enums.TrialConclusion;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialEvaluationRequest {
    private String attendeeId; // ID của TrialAttendee (người chấm)
    private String trialId; // ID của TrialTeaching (để validate)
    private Integer score;
    private String comments;
    private TrialConclusion conclusion;
    private String imageFileId;
}
