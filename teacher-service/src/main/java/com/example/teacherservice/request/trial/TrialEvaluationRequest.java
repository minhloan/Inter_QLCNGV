package com.example.teacherservice.request.trial;

import com.example.teacherservice.enums.TrialConclusion;
import lombok.*;

import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialEvaluationRequest {
    private String attendeeId; // ID của TrialAttendee (người chấm)
    private String trialId; // ID của TrialTeaching (để validate)
    private Integer score;  // Điểm tổng (có thể để null, sẽ tự tính từ criteria)
    private String comments;
    private TrialConclusion conclusion;
    private String imageFileId;
    
    // Danh sách điểm chi tiết từng tiêu chí (1-1, 1-2, ..., 1-17)
    private List<CriterionScore> criteria;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CriterionScore {
        private String code;   // "1-1", "1-2", ..., "1-17"
        private Integer score; // 1..5
        private String comment; // comment riêng cho tiêu chí này (optional)
    }
}
