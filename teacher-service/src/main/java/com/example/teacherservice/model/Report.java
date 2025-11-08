package com.example.teacherservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "reports", indexes = {
    @Index(name = "idx_teacher_year_quarter", columnList = "teacher_id,year,quarter"),
    @Index(name = "idx_report_type", columnList = "report_type"),
    @Index(name = "idx_status", columnList = "status")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Report extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private User teacher;

    @Column(name = "year")
    private Integer year;

    @Column(name = "quarter")
    private Integer quarter;

    @Column(name = "report_type", nullable = false, length = 30)
    private String reportType; // QUARTER / YEAR / APTECH / TRIAL

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "file_id")
    private File file;

    @Column(name = "params_json", columnDefinition = "TEXT")
    private String paramsJson;

    @Column(name = "status", length = 20)
    private String status; // GENERATED / FAILED

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "generated_by")
    private User generatedBy;
}

