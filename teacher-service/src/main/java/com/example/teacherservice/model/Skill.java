package com.example.teacherservice.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "skills", 
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_skill_code", columnNames = "skill_code")
    },
    indexes = {
        @Index(name = "idx_skill_code", columnList = "skill_code"),
        @Index(name = "idx_skill_is_active", columnList = "is_active")
    })
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Skill extends BaseEntity {

    @Column(name = "skill_code", length = 50, nullable = false)
    private String skillCode;

    @Column(name = "skill_name", length = 500)
    private String skillName;

    @Builder.Default
    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
    
    @Builder.Default
    @Column(name = "is_new", nullable = false)
    private Boolean isNew = false;
}
