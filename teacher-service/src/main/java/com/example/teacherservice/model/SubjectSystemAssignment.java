package com.example.teacherservice.model;

import com.example.teacherservice.enums.Semester;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_system_assignments",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_subject_system", columnNames = {"subject_id", "system_id"})
        },
        indexes = {
                @Index(name = "idx_assignment_subject", columnList = "subject_id"),
                @Index(name = "idx_assignment_system", columnList = "system_id")
        })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectSystemAssignment extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_id", nullable = false)
    private Subject subject;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "system_id", nullable = false)
    private SubjectSystem system;

    @Enumerated(EnumType.STRING)
    @Column(name = "semester")
    private Semester semester;

    @Column(name = "hours")
    private Integer hours;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @Column(name = "note", length = 500)
    private String note;
}

