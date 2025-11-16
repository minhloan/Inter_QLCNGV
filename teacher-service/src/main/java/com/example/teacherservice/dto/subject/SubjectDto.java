package com.example.teacherservice.dto.subject;

import com.example.teacherservice.enums.SubjectSystem;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SubjectDto {
    private String id;
    private String subjectCode;
    private String subjectName;
    private Integer credit;
    private SubjectSystem system;
    private Boolean isActive;
}
