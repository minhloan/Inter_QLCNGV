package com.example.teacherservice.repository;

import com.example.teacherservice.model.TrialAttendee;
import com.example.teacherservice.model.TrialTeaching;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TrialAttendeeRepository extends JpaRepository<TrialAttendee, String> {
    List<TrialAttendee> findByTrial(TrialTeaching trial);
    List<TrialAttendee> findByTrial_Id(String trialId);
    
    @Query("SELECT ta FROM TrialAttendee ta LEFT JOIN FETCH ta.attendeeUser WHERE ta.trial.id = :trialId")
    List<TrialAttendee> findByTrial_IdWithUser(@Param("trialId") String trialId);
    
    List<TrialAttendee> findByAttendeeUser_Id(String userId);
    Optional<TrialAttendee> findByIdAndAttendeeUser_Id(String attendeeId, String userId);
}

