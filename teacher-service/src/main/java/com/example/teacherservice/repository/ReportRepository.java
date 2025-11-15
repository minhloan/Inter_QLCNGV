package com.example.teacherservice.repository;

import com.example.teacherservice.model.Report;
import com.example.teacherservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReportRepository extends JpaRepository<Report, String> {
    List<Report> findByTeacher(User teacher);
    List<Report> findByReportType(String reportType);
    List<Report> findByYearAndQuarter(Integer year, Integer quarter);
}

