package com.example.teacherservice.dto.trial;

import com.example.teacherservice.enums.TrialConclusion;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TrialEvaluationDto {
    private String id;
    private String trialId;
    private Integer score;
    private String comments;
    private TrialConclusion conclusion;
    private String fileReportId;
}
