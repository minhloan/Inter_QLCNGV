package com.example.teacherservice.dto.subject;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectSystemDto {

    private String id;
    private String systemCode;
    private String systemName;
    private Boolean isActive;
}