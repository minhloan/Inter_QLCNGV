package com.example.teacherservice.repository;

import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRegistrationRepository extends JpaRepository<SubjectRegistration, String> {
    Optional<SubjectRegistration> findByTeacherAndSubjectAndYearAndQuarter(
            User teacher, Subject subject, Integer year, Integer quarter);
    List<SubjectRegistration> findByTeacher(User teacher);
    List<SubjectRegistration> findBySubject(Subject subject);
}

