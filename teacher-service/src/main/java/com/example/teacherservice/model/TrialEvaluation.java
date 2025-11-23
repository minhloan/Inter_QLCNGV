package com.example.teacherservice.model;

import com.example.teacherservice.enums.TrialConclusion;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "trial_evaluations", indexes = {
        @Index(name = "idx_attendee_id", columnList = "attendee_id"),
        @Index(name = "idx_trial_id", columnList = "trial_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialEvaluation extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attendee_id", nullable = true) // Tạm thời cho phép NULL để tránh lỗi migration
    private TrialAttendee attendee;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "trial_id", nullable = false)
    private TrialTeaching trial;

    @Column(name = "score", nullable = false)
    private Integer score;

    @Column(name = "comments", columnDefinition = "TEXT")
    private String comments;

    @Enumerated(EnumType.STRING)
    @Column(name = "conclusion", nullable = false)
    private TrialConclusion conclusion;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_file_id")
    private File imageFile;
}

