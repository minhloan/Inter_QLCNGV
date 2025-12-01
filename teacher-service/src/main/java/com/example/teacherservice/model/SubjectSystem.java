package com.example.teacherservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subject_systems", indexes = {
        @Index(name = "idx_system_code", columnList = "system_code"),
        @Index(name = "idx_is_active", columnList = "is_active")
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectSystem extends BaseEntity {

    @Column(name = "system_code", nullable = false, unique = true, length = 40)
    private String systemCode;

    @Column(name = "system_name", nullable = false, length = 100)
    private String systemName;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}