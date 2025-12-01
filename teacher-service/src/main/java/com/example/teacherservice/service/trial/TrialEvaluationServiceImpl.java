package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.dto.trial.TrialEvaluationItemDto;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.exception.UnauthorizedException;
import com.example.teacherservice.model.File;
import com.example.teacherservice.model.TrialAttendee;
import com.example.teacherservice.model.TrialEvaluation;
import com.example.teacherservice.model.TrialEvaluationItem;
import com.example.teacherservice.model.TrialTeaching;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.TrialAttendeeRepository;
import com.example.teacherservice.repository.TrialEvaluationItemRepository;
import com.example.teacherservice.repository.TrialEvaluationRepository;
import com.example.teacherservice.repository.TrialTeachingRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.request.trial.TrialEvaluationRequest;
import com.example.teacherservice.service.file.FileService;
import com.example.teacherservice.service.notification.NotificationService;
import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.enums.Role;
import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.enums.TrialStatus;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class TrialEvaluationServiceImpl implements TrialEvaluationService {

    private final TrialEvaluationRepository evaluationRepository;
    private final TrialEvaluationItemRepository evaluationItemRepository;
    private final TrialAttendeeRepository attendeeRepository;
    private final TrialTeachingRepository trialRepository;
    private final UserRepository userRepository;
    private final FileService fileService;
    private final TrialTeachingService trialTeachingService;
    private final NotificationService notificationService;

    @Override
    public TrialEvaluationDto createEvaluation(String attendeeId, String trialId, Integer score, String comments, String conclusion, String imageFileId, String currentUserId) {
        // Validate attendee exists and belongs to the trial
        TrialAttendee attendee = attendeeRepository.findById(attendeeId)
                .orElseThrow(() -> new NotFoundException("Attendee not found"));

        if (!attendee.getTrial().getId().equals(trialId)) {
            throw new IllegalArgumentException("Attendee does not belong to the specified trial");
        }

        // Check if current user is authorized to evaluate (must be the assigned attendee or Manage)
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isManage = currentUser.getPrimaryRole() == Role.MANAGE;
        boolean isAssignedAttendee = attendee.getAttendeeUser() != null &&
                attendee.getAttendeeUser().getId().equals(currentUserId);

        if (!isManage && !isAssignedAttendee) {
            throw new UnauthorizedException("You are not authorized to evaluate this trial. Only the assigned attendee or Manage can evaluate.");
        }

        // Check if evaluation already exists for this attendee
        Optional<TrialEvaluation> existingEvaluation = evaluationRepository.findByAttendee_Id(attendeeId);
        if (existingEvaluation.isPresent()) {
            // Update existing evaluation
            return updateEvaluation(existingEvaluation.get().getId(), score, comments, conclusion, imageFileId);
        }

        // Create new evaluation
        TrialEvaluation evaluation = new TrialEvaluation();
        evaluation.setAttendee(attendee);
        evaluation.setTrial(attendee.getTrial());
        evaluation.setScore(score);
        evaluation.setComments(comments);
        evaluation.setConclusion(TrialConclusion.valueOf(conclusion.toUpperCase()));

        // Link image if provided
        if (StringUtils.hasText(imageFileId)) {
            File imageFile = fileService.findFileById(imageFileId);
            evaluation.setImageFile(imageFile);
        }

        TrialEvaluation savedEvaluation = evaluationRepository.save(evaluation);

        // Update trial status to REVIEWED if not already
        TrialTeaching trial = attendee.getTrial();
        if (trial.getStatus() == TrialStatus.PENDING) {
            trial.setStatus(TrialStatus.REVIEWED);
            trialRepository.save(trial);
        }

        // Auto-recalculate trial result based on all evaluations
        trialTeachingService.recalculateTrialResult(trialId);

        return toDto(savedEvaluation);
    }

    @Override
    public TrialEvaluationDto createEvaluationWithDetails(TrialEvaluationRequest request, String currentUserId) {
        // Validate attendee exists and belongs to the trial
        TrialAttendee attendee = attendeeRepository.findById(request.getAttendeeId())
                .orElseThrow(() -> new NotFoundException("Attendee not found"));

        if (!attendee.getTrial().getId().equals(request.getTrialId())) {
            throw new IllegalArgumentException("Attendee does not belong to the specified trial");
        }

        // Check if current user is authorized to evaluate
        User currentUser = userRepository.findById(currentUserId)
                .orElseThrow(() -> new NotFoundException("User not found"));

        boolean isManage = currentUser.getPrimaryRole() == Role.MANAGE;
        boolean isAssignedAttendee = attendee.getAttendeeUser() != null &&
                attendee.getAttendeeUser().getId().equals(currentUserId);

        if (!isManage && !isAssignedAttendee) {
            throw new UnauthorizedException("You are not authorized to evaluate this trial. Only the assigned attendee or Manage can evaluate.");
        }

        // Check if evaluation already exists for this attendee
        Optional<TrialEvaluation> existingEvaluation = evaluationRepository.findByAttendee_Id(request.getAttendeeId());
        if (existingEvaluation.isPresent()) {
            // Update existing evaluation
            return updateEvaluationWithDetails(existingEvaluation.get().getId(), request);
        }

        // Calculate score from criteria if not provided
        Integer finalScore = request.getScore();
        if (finalScore == null && request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            double avg = request.getCriteria().stream()
                    .mapToInt(c -> c.getScore() != null ? c.getScore() : 0)
                    .filter(s -> s > 0)
                    .average()
                    .orElse(0.0);
            // Convert 1-5 scale to 0-100 scale: (avg - 1) * 25
            finalScore = (int) Math.round((avg - 1) * 25);
        }

        // Create new evaluation
        TrialEvaluation evaluation = new TrialEvaluation();
        evaluation.setAttendee(attendee);
        evaluation.setTrial(attendee.getTrial());
        evaluation.setScore(finalScore != null ? finalScore : 0);
        evaluation.setComments(request.getComments());
        evaluation.setConclusion(request.getConclusion() != null ? request.getConclusion() : TrialConclusion.FAIL);

        // Link image if provided
        if (StringUtils.hasText(request.getImageFileId())) {
            File imageFile = fileService.findFileById(request.getImageFileId());
            evaluation.setImageFile(imageFile);
        }

        TrialEvaluation savedEvaluation = evaluationRepository.save(evaluation);

        // Save detailed criteria items
        if (request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            int orderIndex = 1;
            for (TrialEvaluationRequest.CriterionScore criterion : request.getCriteria()) {
                if (criterion.getCode() != null && criterion.getScore() != null && criterion.getScore() >= 1 && criterion.getScore() <= 5) {
                    TrialEvaluationItem item = TrialEvaluationItem.builder()
                            .evaluation(savedEvaluation)
                            .criterionCode(criterion.getCode())
                            .score(criterion.getScore())
                            .comment(criterion.getComment())
                            .orderIndex(orderIndex++)
                            .build();
                    evaluationItemRepository.save(item);
                }
            }
        }

        // Update trial status to REVIEWED if not already
        TrialTeaching trial = attendee.getTrial();
        if (trial.getStatus() == TrialStatus.PENDING) {
            trial.setStatus(TrialStatus.REVIEWED);
            trialRepository.save(trial);
        }

        // Auto-recalculate trial result based on all evaluations
        trialTeachingService.recalculateTrialResult(request.getTrialId());

        return toDto(savedEvaluation);
    }

    @Override
    public TrialEvaluationDto updateEvaluation(String evaluationId, Integer score, String comments, String conclusion, String imageFileId) {
        TrialEvaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new NotFoundException("Evaluation not found"));

        evaluation.setScore(score);
        evaluation.setComments(comments);
        evaluation.setConclusion(TrialConclusion.valueOf(conclusion.toUpperCase()));

        // Handle image:
        // - if imageFileId = null -> don't touch the image
        // - if imageFileId = "" (empty string) -> delete current image
        // - if imageFileId = valid id -> load File and set it
        if (imageFileId != null) {
            if (!imageFileId.isBlank()) {
                File imageFile = fileService.findFileById(imageFileId);
                evaluation.setImageFile(imageFile);
            } else {
                // empty string => delete current image
                evaluation.setImageFile(null);
            }
        }

        TrialEvaluation saved = evaluationRepository.save(evaluation);

        // Recalculate trial result after update
        trialTeachingService.recalculateTrialResult(evaluation.getTrial().getId());

        return toDto(saved);
    }

    @Override
    public TrialEvaluationDto updateEvaluationWithDetails(String evaluationId, TrialEvaluationRequest request) {
        TrialEvaluation evaluation = evaluationRepository.findById(evaluationId)
                .orElseThrow(() -> new NotFoundException("Evaluation not found"));

        // Calculate score from criteria if not provided
        Integer finalScore = request.getScore();
        if (finalScore == null && request.getCriteria() != null && !request.getCriteria().isEmpty()) {
            double avg = request.getCriteria().stream()
                    .mapToInt(c -> c.getScore() != null ? c.getScore() : 0)
                    .filter(s -> s > 0)
                    .average()
                    .orElse(0.0);
            // Convert 1-5 scale to 0-100 scale: (avg - 1) * 25
            finalScore = (int) Math.round((avg - 1) * 25);
        }

        if (finalScore != null) {
            evaluation.setScore(finalScore);
        }
        if (request.getComments() != null) {
            evaluation.setComments(request.getComments());
        }
        if (request.getConclusion() != null) {
            evaluation.setConclusion(request.getConclusion());
        }

        // Handle image
        if (request.getImageFileId() != null) {
            if (!request.getImageFileId().isBlank()) {
                File imageFile = fileService.findFileById(request.getImageFileId());
                evaluation.setImageFile(imageFile);
            } else {
                evaluation.setImageFile(null);
            }
        }

        TrialEvaluation saved = evaluationRepository.save(evaluation);

        // Delete old items and save new ones
        if (request.getCriteria() != null) {
            evaluationItemRepository.deleteByEvaluation_Id(evaluationId);

            int orderIndex = 1;
            for (TrialEvaluationRequest.CriterionScore criterion : request.getCriteria()) {
                if (criterion.getCode() != null && criterion.getScore() != null && criterion.getScore() >= 1 && criterion.getScore() <= 5) {
                    TrialEvaluationItem item = TrialEvaluationItem.builder()
                            .evaluation(saved)
                            .criterionCode(criterion.getCode())
                            .score(criterion.getScore())
                            .comment(criterion.getComment())
                            .orderIndex(orderIndex++)
                            .build();
                    evaluationItemRepository.save(item);
                }
            }
        }

        // Recalculate trial result after update
        trialTeachingService.recalculateTrialResult(evaluation.getTrial().getId());

        // Gửi thông báo cho giảng viên được đánh giá
        notifyTeacherAboutEvaluation(saved);

        return toDto(saved);
    }

    @Override
    public TrialEvaluationDto getEvaluationByAttendeeId(String attendeeId) {
        TrialEvaluation evaluation = evaluationRepository.findByAttendee_Id(attendeeId)
                .orElseThrow(() -> new NotFoundException("Evaluation not found"));
        return toDto(evaluation);
    }

    @Override
    public List<TrialEvaluationDto> getEvaluationsByTrialId(String trialId) {
        return evaluationRepository.findByTrial_Id(trialId)
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<TrialEvaluationDto> getAllEvaluations() {
        return evaluationRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private void notifyTeacherAboutEvaluation(TrialEvaluation evaluation) {
        if (evaluation == null || evaluation.getTrial() == null || evaluation.getTrial().getTeacher() == null) {
            return;
        }

        User teacher = evaluation.getTrial().getTeacher();
        TrialTeaching trial = evaluation.getTrial();
        
        String subjectName = trial.getSubject() != null ? trial.getSubject().getSubjectName() : "môn học";
        String attendeeName = evaluation.getAttendee() != null ? evaluation.getAttendee().getAttendeeName() : "hội đồng";
        Integer score = evaluation.getScore();
        TrialConclusion conclusion = evaluation.getConclusion();
        
        String title = "Cập nhật đánh giá giảng thử";
        String message = String.format(
            """
            Đánh giá giảng thử của bạn đã được cập nhật.
            
            Môn học: %s
            Người đánh giá: %s
            Điểm số: %d/100
            Kết luận: %s
            %s
            """,
            subjectName,
            attendeeName,
            score != null ? score : 0,
            conclusion != null ? (conclusion == TrialConclusion.PASS ? "ĐẠT" : "CHƯA ĐẠT") : "Chưa có",
            evaluation.getComments() != null && !evaluation.getComments().isBlank() 
                ? "Nhận xét: " + evaluation.getComments() 
                : ""
        );

        notificationService.createAndSend(
            teacher.getId(),
            title,
            message,
            NotificationType.TRIAL_NOTIFICATION,
            "TRIAL_EVALUATION",
            evaluation.getId()
        );
    }

    private TrialEvaluationDto toDto(TrialEvaluation evaluation) {
        TrialAttendee attendee = evaluation.getAttendee();

        // Load detailed items
        List<TrialEvaluationItemDto> items = evaluationItemRepository
                .findByEvaluation_IdOrderByOrderIndexAsc(evaluation.getId())
                .stream()
                .map(item -> TrialEvaluationItemDto.builder()
                        .id(item.getId())
                        .evaluationId(item.getEvaluation().getId())
                        .criterionCode(item.getCriterionCode())
                        .criterionLabel(item.getCriterionLabel())
                        .score(item.getScore())
                        .orderIndex(item.getOrderIndex())
                        .comment(item.getComment())
                        .build())
                .collect(Collectors.toList());

        return TrialEvaluationDto.builder()
                .id(evaluation.getId())
                .trialId(evaluation.getTrial().getId())
                .attendeeId(attendee.getId())
                .attendeeName(attendee.getAttendeeName())
                .attendeeRole(attendee.getAttendeeRole() != null ? attendee.getAttendeeRole().toString() : null)
                .evaluatorUserId(attendee.getAttendeeUser() != null ? attendee.getAttendeeUser().getId() : null)
                .score(evaluation.getScore())
                .comments(evaluation.getComments())
                .conclusion(evaluation.getConclusion())
                .imageFileId(evaluation.getImageFile() != null ? evaluation.getImageFile().getId() : null)
                .items(items)
                .build();
    }
}
