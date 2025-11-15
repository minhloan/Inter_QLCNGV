package com.example.teacherservice.repository;

import com.example.teacherservice.model.TrialEvaluation;
import com.example.teacherservice.model.TrialTeaching;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface TrialEvaluationRepository extends JpaRepository<TrialEvaluation, String> {
    Optional<TrialEvaluation> findByTrial(TrialTeaching trial);
}

