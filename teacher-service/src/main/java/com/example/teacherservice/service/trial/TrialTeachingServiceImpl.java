package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialAttendeeDto;
import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.dto.trial.TrialTeachingDto;
import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.enums.TrialStatus;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.TrialAttendee;
import com.example.teacherservice.model.TrialEvaluation;
import com.example.teacherservice.model.TrialTeaching;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.TrialAttendeeRepository;
import com.example.teacherservice.repository.TrialEvaluationRepository;
import com.example.teacherservice.repository.TrialTeachingRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.request.trial.TrialTeachingRequest;
import com.example.teacherservice.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TrialTeachingServiceImpl implements TrialTeachingService {

    private final TrialTeachingRepository trialTeachingRepository;
    private final TrialEvaluationRepository trialEvaluationRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final TrialAttendeeService trialAttendeeService;
    private final TrialAttendeeRepository trialAttendeeRepository;
    private final NotificationService notificationService;

    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH:mm");

    @Override
    public TrialTeachingDto createTrial(TrialTeachingRequest request) {
        User teacher = userRepository.findById(request.getTeacherId())
                .orElseThrow(() -> new NotFoundException("Teacher not found"));

        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new NotFoundException("Subject not found"));

        TrialTeaching trial = TrialTeaching.builder()
                .teacher(teacher)
                .subject(subject)
                .teachingDate(request.getTeachingDate())
                .teachingTime(request.getTeachingTime())
                .status(TrialStatus.PENDING)
                .location(request.getLocation())
                .note(request.getNote())
                .build();

        // Set AptechExam if provided
        if (request.getAptechExamId() != null && !request.getAptechExamId().isEmpty()) {
            // Note: This would need AptechExamRepository to be injected
            // For now, we'll skip this as it's not implemented yet
        }

        TrialTeaching saved = trialTeachingRepository.save(trial);

        notifyTeacherTrialCreated(saved);

        return toDto(saved);
    }

    @Override
    public TrialTeachingDto updateStatus(String trialId, TrialStatus status) {
        TrialTeaching trial = trialTeachingRepository.findById(trialId)
                .orElseThrow(() -> new NotFoundException("Trial not found"));

        trial.setStatus(status);
        TrialTeaching updated = trialTeachingRepository.save(trial);

        notifyTeacherStatusUpdate(updated);

        return toDto(updated);
    }

    @Override
    public TrialTeachingDto finalizeResult(String trialId, TrialConclusion finalResult) {
        TrialTeaching trial = trialTeachingRepository.findById(trialId)
                .orElseThrow(() -> new NotFoundException("Trial not found"));

        trial.setFinalResult(finalResult);
        // Update status based on result
        if (finalResult == TrialConclusion.PASS) {
            trial.setStatus(TrialStatus.PASSED);
        } else if (finalResult == TrialConclusion.FAIL) {
            trial.setStatus(TrialStatus.FAILED);
        }
        
        TrialTeaching updated = trialTeachingRepository.save(trial);

        notifyTeacherStatusUpdate(updated);

        return toDto(updated);
    }

    @Override
    public List<TrialTeachingDto> getAllTrials() {
        return trialTeachingRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrialTeachingDto> getTrialsByTeacher(String teacherId) {
        return trialTeachingRepository.findByTeacher_Id(teacherId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public TrialTeachingDto getTrialById(String id) {
        TrialTeaching trial = trialTeachingRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Trial not found"));
        return toDto(trial);
    }

    @Override
    public List<TrialTeachingDto> getTrialsForEvaluation(String evaluatorUserId) {
        // Get all attendees for this evaluator
        List<TrialAttendee> attendees = trialAttendeeRepository.findByAttendeeUser_Id(evaluatorUserId);
        
        // Get unique trials from attendees
        return attendees.stream()
                .map(TrialAttendee::getTrial)
                .distinct()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private TrialTeachingDto toDto(TrialTeaching trial) {
        // Format giờ
        String trialTimeStr = null;
        if (trial.getAptechExam() != null
                && trial.getAptechExam().getSession() != null
                && trial.getAptechExam().getSession().getExamTime() != null) {
            trialTimeStr = trial.getAptechExam().getSession().getExamTime()
                    .format(TIME_FORMATTER);
        }

        // Get attendees
        List<TrialAttendeeDto> attendees = trialAttendeeService.getAttendeesByTrial(trial.getId());

        // Get all evaluations for this trial
        List<TrialEvaluation> evaluations = trialEvaluationRepository.findByTrial_Id(trial.getId());
        List<TrialEvaluationDto> evaluationDtos = evaluations.stream()
                .map(eval -> {
                    TrialAttendee attendee = eval.getAttendee();
                    return TrialEvaluationDto.builder()
                            .id(eval.getId())
                            .trialId(eval.getTrial().getId())
                            .attendeeId(attendee.getId())
                            .attendeeName(attendee.getAttendeeName())
                            .attendeeRole(attendee.getAttendeeRole() != null ? attendee.getAttendeeRole().toString() : null)
                            .evaluatorUserId(attendee.getAttendeeUser() != null ? attendee.getAttendeeUser().getId() : null)
                            .score(eval.getScore())
                            .comments(eval.getComments())
                            .conclusion(eval.getConclusion())
                            .imageFileId(eval.getImageFile() != null ? eval.getImageFile().getId() : null)
                            .build();
                })
                .collect(Collectors.toList());

        return TrialTeachingDto.builder()
                .id(trial.getId())
                .teacherId(trial.getTeacher().getId())
                .teacherName(trial.getTeacher().getUsername())
                .teacherCode(trial.getTeacher().getTeacherCode())
                .subjectId(trial.getSubject().getId())
                .subjectName(trial.getSubject().getSubjectName())
                .teachingDate(trial.getTeachingDate())
                .teachingTime(trial.getTeachingTime())
                .status(trial.getStatus())
                .finalResult(trial.getFinalResult())
                .location(trial.getLocation())
                .note(trial.getNote())
                .attendees(attendees)
                .evaluations(evaluationDtos)
                .build();
    }

    private void notifyTeacherStatusUpdate(TrialTeaching trial) {
        if (trial.getTeacher() == null) {
            return;
        }

        String title = trial.getStatus() == TrialStatus.REVIEWED
                ? "Đăng ký giảng thử đã được duyệt"
                : "Đăng ký giảng thử được cập nhật";
        String statusMessage = trial.getStatus() == TrialStatus.REVIEWED
                ? "đã được duyệt"
                : "đã được cập nhật";

        StringBuilder messageBuilder = new StringBuilder("Đăng ký giảng thử");
        String subjectLabel = resolveSubjectLabel(trial);
        if (subjectLabel != null && !subjectLabel.isBlank()) {
            messageBuilder.append(" môn ").append(subjectLabel);
        }
        if (trial.getTeachingDate() != null) {
            messageBuilder.append(" vào ngày ").append(trial.getTeachingDate());
        }
        if (trial.getTeachingTime() != null && !trial.getTeachingTime().isBlank()) {
            messageBuilder.append(" lúc ").append(trial.getTeachingTime());
        }
        messageBuilder.append(" ").append(statusMessage).append(".");

        notificationService.createAndSend(
                trial.getTeacher().getId(),
                title,
                messageBuilder.toString().trim(),
                NotificationType.TRIAL_NOTIFICATION,
                "TrialTeaching",
                trial.getId()
        );
    }

    private String resolveSubjectLabel(TrialTeaching trial) {
        if (trial.getSubject() == null) {
            return null;
        }
        if (trial.getSubject().getSubjectName() != null
                && !trial.getSubject().getSubjectName().isBlank()) {
            return trial.getSubject().getSubjectName();
        }
        return trial.getSubject().getSubjectCode();
    }

    private void notifyTeacherTrialCreated(TrialTeaching trial) {
        if (trial.getTeacher() == null) {
            return;
        }

        StringBuilder messageBuilder = new StringBuilder("Bạn có lịch giảng thử mới");
        String subjectLabel = resolveSubjectLabel(trial);
        if (subjectLabel != null && !subjectLabel.isBlank()) {
            messageBuilder.append(" môn ").append(subjectLabel);
        }
        if (trial.getTeachingDate() != null) {
            messageBuilder.append(" vào ngày ").append(trial.getTeachingDate());
        }
        if (trial.getTeachingTime() != null && !trial.getTeachingTime().isBlank()) {
            messageBuilder.append(" lúc ").append(trial.getTeachingTime());
        }
        messageBuilder.append(".");

        notificationService.createAndSend(
                trial.getTeacher().getId(),
                "Lịch giảng thử mới",
                messageBuilder.toString().trim(),
                NotificationType.TRIAL_NOTIFICATION,
                "TrialTeaching",
                trial.getId()
        );
    }
}
