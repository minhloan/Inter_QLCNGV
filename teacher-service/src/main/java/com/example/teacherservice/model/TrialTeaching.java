package com.example.teacherservice.model;

import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.enums.TrialStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.List;

@Entity
@Table(name = "trial_teachings", indexes = {
        @Index(name = "idx_teacher_subject_date", columnList = "teacher_id,subject_id,teaching_date")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialTeaching extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "teaching_date", nullable = false)
    private LocalDate teachingDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private TrialStatus status = TrialStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "aptech_exam_id")
    private AptechExam aptechExam;

    @Column(name = "location", length = 100)
    private String location;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    @Column(name = "teaching_time")
    private String teachingTime;

    @Enumerated(EnumType.STRING)
    @Column(name = "final_result")
    private TrialConclusion finalResult;

    // Smart evaluation fields
    @Column(name = "average_score")
    private Integer averageScore;

    @Column(name = "has_red_flag")
    @Builder.Default
    private Boolean hasRedFlag = false;

    @Column(name = "needs_review")
    @Builder.Default
    private Boolean needsReview = false;

    @Column(name = "admin_override")
    @Builder.Default
    private Boolean adminOverride = false;

    @Column(name = "result_note", columnDefinition = "TEXT")
    private String resultNote;

    @OneToMany(mappedBy = "trial", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TrialAttendee> attendees;

    @OneToMany(mappedBy = "trial", fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    private List<TrialEvaluation> evaluations;
}