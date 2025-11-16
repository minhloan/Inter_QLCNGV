package com.example.teacherservice.dto.teachersubjectregistration;

import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.enums.RegistrationStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubjectRegistrationsDto {
    private String id;
    private String teacherId;
    private String subjectId;
    private String subjectCode;
    private String subjectName;
    private Integer year;
    private Quarter quarter;
    private String reasonForCarryOver;
    private RegistrationStatus status;
    private String carriedFromId;
    private String registrationDate;
}
