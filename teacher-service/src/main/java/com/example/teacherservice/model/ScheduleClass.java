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
}
