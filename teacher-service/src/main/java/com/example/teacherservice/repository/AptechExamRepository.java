package com.example.teacherservice.repository;

import com.example.teacherservice.model.AptechExam;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AptechExamRepository extends JpaRepository<AptechExam, String> {
    List<AptechExam> findByTeacher(User teacher);
    List<AptechExam> findBySubject(Subject subject);
    Optional<AptechExam> findByTeacherAndSubjectAndAttempt(User teacher, Subject subject, Integer attempt);
}

