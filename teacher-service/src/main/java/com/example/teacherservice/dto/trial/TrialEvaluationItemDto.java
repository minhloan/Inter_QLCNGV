package com.example.teacherservice.dto.trial;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialEvaluationItemDto {
    private String id;
    private String evaluationId;
    private String criterionCode;   // "1-1", "1-2", ..., "1-17"
    private String criterionLabel;
    private Integer score;          // 1..5
    private Integer orderIndex;
    private String comment;
}

