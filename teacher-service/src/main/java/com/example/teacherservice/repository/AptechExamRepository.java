package com.example.teacherservice.repository;

import com.example.teacherservice.enums.ExamResult;
import com.example.teacherservice.model.AptechExam;
import com.example.teacherservice.model.User;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.AptechExamSession;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface AptechExamRepository extends JpaRepository<AptechExam, String> {
    List<AptechExam> findByTeacher(User teacher);
    List<AptechExam> findBySubject(Subject subject);
    Optional<AptechExam> findByTeacherAndSubjectAndAttempt(User teacher, Subject subject, Integer attempt);
    boolean existsByTeacher_IdAndSubject_IdAndResult(
            String teacherId,
            String subjectId,
            ExamResult result
    );

    List<AptechExam> findByTeacherIdAndSubjectId(String teacherId, String subjectId);

    @Query("SELECT ae FROM AptechExam ae WHERE ae.teacher.id = :teacherId AND YEAR(ae.examDate) = :year")
    List<AptechExam> findByTeacherIdAndYear(@Param("teacherId") String teacherId, @Param("year") Integer year);

    @Query("SELECT ae FROM AptechExam ae WHERE ae.teacher.id = :teacherId AND YEAR(ae.examDate) = :year AND QUARTER(ae.examDate) = :quarter")
    List<AptechExam> findByTeacherIdAndYearAndQuarter(@Param("teacherId") String teacherId, @Param("year") Integer year, @Param("quarter") Integer quarter);

    long countByResult(ExamResult result);

    @Query("SELECT COUNT(ae) FROM AptechExam ae WHERE ae.teacher.id = :teacherId")
    long countByTeacherId(@Param("teacherId") String teacherId);

    @Query("SELECT ae FROM AptechExam ae WHERE ae.teacher.id = :teacherId")
    List<AptechExam> findByTeacherId(@Param("teacherId") String teacherId);

    List<AptechExam> findBySession(AptechExamSession session);
}

