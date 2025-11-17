package com.example.teacherservice.service.teachingassignmentserivce;

import com.example.teacherservice.enums.*;
import com.example.teacherservice.model.*;
import com.example.teacherservice.repository.*;
import com.example.teacherservice.request.ScheduleSlotRequest;
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
import java.time.LocalTime;
import java.util.*;
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
    private final SubjectRepository subjectRepository;
    private final ModelMapper modelMapper;

    @Override
    public TeachingEligibilityResponse checkEligibility(String teacherId, String subjectId) {
        List<String> missing = new ArrayList<>();

        // 1. Đăng ký môn COMPLETED
        if (!subjectRegistrationRepository
                .existsByTeacher_IdAndSubject_IdAndStatus(
                        teacherId, subjectId, RegistrationStatus.COMPLETED)) {
            missing.add("Chưa hoàn thành đăng ký môn.");
        }

        // 2. Thi Aptech PASS
        if (!aptechExamRepository
                .existsByTeacher_IdAndSubject_IdAndResult(
                        teacherId, subjectId, ExamResult.PASS)) {
            missing.add("Chưa có kết quả thi Aptech PASS.");
        }

        // 3. Minh chứng VERIFIED
        if (!evidenceRepository
                .existsByTeacher_IdAndSubject_IdAndStatus(
                        teacherId, subjectId, EvidenceStatus.VERIFIED)) {
            missing.add("Chưa có minh chứng được VERIFY.");
        }

        return TeachingEligibilityResponse.builder()
                .eligible(missing.isEmpty())
                .missingConditions(missing)
                .build();
    }

    @Override
    public TeachingAssignmentDetailResponse getById(String id) {
        TeachingAssignment assignment = teachingAssignmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Phân công giảng dạy không tồn tại"));

        return toDetailResponse(assignment);
    }

    // CREATE ASSIGNMENT

    @Override
    public TeachingAssignmentDetailResponse createAssignment(TeachingAssignmentCreateRequest request,
                                                             String assignedByUserId) {
        // 1. Lấy teacher
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new IllegalArgumentException("Giáo viên không tồn tại"));
        System.out.println("Teacher" +  teacher.getId());

        // 2. Lấy subject
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new IllegalArgumentException("Môn học không tồn tại"));

        // 3. Tạo ScheduleClass từ request
        ScheduleClass sc = new ScheduleClass();
        sc.setClassCode(request.getClassCode());
        sc.setSubject(subject);
        sc.setYear(request.getYear());
        sc.setQuarter(convertQuarter(request.getQuarter()));   // 1..4 -> QUY1..4
        sc.setLocation(request.getLocation());
        sc.setNotes(request.getNotes());

        // 3.1. Tạo list slots từ request
        List<ScheduleSlot> slotEntities = buildSlotsFromRequest(sc, request.getSlots());
        sc.setSlots(slotEntities);

        // lưu class + slots
        sc = scheduleClassRepository.save(sc);

        // 4. Người phân công
        User assignedBy = null;
        if (assignedByUserId != null) {
            assignedBy = userRepository.findById(assignedByUserId)
                    .orElseThrow(() -> new IllegalArgumentException("Người phân công không tồn tại"));
        }
        System.out.println("Manage" + assignedByUserId);

        // 5. Check eligibility
        String subjectId = subject.getId();
        TeachingEligibilityResponse eligibilityResponse =
                checkEligibility(teacher.getId(), subjectId);

        TeachingAssignment.TeachingAssignmentBuilder builder = TeachingAssignment.builder()
                .teacher(teacher)
                .scheduleClass(sc)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .notes(request.getNotes());

        TeachingAssignment assignment;
        if (eligibilityResponse.isEligible()) {
            assignment = builder
                    .status(AssignmentStatus.ASSIGNED)
                    .build();
        } else {
            String reason = String.join("\n", eligibilityResponse.getMissingConditions());
            assignment = builder
                    .status(AssignmentStatus.FAILED)
                    .failureReason(reason)
                    .completedAt(LocalDateTime.now())
                    .build();
        }

        TeachingAssignment saved = teachingAssignmentRepository.save(assignment);

        // 6. Nếu FAILED thì gửi noti cho giáo viên
        if (saved.getStatus() == AssignmentStatus.FAILED) {
            sendFailedAssignmentNotification(teacher, sc, eligibilityResponse, saved);
        }

        // 7. Trả detail response
        return toDetailResponse(saved);
    }

    /**
     * Nhận list slots từ FE, tạo list ScheduleSlot
     */
    private List<ScheduleSlot> buildSlotsFromRequest(ScheduleClass sc, List<ScheduleSlotRequest> slots) {
        if (slots == null) return Collections.emptyList();

        return slots.stream()
                .filter(s -> s.getDayOfWeek() != null
                        && s.getStartTime() != null
                        && s.getEndTime() != null)
                .map(s -> {
                    ScheduleSlot slot = new ScheduleSlot();
                    slot.setScheduleClass(sc);
                    slot.setDayOfWeek(dayOfWeekFromNumber(s.getDayOfWeek()));
                    slot.setStartTime(LocalTime.parse(s.getStartTime())); // "HH:mm"
                    slot.setEndTime(LocalTime.parse(s.getEndTime()));
                    return slot;
                })
                .collect(Collectors.toList());
    }

    // UPDATE STATUS

    @Override
    public TeachingAssignmentDetailResponse updateStatus(
            String assignmentId,
            TeachingAssignmentStatusUpdateRequest request) {

        TeachingAssignment assignment = teachingAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new IllegalArgumentException("Phân công giảng dạy không tồn tại"));

        AssignmentStatus oldStatus = assignment.getStatus();
        AssignmentStatus newStatus = request.getStatus();
        String failureReason = request.getFailureReason();

        assignment.setStatus(newStatus);

        LocalDateTime now = LocalDateTime.now();

        if (newStatus == AssignmentStatus.COMPLETED
                || newStatus == AssignmentStatus.NOT_COMPLETED
                || newStatus == AssignmentStatus.FAILED) {
            assignment.setCompletedAt(now);
        }

        if (newStatus == AssignmentStatus.NOT_COMPLETED
                || newStatus == AssignmentStatus.FAILED) {
            assignment.setFailureReason(failureReason);
        }

        TeachingAssignment saved = teachingAssignmentRepository.save(assignment);

        // Gửi thông báo nếu status thay đổi
        if (oldStatus != newStatus) {
            User teacher = saved.getTeacher();
            ScheduleClass c = saved.getScheduleClass();
            Subject subject = c.getSubject();

            String subjectName = subject.getSubjectName();
            String classCode = c.getClassCode();
            String hocKy = buildQuarterLabel(c);

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

    // LIST / SEARCH

    @Override
    public List<TeachingAssignmentListItemResponse> getAllAssignments() {
        return teachingAssignmentRepository.findAll()
                .stream()
                .map(this::toListItemResponse)
                .collect(Collectors.toList());
    }

    @Override
    public Page<TeachingAssignmentListItemResponse> getAllAssignments(Integer page, Integer size) {
        return null;
    }

    @Override
    public Page<TeachingAssignmentListItemResponse> searchAssignments(String keyword, Integer page, Integer size) {
        return null;
    }

    //  MAPPING DTO

    private TeachingAssignmentListItemResponse toListItemResponse(TeachingAssignment a) {
        ScheduleClass c = a.getScheduleClass();
        Subject s = c.getSubject();
        User teacher = a.getTeacher();

        String semester = buildQuarterLabel(c);
        String schedule = buildScheduleText(c);

        return TeachingAssignmentListItemResponse.builder()
                .id(a.getId())
                .teacherCode(teacher.getTeacherCode())
                .teacherName(teacher.getUsername())
                .subjectId(s.getId())
                .subjectName(s.getSubjectName())
                .classCode(c.getClassCode())
                .semester(semester)
                .schedule(schedule)
                .status(a.getStatus())
                .build();
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
        dto.setQuarterLabel(buildQuarterLabel(c)); // ví dụ "2025-1"
        dto.setScheduleText(buildScheduleText(c));
        dto.setStatus(a.getStatus());

        return dto;
    }

    private String buildQuarterLabel(ScheduleClass c) {
        int qNumber = switch (c.getQuarter()) {
            case QUY1 -> 1;
            case QUY2 -> 2;
            case QUY3 -> 3;
            case QUY4 -> 4;
        };
        return c.getYear() + "-" + qNumber;
    }

    /**
     * Ví dụ: "Thứ 2 (09:00-11:00), Thứ 2 (14:00-16:00), Thứ 4 (09:00-11:00)"
     */
    private String buildScheduleText(ScheduleClass c) {
        if (c.getSlots() == null || c.getSlots().isEmpty()) return "";

        return c.getSlots().stream()
                .sorted(Comparator
                        .comparing((ScheduleSlot s) -> s.getDayOfWeek().getDayNumber())
                        .thenComparing(ScheduleSlot::getStartTime))
                .map(s -> "Thứ " + s.getDayOfWeek().getDayNumber()
                        + " (" + s.getStartTime() + "-" + s.getEndTime() + ")")
                .collect(Collectors.joining(", "));
    }

    private Quarter convertQuarter(Integer q) {
        if (q == null) throw new IllegalArgumentException("Quý không được để trống");
        return switch (q) {
            case 1 -> Quarter.QUY1;
            case 2 -> Quarter.QUY2;
            case 3 -> Quarter.QUY3;
            case 4 -> Quarter.QUY4;
            default -> throw new IllegalArgumentException("Giá trị quý không hợp lệ: " + q);
        };
    }

    private DayOfWeek dayOfWeekFromNumber(Integer n) {
        if (n == null) return null;
        return Arrays.stream(DayOfWeek.values())
                .filter(d -> d.getDayNumber() == n)
                .findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Thứ không hợp lệ: " + n));
    }

    private void sendFailedAssignmentNotification(
            User teacher,
            ScheduleClass scheduleClass,
            TeachingEligibilityResponse eligibilityResponse,
            TeachingAssignment saved
    ) {
        String missingList = eligibilityResponse.getMissingConditions().stream()
                .map(s -> "- " + s)
                .collect(Collectors.joining("\n"));

        String subjectName = scheduleClass.getSubject().getSubjectName();
        String classCode = scheduleClass.getClassCode();
        String hocKy = buildQuarterLabel(scheduleClass);

        String title = "Phân công giảng dạy thất bại";

        String message = """
            Bạn chưa đủ điều kiện để được phân công giảng dạy môn %s (lớp %s, học kỳ %s).

            Các điều kiện còn thiếu:
            %s

            Vui lòng hoàn thành đầy đủ các bước trên rồi liên hệ quản lý để được phân công lại.
            """.formatted(subjectName, classCode, hocKy, missingList);

        notificationService.createAndSend(
                teacher.getId(),
                title,
                message,
                NotificationType.ASSIGNMENT_NOTIFICATION,
                "TEACHING_ASSIGNMENT",
                saved.getId()
        );
    }
}
