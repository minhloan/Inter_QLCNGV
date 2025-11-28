package com.example.teacherservice.repository;

import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.model.SubjectSystemAssignment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface SubjectSystemAssignmentRepository extends JpaRepository<SubjectSystemAssignment, String> {

    Optional<SubjectSystemAssignment> findBySubjectAndSystem(Subject subject, SubjectSystem system);

    Optional<SubjectSystemAssignment> findBySubject_IdAndSystem_Id(String subjectId, String systemId);

    List<SubjectSystemAssignment> findBySystem(SubjectSystem system);

    List<SubjectSystemAssignment> findBySystemAndIsActive(SubjectSystem system, Boolean isActive);

    List<SubjectSystemAssignment> findBySubject(Subject subject);

    boolean existsBySystem(SubjectSystem system);
}

