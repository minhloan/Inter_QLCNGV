package com.example.teacherservice.request;

import com.example.teacherservice.enums.Quarter;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeachingAssignmentCreateRequest {
    private String teacherId;
    private String subjectId;
    private Integer year;
    private Quarter quarter; // JSON: "QUY1" | "QUY2" | ...
    private String notes;
}