package com.example.teacherservice.dto.adminteachersubjectregistration;

import com.example.teacherservice.enums.Quarter;
import lombok.Data;

@Data
public class AdminSubjectRegistrationDto {
    private String id;

    private String teacherCode;
    private String teacherName;

    private String subjectId;
    private String subjectName;
    private String subjectCode;
    private Quarter quarter;

    private String registrationDate;

    private String status;

    private String notes;
}