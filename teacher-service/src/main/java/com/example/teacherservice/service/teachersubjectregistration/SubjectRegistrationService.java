package com.example.teacherservice.service.teachersubjectregistration;

import com.example.teacherservice.dto.teachersubjectregistration.SubjectRegistrationsDto;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.request.teachersubjectregistration.SubjectRegistrationFilterRequest;
import java.util.List;

public interface SubjectRegistrationService {
    List<SubjectRegistrationsDto> getAllRegistrations();
    List<SubjectRegistrationsDto> getFilteredRegistrations(SubjectRegistrationFilterRequest request);
    SubjectRegistrationsDto getById(String id);
    SubjectRegistrationsDto createRegistration(SubjectRegistrationsDto dto);
    List<SubjectRegistration> getRegistrationsByTeacherId(String teacherId);
}
