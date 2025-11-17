package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.TrialEvaluation;
import com.example.teacherservice.model.TrialTeaching;
import com.example.teacherservice.repository.TrialEvaluationRepository;
import com.example.teacherservice.repository.TrialTeachingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;
import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.enums.TrialStatus;

@Service
@RequiredArgsConstructor
@Transactional
public class TrialEvaluationServiceImpl implements TrialEvaluationService {

    private final TrialEvaluationRepository evaluationRepository;
    private final TrialTeachingRepository trialRepository;

    @Override
    public TrialEvaluationDto createEvaluation(String trialId, Integer score, String comments, String conclusion) {
        TrialTeaching trial = trialRepository.findById(trialId)
                .orElseThrow(() -> new NotFoundException("Trial not found"));

        // Check if evaluation already exists for this trial
        Optional<TrialEvaluation> existingEvaluation = evaluationRepository.findByTrial_Id(trialId);
        if (existingEvaluation.isPresent()) {
            // Update existing evaluation
            TrialEvaluation evaluation = existingEvaluation.get();
            evaluation.setScore(score);
            evaluation.setComments(comments);
            evaluation.setConclusion(TrialConclusion.valueOf(conclusion));
            return toDto(evaluationRepository.save(evaluation));
        } else {
            // Create new evaluation
            TrialEvaluation evaluation = new TrialEvaluation();
            evaluation.setTrial(trial);
            evaluation.setScore(score);
            evaluation.setComments(comments);
            evaluation.setConclusion(TrialConclusion.valueOf(conclusion));
            TrialEvaluation savedEvaluation = evaluationRepository.save(evaluation);

            // Update trial status to REVIEWED
            trial.setStatus(TrialStatus.REVIEWED);
            trialRepository.save(trial);

            return toDto(savedEvaluation);
        }
    }

    @Override
    public TrialEvaluationDto updateEvaluation(String trialId, Integer score, String comments, String conclusion) {
        TrialEvaluation evaluation = evaluationRepository.findByTrial_Id(trialId)
                .orElseThrow(() -> new NotFoundException("Evaluation not found"));

        evaluation.setScore(score);
        evaluation.setComments(comments);
        evaluation.setConclusion(TrialConclusion.valueOf(conclusion));

        return toDto(evaluationRepository.save(evaluation));
    }

    @Override
    public TrialEvaluationDto getEvaluationByTrialId(String trialId) {
        TrialEvaluation evaluation = evaluationRepository.findByTrial_Id(trialId)
                .orElseThrow(() -> new NotFoundException("Evaluation not found"));
        return toDto(evaluation);
    }

    @Override
    public List<TrialEvaluationDto> getAllEvaluations() {
        return evaluationRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private TrialEvaluationDto toDto(TrialEvaluation evaluation) {
        return TrialEvaluationDto.builder()
                .id(evaluation.getId())
                .trialId(evaluation.getTrial().getId())
                .score(evaluation.getScore())
                .comments(evaluation.getComments())
                .conclusion(evaluation.getConclusion())
                .build();
    }
}
