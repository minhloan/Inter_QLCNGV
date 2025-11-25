package com.example.teacherservice.repository;

import com.example.teacherservice.enums.TrialStatus;
import com.example.teacherservice.model.TrialTeaching;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.Subject;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface TrialTeachingRepository extends JpaRepository<TrialTeaching, String> {
    List<TrialTeaching> findByTeacher(User teacher);
    List<TrialTeaching> findBySubject(Subject subject);
    List<TrialTeaching> findByTeachingDate(LocalDate teachingDate);
    List<TrialTeaching> findByTeacher_Id(String teacherId);
    List<TrialTeaching> findByTeacherIdAndSubjectId(String teacherId, String subjectId);

    @Query("SELECT tt FROM TrialTeaching tt WHERE tt.teacher.id = :teacherId AND YEAR(tt.teachingDate) = :year")
    List<TrialTeaching> findByTeacherIdAndYear(@Param("teacherId") String teacherId, @Param("year") Integer year);

    @Query("SELECT tt FROM TrialTeaching tt WHERE tt.teacher.id = :teacherId AND YEAR(tt.teachingDate) = :year AND QUARTER(tt.teachingDate) = :quarter")
    List<TrialTeaching> findByTeacherIdAndYearAndQuarter(@Param("teacherId") String teacherId, @Param("year") Integer year, @Param("quarter") Integer quarter);

    @Query("SELECT COUNT(tt) FROM TrialTeaching tt WHERE tt.status = :status")
    long countByStatus(@Param("status") TrialStatus status);

    @Query("SELECT COUNT(tt) FROM TrialTeaching tt WHERE tt.teacher.id = :teacherId")
    long countByTeacherId(@Param("teacherId") String teacherId);

    @Query("SELECT tt FROM TrialTeaching tt WHERE tt.teacher.id = :teacherId")
    List<TrialTeaching> findByTeacherId(@Param("teacherId") String teacherId);

    // Date range filtering for statistics
    @Query("SELECT tt FROM TrialTeaching tt WHERE tt.teachingDate BETWEEN :startDate AND :endDate")
    List<TrialTeaching> findByTeachingDateBetween(@Param("startDate") LocalDate startDate, @Param("endDate") LocalDate endDate);

    @Query("SELECT tt FROM TrialTeaching tt WHERE YEAR(tt.teachingDate) = :year AND MONTH(tt.teachingDate) = :month")
    List<TrialTeaching> findByYearAndMonth(@Param("year") Integer year, @Param("month") Integer month);

    @Query("SELECT tt FROM TrialTeaching tt WHERE YEAR(tt.teachingDate) = :year")
    List<TrialTeaching> findByYear(@Param("year") Integer year);

}