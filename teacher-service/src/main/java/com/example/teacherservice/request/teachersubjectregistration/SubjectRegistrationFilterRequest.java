package com.example.teacherservice.request.teachersubjectregistration;

import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.enums.RegistrationStatus;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class SubjectRegistrationFilterRequest {
    private String teacherId;
    private Integer year;
    private Quarter quarter;
    private RegistrationStatus status;
}
