package com.example.teacherservice.repository;

import com.example.teacherservice.model.AptechExamSession;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface AptechExamSessionRepository extends JpaRepository<AptechExamSession, String> {
    List<AptechExamSession> findByExamDate(LocalDate examDate);
}

