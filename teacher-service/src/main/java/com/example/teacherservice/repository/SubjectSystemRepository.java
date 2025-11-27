package com.example.teacherservice.repository;

import com.example.teacherservice.model.SubjectSystem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubjectSystemRepository extends JpaRepository<SubjectSystem, String> {
    boolean existsBySystemCodeIgnoreCase(String systemCode);

    SubjectSystem findBySystemCode(String systemCode);

    Optional<SubjectSystem> findBySystemCodeIgnoreCase(String systemCode);

    List<SubjectSystem> findBySystemNameContainingIgnoreCase(String name);

    List<SubjectSystem> findByIsActiveTrue();

    @Query("""
           SELECT ss
           FROM SubjectSystem ss
           WHERE lower(ss.systemCode) LIKE lower(concat('%', :keyword, '%'))
              OR lower(ss.systemName) LIKE lower(concat('%', :keyword, '%'))
           """)
    List<SubjectSystem> searchByKeyword(@Param("keyword") String keyword);
    @Query("SELECT s FROM SubjectSystem s " +
            "WHERE LOWER(:sheet) LIKE CONCAT('%', LOWER(s.systemName), '%') " +
            "   OR LOWER(s.systemName) LIKE CONCAT('%', LOWER(:sheet), '%')")
    SubjectSystem findMatchingSystem(@Param("sheet") String sheet);

    @Query("""
           SELECT ss
           FROM SubjectSystem ss
           WHERE (:keyword IS NULL OR :keyword = '' 
                 OR lower(ss.systemCode) LIKE lower(concat('%', :keyword, '%'))
                 OR lower(ss.systemName) LIKE lower(concat('%', :keyword, '%')))
             AND (:isActive IS NULL OR ss.isActive = :isActive)
           """)
    List<SubjectSystem> searchWithFilters(
            @Param("keyword") String keyword,
            @Param("isActive") Boolean isActive
    );
}