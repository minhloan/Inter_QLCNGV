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
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
        addMissingConditionIfFalse(
                hasCompletedSubjectRegistration(teacherId, subjectId),
                "Chưa hoàn thành đăng ký môn.",
                missing);

        // 2. Thi Aptech PASS
        addMissingConditionIfFalse(
                hasAptechPass(teacherId, subjectId),
                "Chưa có kết quả thi Aptech PASS.",
                missing);

        // 3. Giảng thử PASS
        addMissingConditionIfFalse(
                hasTrialPass(teacherId, subjectId),
                "Chưa có kết quả giảng thử PASS.",
                missing);

        // 4. Minh chứng VERIFIED
        addMissingConditionIfFalse(
                hasVerifiedEvidence(teacherId, subjectId),
                "Chưa có minh chứng được VERIFY.",
                missing);

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
        User teacher = findTeacher(request.getTeacherId());
        Subject subject = findSubject(request.getSubjectId());

        ScheduleClass scheduleClass = buildScheduleClassEntity(subject, request);
        scheduleClass = scheduleClassRepository.save(scheduleClass);

        User assignedBy = resolveAssignedBy(assignedByUserId);

        TeachingEligibilityResponse eligibilityResponse =
                checkEligibility(teacher.getId(), subject.getId());

        TeachingAssignment assignment = buildAssignmentEntity(
                teacher,
                scheduleClass,
                assignedBy,
                request.getNotes(),
                eligibilityResponse
        );

        TeachingAssignment saved = teachingAssignmentRepository.save(assignment);

        if (saved.getStatus() == AssignmentStatus.FAILED) {
            sendFailedAssignmentNotification(teacher, scheduleClass, eligibilityResponse, saved);
        }

        return toDetailResponse(saved);
    }

    /**
     * Nhận list slots từ FE, tạo list ScheduleSlot
     */
    private User findTeacher(String teacherId) {
        return userRepository.findById(teacherId)
                .orElseThrow(() -> new IllegalArgumentException("Giáo viên không tồn tại"));
    }

    private Subject findSubject(String subjectId) {
        return subjectRepository.findById(subjectId)
                .orElseThrow(() -> new IllegalArgumentException("Môn học không tồn tại"));
    }

    private User resolveAssignedBy(String assignedByUserId) {
        if (assignedByUserId == null || assignedByUserId.isBlank()) {
            return null;
        }
        return userRepository.findById(assignedByUserId)
                .orElseThrow(() -> new IllegalArgumentException("Người phân công không tồn tại"));
    }

    private ScheduleClass buildScheduleClassEntity(Subject subject, TeachingAssignmentCreateRequest request) {
        ScheduleClass scheduleClass = new ScheduleClass();
        scheduleClass.setClassCode(request.getClassCode());
        scheduleClass.setSubject(subject);
        scheduleClass.setYear(request.getYear());
        scheduleClass.setQuarter(convertQuarter(request.getQuarter()));
        scheduleClass.setLocation(request.getLocation());
        scheduleClass.setNotes(request.getNotes());

        List<ScheduleSlot> slotEntities = buildSlotsFromRequest(scheduleClass, request.getSlots());
        scheduleClass.setSlots(slotEntities);

        return scheduleClass;
    }

    private TeachingAssignment buildAssignmentEntity(
            User teacher,
            ScheduleClass scheduleClass,
            User assignedBy,
            String notes,
            TeachingEligibilityResponse eligibilityResponse
    ) {
        TeachingAssignment.TeachingAssignmentBuilder builder = TeachingAssignment.builder()
                .teacher(teacher)
                .scheduleClass(scheduleClass)
                .assignedBy(assignedBy)
                .assignedAt(LocalDateTime.now())
                .notes(notes);

        if (eligibilityResponse.isEligible()) {
            return builder
                    .status(AssignmentStatus.ASSIGNED)
                    .build();
        }

        String reason = String.join("\n", eligibilityResponse.getMissingConditions());
        return builder
                .status(AssignmentStatus.FAILED)
                .failureReason(reason)
                .completedAt(LocalDateTime.now())
                .build();
    }

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

    private void addMissingConditionIfFalse(boolean condition, String message, List<String> missing) {
        if (!condition) {
            missing.add(message);
        }
    }

    private boolean hasCompletedSubjectRegistration(String teacherId, String subjectId) {
        return subjectRegistrationRepository
                .existsByTeacher_IdAndSubject_IdAndStatus(
                        teacherId, subjectId, RegistrationStatus.COMPLETED);
    }

    private boolean hasAptechPass(String teacherId, String subjectId) {
        return aptechExamRepository
                .existsByTeacher_IdAndSubject_IdAndResult(
                        teacherId, subjectId, ExamResult.PASS);
    }

    private boolean hasTrialPass(String teacherId, String subjectId) {
        return trialEvaluationRepository
                .existsByTrial_Teacher_IdAndTrial_Subject_IdAndConclusion(
                        teacherId, subjectId, TrialConclusion.PASS);
    }

    private boolean hasVerifiedEvidence(String teacherId, String subjectId) {
        return evidenceRepository
                .existsByTeacher_IdAndSubject_IdAndStatus(
                        teacherId, subjectId, EvidenceStatus.VERIFIED);
    }

    private Pageable buildAssignmentPageable(Integer page, Integer size) {
        int pageNumber = (page == null || page < 0) ? 0 : page;
        int pageSize = (size == null || size <= 0) ? 10 : size;
        return PageRequest.of(pageNumber, pageSize, Sort.by(Sort.Direction.DESC, "assignedAt"));
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
    public Page<TeachingAssignmentListItemResponse> getAllAssignments(Integer page, Integer size) {
        Pageable pageable = buildAssignmentPageable(page, size);

        Page<TeachingAssignment> assignmentPage = teachingAssignmentRepository.findAll(pageable);

        return assignmentPage.map(this::toListItemResponse);
    }

    @Override
    public Page<TeachingAssignmentListItemResponse> searchAssignments(
            String keyword,
            AssignmentStatus status,
            String semester,
            Integer page,
            Integer size
    ) {
        Pageable pageable = buildAssignmentPageable(page, size);

        Integer yearFilter = null;
        Quarter quarterFilter = null;
        if (semester != null && !semester.isBlank()) {
            String[] parts = semester.split("-");
            if (parts.length != 2) {
                throw new IllegalArgumentException("Học kỳ không hợp lệ. Định dạng hợp lệ: YYYY-Q");
            }
            try {
                yearFilter = Integer.parseInt(parts[0]);
                int quarterNumber = Integer.parseInt(parts[1]);
                quarterFilter = convertQuarter(quarterNumber);
            } catch (NumberFormatException ex) {
                throw new IllegalArgumentException("Học kỳ không hợp lệ: " + semester, ex);
            }
        }

        boolean hasKeyword = keyword != null && !keyword.isBlank();
        boolean hasStatus = status != null;
        boolean hasSemester = yearFilter != null;

        if (!hasKeyword && !hasStatus && !hasSemester) {
            return getAllAssignments(page, size);
        }

        Page<TeachingAssignment> assignmentPage =
                teachingAssignmentRepository.searchAssignments(
                        hasKeyword ? keyword.trim() : null,
                        status,
                        yearFilter,
                        quarterFilter,
                        pageable);

        return assignmentPage.map(this::toListItemResponse);
    }

    @Override
    public Page<TeachingAssignmentListItemResponse> searchAssignmentsForTeacher(
            String teacherId,
            String keyword,
            AssignmentStatus status,
            Integer year,
            Integer page,
            Integer size
    ) {
        Pageable pageable = buildAssignmentPageable(page, size);

        Integer yearFilter = (year == null || year <= 0) ? null : year;

        Page<TeachingAssignment> assignmentPage =
                teachingAssignmentRepository.searchAssignmentsForTeacher(
                        teacherId,
                        (keyword != null && !keyword.isBlank()) ? keyword.trim() : null,
                        status,
                        yearFilter,
                        pageable
                );

        return assignmentPage.map(this::toListItemResponse);
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
                .failureReason(a.getFailureReason())
                .notes(a.getNotes())
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
