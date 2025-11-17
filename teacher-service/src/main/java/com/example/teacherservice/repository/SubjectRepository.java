package com.example.teacherservice.repository;

import com.example.teacherservice.enums.SubjectSystem;
import com.example.teacherservice.model.Subject;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, String> {
    Optional<Subject> findBySubjectCode(String subjectCode);
    boolean existsBySubjectCode(String subjectCode);
    List<Subject> findBySubjectNameContainingIgnoreCase(String subjectName);
    boolean existsBySubjectCodeIgnoreCase(String subjectCode);
    // Tìm danh sách theo keyword (KHÔNG phân trang)
    @Query("""
           select s from Subject s
           where lower(s.subjectCode) like lower(concat('%', :keyword, '%'))
              or lower(s.subjectName) like lower(concat('%', :keyword, '%'))
           """)
    List<Subject> searchByKeyword(@Param("keyword") String keyword);

    // Search + filter (KHÔNG phân trang)
    @Query("""
           select s from Subject s
           where (:keyword is null or :keyword = '' 
                  or lower(s.subjectCode) like lower(concat('%', :keyword, '%'))
                  or lower(s.subjectName) like lower(concat('%', :keyword, '%')))
             and (:system is null or s.system = :system)
             and (:isActive is null or s.isActive = :isActive)
           """)
    List<Subject> searchWithFilters(@Param("keyword") String keyword,
                                    @Param("system") SubjectSystem system,
                                    @Param("isActive") Boolean isActive);

}

