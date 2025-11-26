package com.example.teacherservice.dto.trial;

import com.example.teacherservice.enums.TrialConclusion;
import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class TrialEvaluationDto {
    private String id;
    private String trialId;
    private String attendeeId;
    private String attendeeName;
    private String attendeeRole;
    private String evaluatorUserId;
    private Integer score;
    private String comments;
    private TrialConclusion conclusion;
    private String imageFileId;
    
    // Danh sách điểm chi tiết từng tiêu chí
    private List<TrialEvaluationItemDto> items;
}

