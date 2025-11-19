package com.example.teacherservice.repository;

import com.example.teacherservice.model.Subject;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, String> {

    @EntityGraph(attributePaths = {"system"})
    List<Subject> findAll();

    Optional<Subject> findBySubjectCode(String subjectCode);

    boolean existsBySubjectCode(String subjectCode);

    boolean existsBySubjectCodeIgnoreCase(String subjectCode);

    // ⭐ Kiểm tra system đang được Subject sử dụng
    boolean existsBySystem_Id(String systemId);

    List<Subject> findBySubjectNameContainingIgnoreCase(String subjectName);

    @Query("""
           select s from Subject s
           where lower(s.subjectCode) like lower(concat('%', :keyword, '%'))
              or lower(s.subjectName) like lower(concat('%', :keyword, '%'))
           """)
    List<Subject> searchByKeyword(@Param("keyword") String keyword);

    @Query("""
       select s from Subject s
       where (:keyword is null or :keyword = '' 
              or lower(s.subjectCode) like lower(concat('%', :keyword, '%'))
              or lower(s.subjectName) like lower(concat('%', :keyword, '%')))
         and (:systemId is null or s.system.id = :systemId)
         and (:isActive is null or s.isActive = :isActive)
       """)
    List<Subject> searchWithFilters(@Param("keyword") String keyword,
                                    @Param("systemId") String systemId,
                                    @Param("isActive") Boolean isActive);
}