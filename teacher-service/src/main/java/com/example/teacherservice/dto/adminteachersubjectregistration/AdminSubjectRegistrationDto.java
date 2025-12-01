package com.example.teacherservice.dto.adminteachersubjectregistration;

import com.example.teacherservice.enums.Quarter;
import lombok.Data;

@Data
public class AdminSubjectRegistrationDto {
    private String id;
    private String teacherId;  // ID của User (teacher)
    private String teacherCode;
    private String teacherName;
    private String subjectId;
    private String subjectName;
    private String subjectCode;
    private String systemName;
    private String semester;
    private String reasonForCarryOver;
    private String reasonForCarryOver2;
    private String teacherNotes;
    private Integer year;
    private Quarter quarter;
    private String registrationDate;
    private String status;
    private String notes;
}