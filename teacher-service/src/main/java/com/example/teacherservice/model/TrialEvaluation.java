package com.example.teacherservice.model;

import com.example.teacherservice.enums.TrialConclusion;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trial_evaluations", indexes = {
    @Index(name = "idx_trial_id", columnList = "trial_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialEvaluation extends BaseEntity {
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_id", nullable = false, unique = true)
    private TrialTeaching trial;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(name = "conclusion", nullable = false)
    private TrialConclusion conclusion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_report_id")
    private File fileReport;
}

