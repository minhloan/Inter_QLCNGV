package com.example.teacherservice.repository;

import com.example.teacherservice.model.AptechExamSession;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface AptechExamSessionRepository extends JpaRepository<AptechExamSession, String> {
    List<AptechExamSession> findByExamDate(LocalDate examDate);
    boolean existsByExamDateAndRoom(LocalDate examDate, String room);

    @Query("""
        SELECT s FROM AptechExamSession s
        WHERE s.examDate >= :fromDate
          AND (
                :keyword IS NULL
                OR :keyword = ''
                OR LOWER(s.room) LIKE LOWER(CONCAT('%', :keyword, '%'))
                OR LOWER(COALESCE(s.note, '')) LIKE LOWER(CONCAT('%', :keyword, '%'))
            )
        """)
    Page<AptechExamSession> searchUpcomingSessions(
            @Param("fromDate") LocalDate fromDate,
            @Param("keyword") String keyword,
            Pageable pageable
    );
}

