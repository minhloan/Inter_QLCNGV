package com.example.teacherservice.model;

import com.example.teacherservice.enums.AptechStatus;
import com.example.teacherservice.enums.ExamResult;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Table(name = "aptech_exams", indexes = {
        @Index(name = "UQ_Exam_Session_Teacher_Subject_Attempt",
                columnList = "session_id,teacher_id,subject_id,attempt", unique = true),
        @Index(name = "UQ_Exam_Teacher_Subject_Attempt",
                columnList = "teacher_id,subject_id,attempt", unique = true),
        @Index(name = "idx_teacher_subject", columnList = "teacher_id,subject_id"),
        @Index(name = "idx_result", columnList = "result")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptechExam extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private AptechExamSession session;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "attempt", nullable = false)
    @Builder.Default
    private Integer attempt = 1;

    @Column(name = "score")
    private Integer score;

    @Enumerated(EnumType.STRING)
    @Column(name = "result")
    private ExamResult result;

    @Enumerated(EnumType.STRING)
    @Column(name = "aptech_status")
    @Builder.Default
    private AptechStatus aptechStatus = AptechStatus.PENDING;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_proof_file_id")
    private File examProofFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "certificate_file_id")
    private File certificateFile;

    @Column(name = "exam_date")
    private LocalDate examDate;
    
    // OCR extraction fields for verification and debugging
    @Column(name = "ocr_raw_text", columnDefinition = "TEXT")
    private String ocrRawText;
    
    @Column(name = "ocr_extracted_name", length = 255)
    private String ocrExtractedName;
    
    @Column(name = "ocr_subject_code", length = 100)
    private String ocrSubjectCode;
}

