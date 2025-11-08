package com.example.teacherservice.model;

import com.example.teacherservice.enums.TrialStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

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
}

