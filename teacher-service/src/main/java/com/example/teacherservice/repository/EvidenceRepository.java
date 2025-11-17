package com.example.teacherservice.repository;

import com.example.teacherservice.enums.EvidenceStatus;
import com.example.teacherservice.model.Evidence;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EvidenceRepository extends JpaRepository<Evidence, String> {
    List<Evidence> findByTeacher(User teacher);
    List<Evidence> findBySubject(Subject subject);
    boolean existsByTeacher_IdAndSubject_IdAndStatus(
            String teacherId,
            String subjectId,
            EvidenceStatus status
    );
}

