package com.example.teacherservice.repository;

import com.example.teacherservice.enums.AssignmentStatus;
import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.TeachingAssignment;
import com.example.teacherservice.model.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TeachingAssignmentRepository extends JpaRepository<TeachingAssignment, String> {
    List<TeachingAssignment> findByTeacher(User teacher);

    @Query("""
            SELECT ta FROM TeachingAssignment ta
            JOIN ta.teacher t
            JOIN ta.scheduleClass sc
            JOIN sc.subject s
            WHERE (
                    :keyword IS NULL OR :keyword = '' OR
                    LOWER(t.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                    LOWER(t.teacherCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                    LOWER(s.subjectName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                    LOWER(sc.classCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
              AND (:status IS NULL OR ta.status = :status)
              AND (:year IS NULL OR sc.year = :year)
              AND (:quarter IS NULL OR sc.quarter = :quarter)
            """)
    Page<TeachingAssignment> searchAssignments(@Param("keyword") String keyword,
                                               @Param("status") AssignmentStatus status,
                                               @Param("year") Integer year,
                                               @Param("quarter") Quarter quarter,
                                               Pageable pageable);

    @Query("""
            SELECT ta FROM TeachingAssignment ta
            JOIN ta.teacher t
            JOIN ta.scheduleClass sc
            JOIN sc.subject s
            WHERE t.id = :teacherId
              AND (
                    :keyword IS NULL OR :keyword = '' OR
                    LOWER(s.subjectName) LIKE LOWER(CONCAT('%', :keyword, '%')) OR
                    LOWER(sc.classCode) LIKE LOWER(CONCAT('%', :keyword, '%'))
                  )
              AND (:status IS NULL OR ta.status = :status)
              AND (:year IS NULL OR sc.year = :year)
            """)
    Page<TeachingAssignment> searchAssignmentsForTeacher(@Param("teacherId") String teacherId,
                                                         @Param("keyword") String keyword,
                                                         @Param("status") AssignmentStatus status,
                                                         @Param("year") Integer year,
                                                         Pageable pageable);


    @Query("SELECT ta FROM TeachingAssignment ta WHERE ta.teacher = :teacher AND ta.scheduleClass.subject = :subject AND ta.scheduleClass.year = :year AND ta.scheduleClass.quarter = :quarter")
    Optional<TeachingAssignment> findByTeacherAndSubjectAndYearAndQuarter(@Param("teacher") User teacher, @Param("subject") Subject subject, @Param("year") Integer year, @Param("quarter") com.example.teacherservice.enums.Quarter quarter);
    @Query("SELECT ta FROM TeachingAssignment ta WHERE ta.scheduleClass.subject = :subject")
    List<TeachingAssignment> findBySubject(@Param("subject") Subject subject);
    @Query("SELECT ta FROM TeachingAssignment ta WHERE ta.teacher.id = :teacherId AND ta.scheduleClass.year = :year AND ta.scheduleClass.quarter = :quarter")
    List<TeachingAssignment> findByTeacherIdAndYearAndQuarter(@Param("teacherId") String teacherId, @Param("year") Integer year, @Param("quarter") com.example.teacherservice.enums.Quarter quarter);

    @Query("SELECT ta FROM TeachingAssignment ta WHERE ta.teacher.id = :teacherId")
    List<TeachingAssignment> findByTeacherId(@Param("teacherId") String teacherId);

    @Query("SELECT COUNT(ta) FROM TeachingAssignment ta WHERE ta.status = :status")
    long countByStatus(@Param("status") AssignmentStatus status);

    @Query("SELECT COUNT(ta) FROM TeachingAssignment ta WHERE ta.teacher.id = :teacherId")
    long countByTeacherId(@Param("teacherId") String teacherId);
}

