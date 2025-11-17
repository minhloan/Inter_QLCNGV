package com.example.teacherservice.service.adminteachersubjectregistration;

import com.example.teacherservice.dto.adminteachersubjectregistration.AdminSubjectRegistrationDto;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.repository.SubjectRegistrationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminSubjectRegistrationServiceImpl implements AdminSubjectRegistrationService {

    private final SubjectRegistrationRepository subjectRegistrationRepository;

    // ============================================
    // Lấy danh sách đăng ký cho Admin
    // ============================================
    @Override
    public List<AdminSubjectRegistrationDto> getAll() {
        return subjectRegistrationRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    // ============================================
    // Update trạng thái (approve, reject)
    // ============================================
    @Override
    public AdminSubjectRegistrationDto updateStatus(String id, RegistrationStatus status) {
        SubjectRegistration reg = subjectRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        reg.setStatus(status);
        subjectRegistrationRepository.save(reg);

        return toDto(reg);
    }

    // 👉 HÀM MỚI: lấy chi tiết
    @Override
    public AdminSubjectRegistrationDto getById(String id) {
        SubjectRegistration reg = subjectRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));
        return toDto(reg);
    }

    // ============================================
    // Convert to DTO
    // ============================================
    private AdminSubjectRegistrationDto toDto(SubjectRegistration reg) {
        AdminSubjectRegistrationDto dto = new AdminSubjectRegistrationDto();

        dto.setId(reg.getId());
        dto.setTeacherCode(reg.getTeacher() != null ? reg.getTeacher().getTeacherCode() : "N/A");
        dto.setTeacherName(reg.getTeacher() != null ? reg.getTeacher().getUsername() : "N/A");

        dto.setSubjectId(reg.getSubject() != null ? reg.getSubject().getId() : null);
        dto.setSubjectName(reg.getSubject() != null ? reg.getSubject().getSubjectName() : "N/A");
        dto.setSubjectCode(reg.getSubject().getSubjectCode());
        dto.setQuarter(reg.getQuarter());

        dto.setRegistrationDate(reg.getCreationTimestamp() != null ? reg.getCreationTimestamp().toString() : "N/A");

        dto.setStatus(reg.getStatus() != null ? reg.getStatus().name().toLowerCase() : "N/A");
        dto.setNotes(reg.getReasonForCarryOver() != null ? reg.getReasonForCarryOver() : "N/A");

        return dto;
    }

}
