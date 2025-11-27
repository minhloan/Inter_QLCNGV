package com.example.teacherservice.model;

import com.example.teacherservice.enums.Semester;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "subjects", indexes = {
        @Index(name = "idx_subject_name", columnList = "subject_name"),
        @Index(name = "idx_system_id", columnList = "system_id"),
        @Index(name = "idx_is_active", columnList = "is_active"),
        @Index(name = "idx_subject_code", columnList = "subject_code")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Subject extends BaseEntity {

    @Column(name = "subject_code", length = 200)
    private String subjectCode;

    @Column(name = "subject_name", length = 200)
    private String subjectName;

    @Column(name = "hours")
    private Integer hours;

    @Enumerated(EnumType.STRING)
    @Column(name = "semester")
    private Semester semester;

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

    @Column(name = "is_new_subject")
    private Boolean isNewSubject = false;

    @JsonProperty("imageFileId")
    public String getImageFileId() {
        return image_subject != null ? image_subject.getId() : null;
    }
}