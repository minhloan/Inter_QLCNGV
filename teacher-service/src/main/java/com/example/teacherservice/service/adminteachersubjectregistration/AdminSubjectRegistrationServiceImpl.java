package com.example.teacherservice.service.adminteachersubjectregistration;

import com.example.teacherservice.dto.adminteachersubjectregistration.AdminSubjectRegistrationDto;
import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.repository.SubjectRegistrationRepository;
import com.example.teacherservice.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminSubjectRegistrationServiceImpl implements AdminSubjectRegistrationService {

    private final SubjectRegistrationRepository subjectRegistrationRepository;
    private final NotificationService notificationService;

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
        SubjectRegistration saved = subjectRegistrationRepository.save(reg);

        notifyTeacherStatusUpdate(saved);

        return toDto(saved);
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

    private void notifyTeacherStatusUpdate(SubjectRegistration registration) {
        if (registration.getTeacher() == null) {
            return;
        }

        String subjectLabel = resolveSubjectLabel(registration);
        String statusMessage = switch (registration.getStatus()) {
            case COMPLETED -> "được duyệt";
            case NOT_COMPLETED -> "bị từ chối";
            default -> "được cập nhật";
        };
        String title = switch (registration.getStatus()) {
            case COMPLETED -> "Đăng ký môn học đã được duyệt";
            case NOT_COMPLETED -> "Đăng ký môn học bị từ chối";
            default -> "Đăng ký môn học được cập nhật";
        };

        StringBuilder messageBuilder = new StringBuilder();
        messageBuilder.append("Đăng ký");
        if (subjectLabel != null && !subjectLabel.isBlank()) {
            messageBuilder.append(" môn ").append(subjectLabel);
        } else {
            messageBuilder.append(" môn học");
        }
        if (registration.getQuarter() != null) {
            messageBuilder.append(" học kỳ ").append(registration.getQuarter());
        }
        if (registration.getYear() != null) {
            messageBuilder.append(" năm học ").append(registration.getYear());
        }
        messageBuilder.append(" đã ").append(statusMessage).append(".");

        notificationService.createAndSend(
                registration.getTeacher().getId(),
                title,
                messageBuilder.toString().trim(),
                NotificationType.SUBJECT_NOTIFICATION,
                "SubjectRegistration",
                registration.getId()
        );
    }

    private String resolveSubjectLabel(SubjectRegistration registration) {
        if (registration.getSubject() == null) {
            return null;
        }
        if (registration.getSubject().getSubjectName() != null
                && !registration.getSubject().getSubjectName().isBlank()) {
            return registration.getSubject().getSubjectName();
        }
        return registration.getSubject().getSubjectCode();
    }

}
