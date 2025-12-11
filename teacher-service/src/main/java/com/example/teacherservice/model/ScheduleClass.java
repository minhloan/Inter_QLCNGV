package com.example.teacherservice.model;

import com.example.teacherservice.enums.Quarter;
import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "schedule_classes", indexes = {
        @Index(name = "idx_class_code", columnList = "class_code"),
        @Index(name = "idx_subject_id", columnList = "subject_id"),
        @Index(name = "idx_year_quarter", columnList = "year,quarter")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ScheduleClass extends BaseEntity {

    @Column(name = "class_code", nullable = false, unique = true, length = 50)
    private String classCode; // DISM-2024-01

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @Column(name = "year", nullable = false)
    private Integer year;          // 2024

    @Enumerated(EnumType.STRING)
    @Column(name = "quarter", nullable = false)
    private Quarter quarter;       // QUY1, QUY2...

    @Column(name = "location", length = 100)
    private String location;  // phòng học

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    // nhiều buổi học
    @OneToMany(
            mappedBy = "scheduleClass",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<ScheduleSlot> slots = new ArrayList<>();

    public String getClassName() {
        return classCode;
    }


    public java.time.LocalDate getStartDate() {
        if (year == null || quarter == null) return null;
        return switch (quarter) {
            case QUY1 -> java.time.LocalDate.of(year, 1, 1);
            case QUY2 -> java.time.LocalDate.of(year, 4, 1);
            case QUY3 -> java.time.LocalDate.of(year, 7, 1);
            case QUY4 -> java.time.LocalDate.of(year, 10, 1);
        };
    }

    public java.time.LocalDate getEndDate() {
        if (year == null || quarter == null) return null;
        return switch (quarter) {
            case QUY1 -> java.time.LocalDate.of(year, 3, 31);
            case QUY2 -> java.time.LocalDate.of(year, 6, 30);
            case QUY3 -> java.time.LocalDate.of(year, 9, 30);
            case QUY4 -> java.time.LocalDate.of(year, 12, 31);
        };
    }
}
