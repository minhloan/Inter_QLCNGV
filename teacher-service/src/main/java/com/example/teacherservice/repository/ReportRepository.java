package com.example.teacherservice.repository;

import com.example.teacherservice.model.Report;
import com.example.teacherservice.model.User;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByTeacher(User teacher);
    List<Report> findByReportType(String reportType);
    List<Report> findByYearAndQuarter(Integer year, Integer quarter);

    List<Report> findByTeacherIdAndReportTypeOrderByCreationTimestampDesc(String teacherId, String reportType);

    List<Report> findByReportTypeAndYearAndQuarterOrderByCreationTimestampDesc(String reportType, Integer year, Integer quarter);

    List<Report> findByReportTypeAndYearOrderByCreationTimestampDesc(String reportType, Integer year);

    @Query("SELECT r FROM Report r WHERE r.teacher.id = :teacherId ORDER BY r.creationTimestamp DESC")
    List<Report> findByTeacherIdOrderByCreationTimestampDesc(@Param("teacherId") String teacherId);

    @Query("SELECT COUNT(r) FROM Report r WHERE r.reportType = :reportType AND r.year = :year AND (:quarter IS NULL OR r.quarter = :quarter)")
    long countByReportTypeAndYearAndQuarter(@Param("reportType") String reportType, @Param("year") Integer year, @Param("quarter") Integer quarter);

    @Query("SELECT r FROM Report r WHERE r.reportType = :reportType AND r.year = :year AND (:quarter IS NULL OR r.quarter = :quarter) ORDER BY r.creationTimestamp DESC")
    List<Report> findByReportTypeAndYearAndQuarter(@Param("reportType") String reportType, @Param("year") Integer year, @Param("quarter") Integer quarter);
}