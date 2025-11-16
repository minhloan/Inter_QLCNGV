package com.example.teacherservice.repository;

import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.enums.RegistrationStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SubjectRegistrationRepository extends JpaRepository<SubjectRegistration, String> {
    @EntityGraph(attributePaths = {"subject", "teacher"})
    List<SubjectRegistration> findByTeacher_Id(String teacherId);

    boolean existsByTeacher_IdAndSubject_IdAndYearAndQuarter(
            String teacherId, String subjectId, Integer year, Quarter quarter);
    // Lọc theo năm và quý
    List<SubjectRegistration> findByYearAndQuarter(Integer year, Quarter quarter);

    // Lọc theo trạng thái
    List<SubjectRegistration> findByStatus(RegistrationStatus status);
}
