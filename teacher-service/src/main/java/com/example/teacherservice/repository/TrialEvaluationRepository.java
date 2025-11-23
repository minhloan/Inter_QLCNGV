package com.example.teacherservice.repository;

import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.model.TrialAttendee;
import com.example.teacherservice.model.TrialEvaluation;
import com.example.teacherservice.model.TrialTeaching;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TrialEvaluationRepository extends JpaRepository<TrialEvaluation, String> {
    Optional<TrialEvaluation> findByAttendee(TrialAttendee attendee);
    Optional<TrialEvaluation> findByAttendee_Id(String attendeeId);
    List<TrialEvaluation> findByTrial_Id(String trialId);
    List<TrialEvaluation> findByTrial(TrialTeaching trial);

    boolean existsByTrial_Teacher_IdAndTrial_Subject_IdAndConclusion
            (String trialTeacherId, String trialSubjectId, TrialConclusion conclusion);
}

