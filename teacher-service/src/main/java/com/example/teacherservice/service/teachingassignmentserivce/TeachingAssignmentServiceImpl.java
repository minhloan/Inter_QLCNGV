package com.example.teacherservice.service.teachingassignmentserivce;

import com.example.teacherservice.enums.*;
import com.example.teacherservice.model.ScheduleClass;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.TeachingAssignment;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.*;
import com.example.teacherservice.request.TeachingAssignmentCreateRequest;
import com.example.teacherservice.request.TeachingAssignmentStatusUpdateRequest;
import com.example.teacherservice.response.TeachingAssignmentDetailResponse;
import com.example.teacherservice.response.TeachingAssignmentListItemResponse;
import com.example.teacherservice.response.TeachingEligibilityResponse;
import com.example.teacherservice.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.data.domain.Page;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeachingAssignmentServiceImpl implements TeachingAssignmentService {
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final UserRepository userRepository;
    private final ScheduleClassRepository scheduleClassRepository;
    private final SubjectRegistrationRepository subjectRegistrationRepository;
    private final AptechExamRepository aptechExamRepository;
    private final TrialEvaluationRepository trialEvaluationRepository;
    private final EvidenceRepository evidenceRepository;
    private final NotificationService notificationService;
    private final ModelMapper modelMapper;


    @Override
    public TeachingEligibilityResponse checkEligibility(String teacherId, String subjectId) {
        List<String> missing = new ArrayList<>();

        if(!subjectRegistrationRepository.existsByTeacher_IdAndSubject_IdAndStatus(teacherId, subjectId, RegistrationStatus.COMPLETED)) {
            missing.add("Chưa hoàn thành đăng ký môn.");
        }
        if (!aptechExamRepository.existsByTeacher_IdAndSubject_IdAndResult(
                teacherId, subjectId, ExamResult.PASS)) {
            missing.add("Chưa có kết quả thi Aptech PASS.");
        }

        if (!evidenceRepository.existsByTeacher_IdAndSubject_IdAndStatus(
                teacherId, subjectId, EvidenceStatus.VERIFIED)) {
            missing.add("Chưa có minh chứng được VERIFY.");
        }

        return TeachingEligibilityResponse.builder()
                .eligible(missing.isEmpty())
                .missingConditions(missing)
                .build();
    }

    @Override
    public TeachingAssignmentDetailResponse createAssignment(TeachingAssignmentCreateRequest request,
                                                             String assignedByUserId) {

        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Giáo viên không tồn tại"));
        ScheduleClass scheduleClass = scheduleClassRepository.findById(request.getScheduleClassId())
                .orElseThrow(() -> new IllegalArgumentException("Schedule class không tồn tại"));

        User assignedBy = null;
        if (assignedByUserId != null) {
            assignedBy = userRepository.findById(assignedByUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Người phân công không tồn tại"));
        }

        String subjectId = scheduleClass.getSubject().getId();
        TeachingEligibilityResponse eligibilityResponse =
                checkEligibility(teacher.getId(), subjectId);

        TeachingAssignment.TeachingAssignmentBuilder builder = TeachingAssignment.builder()
                .teacher(teacher)
                .scheduleClass(scheduleClass)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .notes(request.getNotes());

        TeachingAssignment assignment;

        if (eligibilityResponse.isEligible()) {
            // Đủ điều kiện -> ASSIGNED
            assignment = builder
                    .status(AssignmentStatus.ASSIGNED)
                    .build();

        } else {
            // Không đủ điều kiện -> FAILED + gửi thông báo
            String reason = String.join("\n", eligibilityResponse.getMissingConditions());

            assignment = builder
                    .status(AssignmentStatus.FAILED)
                    .failureReason(reason)
                    .completedAt(LocalDateTime.now())
                    .build();
        }

        // Lưu trước để có ID
        TeachingAssignment saved = teachingAssignmentRepository.save(assignment);

        // Nếu FAILED thì gửi thông báo
        if (saved.getStatus() == AssignmentStatus.FAILED) {
            // Format danh sách điều kiện còn thiếu
            String missingList = eligibilityResponse.getMissingConditions().stream()
                    .map(s -> "- " + s)
                    .collect(Collectors.joining("\n"));

            String subjectName = scheduleClass.getSubject().getSubjectName();
            String classCode = scheduleClass.getClassCode();
            String hocKy = buildQuarterLabel(scheduleClass); // ví dụ "2024-1"

            String title = "Phân công giảng dạy thất bại";

            String message = """
                Bạn chưa đủ điều kiện để được phân công giảng dạy môn %s (lớp %s, học kỳ %s).

                Các điều kiện còn thiếu:
                %s

                Vui lòng hoàn thành đầy đủ các bước trên rồi liên hệ quản lý để được phân công lại.
                """.formatted(subjectName, classCode, hocKy, missingList);

            notificationService.createAndSend(
                    teacher.getId(),             // người nhận: giáo viên
                    title,                       // tiêu đề tiếng Việt
                    message,                     // nội dung chi tiết tiếng Việt
                    NotificationType.ASSIGNMENT_NOTIFICATION,    // hoặc TEACHING_ASSIGNMENT_FAILED nếu bạn có enum riêng
                    "TEACHING_ASSIGNMENT",       // relatedEntity: loại entity
                    saved.getId()                // relatedId: id của TeachingAssignment
            );
        }

        return toDetailResponse(saved);
    }


    @Override
    public TeachingAssignmentDetailResponse updateStatus(String assignmentId,
                                                         TeachingAssignmentStatusUpdateRequest request) {

        TeachingAssignment assignment = teachingAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Phân công giảng dạy không tồn tại"));

        AssignmentStatus oldStatus = assignment.getStatus();
        AssignmentStatus newStatus = request.getStatus();
        String failureReason = request.getFailureReason();

        assignment.setStatus(newStatus);

        LocalDateTime now = LocalDateTime.now();

        // Các trạng thái có "kết thúc"
        if (newStatus == AssignmentStatus.COMPLETED
                || newStatus == AssignmentStatus.NOT_COMPLETED
                || newStatus == AssignmentStatus.FAILED) {
            assignment.setCompletedAt(now);
        }

        if (newStatus == AssignmentStatus.NOT_COMPLETED || newStatus == AssignmentStatus.FAILED) {
            assignment.setFailureReason(failureReason);
        }

        TeachingAssignment saved = teachingAssignmentRepository.save(assignment);

        // Gửi thông báo cho giáo viên
        // chỉ gửi khi trạng thái thực sự thay đổi
        if (oldStatus != newStatus) {
            User teacher = saved.getTeacher();
            ScheduleClass c = saved.getScheduleClass();
            Subject subject = c.getSubject();

            String subjectName = subject.getSubjectName();
            String classCode = c.getClassCode();
            String hocKy = buildQuarterLabel(c); // ví dụ "2024-1"

            String title;
            String message;
            NotificationType type;

            switch (newStatus) {
                case ASSIGNED -> {
                    title = "Phân công giảng dạy";
                    message = """
                        Bạn được phân công giảng dạy môn %s (lớp %s, học kỳ %s).

                        Vui lòng kiểm tra lại thời khoá biểu và chuẩn bị bài giảng phù hợp.
                        """.formatted(subjectName, classCode, hocKy);
                    type = NotificationType.ASSIGNMENT_NOTIFICATION;
                }
                case COMPLETED -> {
                    title = "Hoàn thành phân công giảng dạy";
                    message = """
                        Phân công giảng dạy môn %s (lớp %s, học kỳ %s) đã được đánh dấu là HOÀN THÀNH.

                        Cảm ơn bạn đã hoàn thành môn học này.
                        """.formatted(subjectName, classCode, hocKy);
                    type = NotificationType.ASSIGNMENT_NOTIFICATION;
                }
                case NOT_COMPLETED -> {
                    title = "Phân công giảng dạy chưa hoàn thành";
                    String lyDo = (failureReason != null && !failureReason.isBlank())
                            ? failureReason
                            : "Không có lý do cụ thể.";

                    message = """
                        Phân công giảng dạy môn %s (lớp %s, học kỳ %s) được đánh dấu là CHƯA HOÀN THÀNH.

                        Lý do: %s
                        """.formatted(subjectName, classCode, hocKy, lyDo);
                    type = NotificationType.ASSIGNMENT_NOTIFICATION;
                }
                case FAILED -> {
                    title = "Phân công giảng dạy thất bại";
                    String lyDo = (failureReason != null && !failureReason.isBlank())
                            ? failureReason
                            : "Không đủ điều kiện hoặc có lỗi trong quá trình phân công.";

                    message = """
                        Phân công giảng dạy môn %s (lớp %s, học kỳ %s) được đánh dấu là THẤT BẠI.

                        Lý do: %s

                        Vui lòng liên hệ quản lý để được hỗ trợ thêm.
                        """.formatted(subjectName, classCode, hocKy, lyDo);
                    type = NotificationType.ASSIGNMENT_NOTIFICATION;
                }
                default -> {
                    // phòng hờ, nếu sau này thêm status mới
                    title = "Cập nhật trạng thái phân công giảng dạy";
                    message = """
                        Trạng thái phân công giảng dạy môn %s (lớp %s, học kỳ %s) đã được cập nhật thành: %s.
                        """.formatted(subjectName, classCode, hocKy, newStatus.name());
                    type = NotificationType.ASSIGNMENT_NOTIFICATION;
                }
            }

            notificationService.createAndSend(
                    teacher.getId(),
                    title,
                    message,
                    type,
                    "TEACHING_ASSIGNMENT",
                    saved.getId()
            );
        }

        return toDetailResponse(saved);
    }

    @Override
    public List<TeachingAssignmentListItemResponse> getAllAssignments() {
        return teachingAssignmentRepository.findAll()
                .stream()
                .map(this::toListItemResponse)
                .collect(Collectors.toList());
    }

    private TeachingAssignmentListItemResponse toListItemResponse(TeachingAssignment a) {
        TeachingAssignmentListItemResponse dto =
                modelMapper.map(a, TeachingAssignmentListItemResponse.class);

        ScheduleClass c = a.getScheduleClass();

        dto.setTeacherId(a.getTeacher().getId());
        dto.setTeacherCode(a.getTeacher().getTeacherCode());
        dto.setTeacherName(a.getTeacher().getUsername());

        dto.setSubjectId(c.getSubject().getId());
        dto.setSubjectName(c.getSubject().getSubjectName());

        dto.setClassId(c.getId());
        dto.setClassCode(c.getClassCode());

        dto.setYear(c.getYear());
        dto.setQuarter(c.getQuarter());
        dto.setScheduleText(buildScheduleText(c));

        return dto;
    }

    @Override
    public Page<TeachingAssignmentListItemResponse> getAllAssignments(Integer page, Integer size) {
        return null;
    }

    @Override
    public Page<TeachingAssignmentListItemResponse> searchAssignments(String keyword, Integer page, Integer size) {
        return null;
    }

    private TeachingAssignmentDetailResponse toDetailResponse(TeachingAssignment a) {
        TeachingAssignmentDetailResponse dto =
                modelMapper.map(a, TeachingAssignmentDetailResponse.class);

        ScheduleClass c = a.getScheduleClass();

        dto.setTeacherId(a.getTeacher().getId());
        dto.setTeacherCode(a.getTeacher().getTeacherCode());
        dto.setTeacherName(a.getTeacher().getUsername());

        dto.setSubjectId(c.getSubject().getId());
        dto.setSubjectName(c.getSubject().getSubjectName());

        dto.setClassId(c.getId());
        dto.setClassCode(c.getClassCode());

        dto.setYear(c.getYear());
        dto.setQuarterLabel(buildQuarterLabel(c));
        dto.setScheduleText(buildScheduleText(c));

        return dto;
    }

    private String buildQuarterLabel(ScheduleClass c) {
        // ví dụ: QUY1 -> 2024-1
        int qNumber = switch (c.getQuarter()) {
            case QUY1 -> 1;
            case QUY2 -> 2;
            case QUY3 -> 3;
            case QUY4 -> 4;
        };
        return c.getYear() + "-" + qNumber;
    }

    private String buildScheduleText(ScheduleClass c) {
        StringBuilder schedule = new StringBuilder();

        if (c.getDayOfWeek1() != null) {
            schedule.append("Thứ ").append(c.getDayOfWeek1().getDayNumber());
        }
        if (c.getDayOfWeek2() != null) {
            if (!schedule.isEmpty()) schedule.append(", ");
            schedule.append("Thứ ").append(c.getDayOfWeek2().getDayNumber());
        }
        if (c.getDayOfWeek3() != null) {
            if (!schedule.isEmpty()) schedule.append(", ");
            schedule.append("Thứ ").append(c.getDayOfWeek3().getDayNumber());
        }

        if (c.getStartTime1() != null && c.getEndTime1() != null) {
            schedule.append(" - ")
                    .append(c.getStartTime1())
                    .append("-")
                    .append(c.getEndTime1());
        }

        return schedule.toString();
    }
}
