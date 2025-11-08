package com.example.teacherservice.model;

import com.example.teacherservice.enums.SubjectSystem;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects", indexes = {
    @Index(name = "idx_subject_name", columnList = "subject_name"),
    @Index(name = "idx_system", columnList = "system"),
    @Index(name = "idx_is_active", columnList = "is_active")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subject extends BaseEntity {
    @Column(name = "subject_code", nullable = false, unique = true, length = 20)
    private String subjectCode;

    @Column(name = "subject_name", nullable = false, length = 100)
    private String subjectName;

    @Column(name = "credit")
    private Integer credit;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "system")
    private SubjectSystem system;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;
}

