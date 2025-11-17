package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialTeachingDto;
import com.example.teacherservice.dto.trial.TrialAttendeeDto;
import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.enums.TrialStatus;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.TrialEvaluation;
import com.example.teacherservice.model.TrialTeaching;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.TrialTeachingRepository;
import com.example.teacherservice.repository.TrialEvaluationRepository;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.request.trial.TrialTeachingRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TrialTeachingServiceImpl implements TrialTeachingService {

    private final TrialTeachingRepository trialTeachingRepository;
    private final TrialEvaluationRepository trialEvaluationRepository;
    private final TrialAttendeeService trialAttendeeService;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;

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
        return toDto(saved);
    }

    @Override
    public TrialTeachingDto updateStatus(String trialId, TrialStatus status) {
        TrialTeaching trial = trialTeachingRepository.findById(trialId)
                .orElseThrow(() -> new NotFoundException("Trial not found"));

        trial.setStatus(status);
        TrialTeaching updated = trialTeachingRepository.save(trial);
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

    private TrialTeachingDto toDto(TrialTeaching trial) {
        Optional<TrialEvaluation> evaluation = trialEvaluationRepository.findByTrial_Id(trial.getId());

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

        // Get evaluation details
        TrialEvaluationDto evaluationDto = null;
        if (evaluation.isPresent()) {
            TrialEvaluation eval = evaluation.get();
            evaluationDto = TrialEvaluationDto.builder()
                    .id(eval.getId())
                    .trialId(eval.getTrial().getId())
                    .score(eval.getScore())
                    .comments(eval.getComments())
                    .conclusion(eval.getConclusion())
                    .fileReportId(eval.getFileReport() != null ? eval.getFileReport().getId() : null)
                    .build();
        }

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
                .score(evaluation.map(TrialEvaluation::getScore).orElse(null))
                .location(trial.getLocation())
                .note(trial.getNote())
                .attendees(attendees)
                .evaluation(evaluationDto)
                .build();
    }
}
