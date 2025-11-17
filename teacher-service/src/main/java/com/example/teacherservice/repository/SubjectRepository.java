package com.example.teacherservice.repository;

import com.example.teacherservice.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, String> {
    Optional<Subject> findBySubjectCode(String subjectCode);
    boolean existsBySubjectCode(String subjectCode);
    List<Subject> findBySubjectNameContainingIgnoreCase(String subjectName);
}

