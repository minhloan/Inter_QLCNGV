package com.example.teacherservice.service.teachersubjectregistration;

import com.example.teacherservice.dto.teachersubjectregistration.CarryOverRequest;
import com.example.teacherservice.dto.teachersubjectregistration.ImportPlanResultDto;
import com.example.teacherservice.dto.teachersubjectregistration.SubjectRegistrationsDto;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.request.teachersubjectregistration.SubjectRegistrationFilterRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface SubjectRegistrationService {
    List<SubjectRegistrationsDto> getAllRegistrations();
    List<SubjectRegistrationsDto> getFilteredRegistrations(SubjectRegistrationFilterRequest request);
    SubjectRegistrationsDto getById(String id);
    SubjectRegistrationsDto createRegistration(SubjectRegistrationsDto dto);
    List<SubjectRegistration> getRegistrationsByTeacherId(String teacherId);

    SubjectRegistrationsDto carryOver(String registrationId,
                                      CarryOverRequest request,
                                      String teacherId);


    // ====== KẾ HOẠCH NĂM - EXCEL ======
    void exportPlanExcel(HttpServletResponse response, String teacherId, Integer year);

    ImportPlanResultDto importTeacherPlanExcel(String teacherId, Integer year, MultipartFile file);
}
