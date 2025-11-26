package com.example.teacherservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trial_evaluation_items", indexes = {
        @Index(name = "idx_evaluation_id", columnList = "evaluation_id"),
        @Index(name = "idx_criterion_code", columnList = "criterion_code")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialEvaluationItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    private TrialEvaluation evaluation;

    @Column(name = "criterion_code", length = 20, nullable = false)
    private String criterionCode;   // "1-1", "1-2", "1-3", ..., "1-17"

    @Column(name = "criterion_label", columnDefinition = "TEXT")
    private String criterionLabel;  // text mô tả (optional, có thể lưu để đảm bảo)

    @Column(name = "score", nullable = false)
    private Integer score;          // 1..5

    @Column(name = "order_index")
    private Integer orderIndex;     // để sort theo thứ tự (1, 2, 3, ...)

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;         // comment riêng cho tiêu chí này (optional)
}

