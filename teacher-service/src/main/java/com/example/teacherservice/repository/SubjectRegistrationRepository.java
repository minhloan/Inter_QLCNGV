package com.example.teacherservice.repository;

import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.model.User;
import feign.Param;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

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

    boolean existsByTeacher_IdAndSubject_IdAndStatus(
            String teacherId,
            String subjectId,
            RegistrationStatus status
    );
    Optional<SubjectRegistration> findByTeacherAndSubjectAndYearAndQuarter(
            User teacher, Subject subject, Integer year, Quarter quarter);
    List<SubjectRegistration> findByTeacher(User teacher);
    List<SubjectRegistration> findBySubject(Subject subject);
    List<SubjectRegistration> findByTeacherIdAndYearAndQuarter(String teacherId, Integer year, Quarter quarter);

    @Query("SELECT sr FROM SubjectRegistration sr WHERE sr.teacher.id = :teacherId AND sr.year = :year")
    List<SubjectRegistration> findByTeacherIdAndYear(@Param("teacherId") String teacherId, @Param("year") Integer year);

    long countByStatus(RegistrationStatus status);

    @Query("SELECT COUNT(sr) FROM SubjectRegistration sr WHERE sr.teacher.id = :teacherId")
    long countByTeacherId(@Param("teacherId") String teacherId);

    @Query("SELECT sr FROM SubjectRegistration sr WHERE sr.teacher.id = :teacherId")
    List<SubjectRegistration> findByTeacherId(@Param("teacherId") String teacherId);
    @Override
    @EntityGraph(attributePaths = {"teacher", "subject"})
    List<SubjectRegistration> findAll();


}