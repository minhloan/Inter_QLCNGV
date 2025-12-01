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
    private String systemName;
    private String semester;
    private Integer year;
    private Quarter quarter;
    // Hình thức chuẩn bị
    private String reasonForCarryOver;

    // Lý do dời môn
    private String reasonForCarryOver2;

    // Ghi chú của giáo viên
    private String teacherNotes;
    private RegistrationStatus status;
    private String carriedFromId;
    private String registrationDate;
}