package com.example.teacherservice.repository;

import com.example.teacherservice.enums.EvidenceStatus;
import com.example.teacherservice.model.Evidence;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.Subject;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.Date;
import java.util.List;

public interface EvidenceRepository extends JpaRepository<Evidence, String> {
    List<Evidence> findByTeacher(User teacher);
    List<Evidence> findBySubject(Subject subject);
    List<Evidence> findByStatus(EvidenceStatus status);

    List<Evidence> findByTeacherIdAndSubjectId(String teacherId, String subjectId);
    List<Evidence> findBySubmittedDateBetween(LocalDate startDate, LocalDate endDate);
    @Query("SELECT e FROM Evidence e WHERE e.teacher.id = :teacherId AND e.status = :status")
    List<Evidence> findByTeacherIdAndStatus(@Param("teacherId") String teacherId,
                                            @Param("status") EvidenceStatus status);

    @Query("SELECT e FROM Evidence e WHERE e.ocrText IS NULL AND e.status = 'PENDING'")
    List<Evidence> findPendingOCRProcessing();
    boolean existsByTeacher_IdAndSubject_IdAndStatus(
            String teacherId,
            String subjectId,
            EvidenceStatus status
    );
}

