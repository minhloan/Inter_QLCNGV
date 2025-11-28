package com.example.teacherservice.model;

import com.example.teacherservice.enums.Semester;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

import java.util.LinkedHashSet;
import java.util.Set;

@Entity
@Table(name = "subjects", indexes = {
        @Index(name = "idx_subject_name", columnList = "subject_name"),
        @Index(name = "idx_system_id", columnList = "system_id"),
        @Index(name = "idx_is_active", columnList = "is_active"),
        @Index(name = "idx_skill_id", columnList = "skill_id")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subject extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "skill_id")
    private Skill skill;

    @Column(name = "subject_name", length = 200)
    private String subjectName;

    @Column(name = "hours")
    private Integer hours;

    @Enumerated(EnumType.STRING)
    @Column(name = "semester")
    private Semester semester;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "system_id")
    @JsonIgnore
    private SubjectSystem system;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "image_subject")
    @JsonIgnore
    private File image_subject;

    @Column(name = "is_new_subject")
    @Builder.Default
    private Boolean isNewSubject = false;

    @OneToMany(mappedBy = "subject", cascade = CascadeType.ALL, orphanRemoval = false)
    @Builder.Default
    @JsonIgnore
    private Set<SubjectSystemAssignment> assignments = new LinkedHashSet<>();

    @JsonProperty("imageFileId")
    public String getImageFileId() {
        return image_subject != null ? image_subject.getId() : null;
    }
    
    @JsonProperty("skillCode")
    public String getSkillCode() {
        return skill != null ? skill.getSkillCode() : null;
    }
    
    @JsonProperty("skillName")
    public String getSkillName() {
        return skill != null ? skill.getSkillName() : null;
    }

    public void addAssignment(SubjectSystemAssignment assignment) {
        if (assignment == null) return;
        assignments.add(assignment);
        assignment.setSubject(this);
    }
}