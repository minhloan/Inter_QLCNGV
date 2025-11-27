package com.example.teacherservice.dto.subject;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectDto {
    private String id;
    private String subjectCode;
    private String subjectName;
    private Integer credit;
    private String systemId;
    private String systemName;
    private String description;
    private Boolean isActive;
    private String imageFileId;
    private Integer hours;
    private String semester;
    private Boolean isNewSubject;
}