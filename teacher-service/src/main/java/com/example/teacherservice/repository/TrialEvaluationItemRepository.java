package com.example.teacherservice.repository;

import com.example.teacherservice.model.TrialEvaluationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TrialEvaluationItemRepository extends JpaRepository<TrialEvaluationItem, String> {
    List<TrialEvaluationItem> findByEvaluation_IdOrderByOrderIndexAsc(String evaluationId);
    void deleteByEvaluation_Id(String evaluationId);
}

