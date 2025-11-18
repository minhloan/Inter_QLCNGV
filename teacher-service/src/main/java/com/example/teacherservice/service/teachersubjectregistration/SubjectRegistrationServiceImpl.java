package com.example.teacherservice.service.teachersubjectregistration;

import com.example.teacherservice.dto.teachersubjectregistration.SubjectRegistrationsDto;
import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.SubjectRegistrationRepository;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.request.teachersubjectregistration.SubjectRegistrationFilterRequest;
import com.example.teacherservice.service.auditlog.AuditLogService;
import com.example.teacherservice.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectRegistrationServiceImpl implements SubjectRegistrationService {
    @Override
    public List<SubjectRegistration> getRegistrationsByTeacherId(String teacherId) {
        User teacher = userRepository.findById(teacherId).orElse(null);
        assert teacher != null;
        return subjectRegistrationRepository.findByTeacher_Id(teacher.getId());
    }

    private final SubjectRegistrationRepository subjectRegistrationRepository;
    private final UserRepository userRepository;
    private final SubjectRepository SubjectRepository;
    private final NotificationService notificationService;
    private final AuditLogService auditLogService;

    @Override
    public List<SubjectRegistrationsDto> getAllRegistrations() {
        return subjectRegistrationRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubjectRegistrationsDto> getFilteredRegistrations(SubjectRegistrationFilterRequest request) {
        List<SubjectRegistration> results;

        if (request.getTeacherId() != null && !request.getTeacherId().isBlank()) {
            results = subjectRegistrationRepository.findByTeacher_Id(request.getTeacherId());
        } else if (request.getYear() != null && request.getQuarter() != null) {
            results = subjectRegistrationRepository.findByYearAndQuarter(request.getYear(), request.getQuarter());
        } else if (request.getStatus() != null) {
            results = subjectRegistrationRepository.findByStatus(request.getStatus());
        } else {
            results = subjectRegistrationRepository.findAll();
        }

        return results.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public SubjectRegistrationsDto getById(String id) {
        SubjectRegistration reg = subjectRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubjectRegistration not found"));
        return toDto(reg);
    }


    private SubjectRegistrationsDto toDto(SubjectRegistration e) {
        return SubjectRegistrationsDto.builder()
                .id(e.getId())
                .teacherId(e.getTeacher() != null ? e.getTeacher().getId().toString() : null)
                .subjectId(e.getSubject() != null ? e.getSubject().getId().toString() : null)
                .subjectCode(e.getSubject() != null ? e.getSubject().getSubjectCode() : null)
                .subjectName(e.getSubject() != null ? e.getSubject().getSubjectName() : null)
                .year(e.getYear())
                .quarter(e.getQuarter())
                .reasonForCarryOver(e.getReasonForCarryOver())
                .status(e.getStatus())
                .carriedFromId(e.getCarriedFrom() != null ? e.getCarriedFrom().getId() : null)

                // Lấy creationTimestamp từ BaseEntity làm ngày đăng ký
                .registrationDate(
                        e.getCreationTimestamp() != null
                                ? e.getCreationTimestamp().toString()  // hoặc format lại nếu muốn
                                : null
                )
                .build();
    }

    @Override
    public SubjectRegistrationsDto createRegistration(SubjectRegistrationsDto dto) {
        User teacher = userRepository.findById(dto.getTeacherId()).orElse(null);

        // Kiểm tra nếu không tìm thấy giáo viên
        if (teacher == null) {
            throw new RuntimeException("Teacher not authenticated");
        }

        // Kiểm tra xem môn học có hợp lệ không
        Subject subjectId = SubjectRepository.findById(dto.getSubjectId()).orElse(null);
        if (subjectId == null) {
            throw new RuntimeException("Subject not found");
        }

        // Kiểm tra các thông tin đầu vào hợp lệ
        if (dto.getSubjectId() == null || dto.getYear() == null || dto.getQuarter() == null) {
            throw new IllegalArgumentException("Thiếu thông tin cần thiết để đăng ký môn học");
        }

        // Kiểm tra xem giáo viên đã đăng ký môn này trong quý và năm này chưa
//        boolean exists = subjectRegistrationRepository.existsByTeacher_IdAndSubject_IdAndYearAndQuarter(
//                teacher.getId(), dto.getSubjectId(), dto.getYear(), dto.getQuarter());
//
//        if (exists) {
//            throw new RuntimeException("Giáo viên đã đăng ký môn này trong quý và năm này rồi");
//        }

        // Tạo đối tượng SubjectRegistration mới
        SubjectRegistration registration = SubjectRegistration.builder()
                .teacher(teacher)           // Gán giáo viên đã xác thực
                .subject(subjectId)         // Gán môn học từ DB
                .year(dto.getYear())        // Năm học từ DTO
                .quarter(dto.getQuarter())  // Quý học từ DTO
                .reasonForCarryOver(dto.getReasonForCarryOver()) // Lý do carry over nếu có
                .status(dto.getStatus() != null ? dto.getStatus() : RegistrationStatus.REGISTERED) // Trạng thái đăng ký
                .build();

        // Lưu vào DB
        SubjectRegistration saved = subjectRegistrationRepository.save(registration);

        String subjectLabel = subjectId.getSubjectName() != null && !subjectId.getSubjectName().isBlank()
                ? subjectId.getSubjectName()
                : subjectId.getSubjectCode();
        String title = "Đăng ký môn học thành công";
        StringBuilder messageBuilder = new StringBuilder("Bạn đã đăng ký ");
        if (subjectLabel != null) {
            messageBuilder.append("môn ").append(subjectLabel).append(" ");
        } else {
            messageBuilder.append("môn học ");
        }
        if (dto.getQuarter() != null) {
            messageBuilder.append("cho học kỳ ").append(dto.getQuarter()).append(" ");
        }
        if (dto.getYear() != null) {
            messageBuilder.append("năm học ").append(dto.getYear()).append(" ");
        }
        notificationService.createAndSend(
                teacher.getId(),
                title,
                messageBuilder.toString().trim(),
                NotificationType.SUBJECT_NOTIFICATION,
                "SubjectRegistration",
                saved.getId()
        );

        auditLogService.writeAndBroadcast(teacher.getId(),
                "LOGOUT", "USER", subjectId.getId(),
                "{\"method\":\"CREATE_REGISTER_SUBJECT\"}"
        );

        // Trả về DTO sau khi lưu
        return toDto(saved);
    }










}
