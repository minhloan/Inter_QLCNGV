package com.example.teacherservice.repository;

import com.example.teacherservice.model.TrialTeaching;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface TrialTeachingRepository extends JpaRepository<TrialTeaching, String> {
    List<TrialTeaching> findByTeacher(User teacher);
    List<TrialTeaching> findBySubject(Subject subject);
    List<TrialTeaching> findByTeachingDate(LocalDate teachingDate);
}

