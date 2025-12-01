package com.example.teacherservice.model;

import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.enums.RegistrationStatus;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_registrations", indexes = {
        @Index(name = "UQ_SubjectRegistration", columnList = "teacher_id,subject_id,year,quarter", unique = true),
        @Index(name = "idx_teacher_year_quarter", columnList = "teacher_id,year,quarter"),
        @Index(name = "idx_subject_year_quarter", columnList = "subject_id,year,quarter"),
        @Index(name = "idx_year_quarter", columnList = "year,quarter"),
        @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectRegistration extends BaseEntity {
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "year", nullable = false)
    private Integer year;

    @Column(name = "quarter", nullable = false)
    @Enumerated(EnumType.STRING)
    private Quarter quarter;

    // GIỮ NGUYÊN — Hình thức chuẩn bị
    @Column(name = "reason_for_carry_over", columnDefinition = "TEXT")
    private String reasonForCarryOver;

    // TRƯỜNG MỚI — Lý do dời môn
    @Column(name = "reason_for_carry_over2", columnDefinition = "TEXT")
    private String reasonForCarryOver2;

    // TRƯỜNG MỚI — Ghi chú của giáo viên
    @Column(name = "teacher_notes", columnDefinition = "TEXT")
    private String teacherNotes;


    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private RegistrationStatus status = RegistrationStatus.REGISTERED;

}