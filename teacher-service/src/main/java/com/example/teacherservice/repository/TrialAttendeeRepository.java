package com.example.teacherservice.repository;

import com.example.teacherservice.model.TrialAttendee;
import com.example.teacherservice.model.TrialTeaching;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TrialAttendeeRepository extends JpaRepository<TrialAttendee, String> {
    List<TrialAttendee> findByTrial(TrialTeaching trial);
    List<TrialAttendee> findByTrial_Id(String trialId);
}

