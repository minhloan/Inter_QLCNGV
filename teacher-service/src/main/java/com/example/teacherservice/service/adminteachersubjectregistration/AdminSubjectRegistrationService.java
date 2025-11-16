package com.example.teacherservice.service.adminteachersubjectregistration;

import com.example.teacherservice.dto.adminteachersubjectregistration.AdminSubjectRegistrationDto;
import com.example.teacherservice.enums.RegistrationStatus;

import java.util.List;

public interface AdminSubjectRegistrationService {

    List<AdminSubjectRegistrationDto> getAll();

    AdminSubjectRegistrationDto updateStatus(String id, RegistrationStatus status);
}