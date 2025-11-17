package com.example.teacherservice.repository;

import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.model.ScheduleClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ScheduleClassRepository extends JpaRepository<ScheduleClass, String> {
    Optional<ScheduleClass> findFirstBySubject_IdAndYearAndQuarter(
            String subjectId,
            Integer year,
            Quarter quarter
    );
    long countBySubject_IdAndYearAndQuarter(String subjectId, Integer year, Quarter quarter);
}
