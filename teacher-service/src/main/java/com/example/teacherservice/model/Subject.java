package com.example.teacherservice.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects", indexes = {
        @Index(name = "idx_subject_name", columnList = "subject_name"),
        @Index(name = "idx_system_id", columnList = "system_id"),
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

    @JsonProperty("imageFileId")
    public String getImageFileId() {
        return image_subject != null ? image_subject.getId() : null;
    }
}