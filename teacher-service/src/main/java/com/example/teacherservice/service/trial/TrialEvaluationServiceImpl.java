package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.exception.UnauthorizedException;
import com.example.teacherservice.model.File;
import com.example.teacherservice.model.TrialAttendee;
import com.example.teacherservice.model.TrialEvaluation;
import com.example.teacherservice.model.TrialTeaching;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.TrialAttendeeRepository;
import com.example.teacherservice.repository.TrialEvaluationRepository;
import com.example.teacherservice.repository.TrialTeachingRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.service.file.FileService;
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
    private final TrialAttendeeRepository attendeeRepository;
    private final TrialTeachingRepository trialRepository;
    private final UserRepository userRepository;
    private final FileService fileService;

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

        return toDto(evaluationRepository.save(evaluation));
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

    private TrialEvaluationDto toDto(TrialEvaluation evaluation) {
        TrialAttendee attendee = evaluation.getAttendee();
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
                .build();
    }
}
