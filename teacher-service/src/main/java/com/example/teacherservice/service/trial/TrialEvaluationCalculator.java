package com.example.teacherservice.service.trial;

import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.model.TrialEvaluation;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Utility class for calculating trial evaluation consensus and detecting anomalies
 */
@Component
public class TrialEvaluationCalculator {

    private static final int RED_FLAG_THRESHOLD = 50;
    private static final double CONSENSUS_RATIO = 0.67; // 2/3 majority

    /**
     * Calculate average score from all evaluations
     */
    public Integer calculateAverageScore(List<TrialEvaluation> evaluations) {
        if (evaluations == null || evaluations.isEmpty()) {
            return null;
        }

        double totalScore = evaluations.stream()
                .mapToInt(TrialEvaluation::getScore)
                .sum();

        return (int) Math.round(totalScore / evaluations.size());
    }

    /**
     * Detect if any evaluation has a red flag (score < 50)
     */
    public boolean detectRedFlag(List<TrialEvaluation> evaluations) {
        if (evaluations == null || evaluations.isEmpty()) {
            return false;
        }

        return evaluations.stream()
                .anyMatch(eval -> eval.getScore() < RED_FLAG_THRESHOLD);
    }

    /**
     * Determine consensus result based on PASS/FAIL majority
     * Returns null if no clear consensus
     */
    public TrialConclusion determineConsensus(List<TrialEvaluation> evaluations) {
        if (evaluations == null || evaluations.isEmpty()) {
            return null;
        }

        long passCount = evaluations.stream()
                .filter(eval -> eval.getConclusion() == TrialConclusion.PASS)
                .count();

        long failCount = evaluations.stream()
                .filter(eval -> eval.getConclusion() == TrialConclusion.FAIL)
                .count();

        int totalCount = evaluations.size();

        // Need 2/3 majority for clear consensus
        if (passCount >= totalCount * CONSENSUS_RATIO) {
            return TrialConclusion.PASS;
        } else if (failCount >= totalCount * CONSENSUS_RATIO) {
            return TrialConclusion.FAIL;
        }

        // Simple majority for smaller groups (2 people)
        if (totalCount == 2) {
            if (passCount > failCount) return TrialConclusion.PASS;
            if (failCount > passCount) return TrialConclusion.FAIL;
        }

        // No clear consensus
        return null;
    }

    /**
     * Check if manual review is needed
     */
    public boolean needsReview(List<TrialEvaluation> evaluations) {
        if (evaluations == null || evaluations.isEmpty()) {
            return false;
        }

        TrialConclusion consensus = determineConsensus(evaluations);
        return consensus == null; // No consensus means needs review
    }

    /**
     * Generate appropriate result note based on evaluation state
     */
    public String generateResultNote(List<TrialEvaluation> evaluations, 
                                     boolean hasRedFlag, 
                                     boolean needsReview) {
        if (evaluations == null || evaluations.isEmpty()) {
            return null;
        }

        if (needsReview) {
            return "Kết quả chưa rõ ràng, cần họp bàn để ra quyết định cuối cùng";
        }

        if (hasRedFlag) {
            long passCount = evaluations.stream()
                    .filter(eval -> eval.getConclusion() == TrialConclusion.PASS)
                    .count();
            long failCount = evaluations.stream()
                    .filter(eval -> eval.getConclusion() == TrialConclusion.FAIL)
                    .count();

            return String.format(
                "Có ý kiến khác biệt đáng kể (%d PASS, %d FAIL). Cần theo dõi thêm.",
                passCount, failCount
            );
        }

        return null; // No special note needed
    }
}
