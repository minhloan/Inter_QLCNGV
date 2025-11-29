package com.example.teacherservice.service.adminteachersubjectregistration;

import com.example.teacherservice.dto.adminteachersubjectregistration.AdminSubjectRegistrationDto;
import com.example.teacherservice.dto.adminteachersubjectregistration.ImportResultDto;
import com.example.teacherservice.dto.teachersubjectregistration.ImportPlanResultDto;
import com.example.teacherservice.enums.RegistrationStatus;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface AdminSubjectRegistrationService {

    List<AdminSubjectRegistrationDto> getAll();

    AdminSubjectRegistrationDto updateStatus(String id, RegistrationStatus status);
    AdminSubjectRegistrationDto getById(String id);

    void exportExcel(HttpServletResponse response, String status, String teacher);

    ImportResultDto importExcel(MultipartFile file);
    
    // Plan export/import for admin
    void exportPlanExcel(HttpServletResponse response, String adminId, String teacherId, Integer year);
    
    ImportPlanResultDto importPlanExcel(String adminId, String teacherId, MultipartFile file);
}