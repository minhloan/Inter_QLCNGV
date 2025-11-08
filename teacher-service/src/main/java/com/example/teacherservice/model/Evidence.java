package com.example.teacherservice.model;

import com.example.teacherservice.enums.EvidenceStatus;
import com.example.teacherservice.enums.ExamResult;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "evidence", indexes = {
    @Index(name = "idx_teacher_subject_date", columnList = "teacher_id,subject_id,submitted_date"),
    @Index(name = "idx_status", columnList = "status"),
    @Index(name = "idx_verified_by", columnList = "verified_by"),
    @Index(name = "idx_verified_at", columnList = "verified_at")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Evidence extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private File file;

    @Column(name = "ocr_full_name", length = 100)
    private String ocrFullName;

    @Column(name = "ocr_evaluator", length = 100)
    private String ocrEvaluator;

    @Enumerated(EnumType.STRING)
    @Column(name = "ocr_result")
    private ExamResult ocrResult;

    @Column(name = "ocr_text", columnDefinition = "TEXT")
    private String ocrText;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private EvidenceStatus status = EvidenceStatus.PENDING;

    @Column(name = "submitted_date")
    private LocalDate submittedDate;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "verified_by")
    private User verifiedBy;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;
}

