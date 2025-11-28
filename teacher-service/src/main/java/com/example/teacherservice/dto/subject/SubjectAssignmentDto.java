package com.example.teacherservice.dto.subject;

import com.example.teacherservice.enums.Semester;
import lombok.Builder;
import lombok.Value;

@Value
@Builder
public class SubjectAssignmentDto {
    String id;
    String subjectId;
    String subjectCode;
    String subjectName;
    String systemId;
    String systemCode;
    String systemName;
    Semester semester;
    Integer hours;
    Boolean isActive;
    String note;
}

