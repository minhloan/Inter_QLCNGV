package com.example.teacherservice.repository;

import com.example.teacherservice.model.TeachingAssignment;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeachingAssignmentRepository extends JpaRepository<TeachingAssignment, String> {
    Optional<TeachingAssignment> findByTeacherAndSubjectAndYearAndQuarter(
            User teacher, Subject subject, Integer year, Integer quarter);
    List<TeachingAssignment> findByTeacher(User teacher);
    List<TeachingAssignment> findBySubject(Subject subject);
}

