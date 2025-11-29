package com.example.teacherservice.repository;

import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import jakarta.transaction.Transactional;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SubjectRepository extends JpaRepository<Subject, String> {

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

    List<Subject> findBySystem(SubjectSystem system);

    @EntityGraph(attributePaths = {"system", "skill"})
    List<Subject> findAll();

    // Refactored methods using Skill relationship
    Optional<Subject> findBySkill_SkillCode(String skillCode);
    
    List<Subject> findAllBySkill_SkillCode(String skillCode);

    Optional<Subject> findBySkill_SkillCodeIgnoreCase(String skillCode);

    boolean existsBySkill_SkillCode(String skillCode);

    boolean existsBySkill_SkillCodeIgnoreCase(String skillCode);

    Optional<Subject> findBySubjectNameIgnoreCaseAndSystem(String subjectName, SubjectSystem system);


    Optional<Subject> findBySkill_SkillCodeIgnoreCaseAndSystem(String skillCode, SubjectSystem system);

    boolean existsBySubjectNameIgnoreCaseAndSystem(String subjectName, SubjectSystem system);

    boolean existsBySystem_Id(String systemId);

    List<Subject> findBySubjectNameContainingIgnoreCase(String subjectName);

    @Query("""
           select s from Subject s
           where lower(s.skill.skillCode) like lower(concat('%', :keyword, '%'))
              or lower(s.subjectName) like lower(concat('%', :keyword, '%'))
           """)
    List<Subject> searchByKeyword(@Param("keyword") String keyword);

    @Query("""
       select s from Subject s
       where (:keyword is null or :keyword = '' 
              or lower(s.skill.skillCode) like lower(concat('%', :keyword, '%'))
              or lower(s.subjectName) like lower(concat('%', :keyword, '%')))
         and (:systemId is null or s.system.id = :systemId)
         and (:isActive is null or s.isActive = :isActive)
         and (:semester is null or s.semester = :semester)
       """)
    List<Subject> searchWithFilters(@Param("keyword") String keyword,
                                    @Param("systemId") String systemId,
                                    @Param("isActive") Boolean isActive,
                                    @Param("semester") Semester semester);
    List<Subject> findByIsActive(boolean isActive);

    @Query("SELECT COUNT(s) FROM Subject s WHERE s.isActive = :isActive")
    long countByIsActive(boolean isActive);

    @Modifying
    @Transactional
    @Query("UPDATE Subject s SET s.isActive = :active WHERE s.system.id = :systemId")
    void updateSubjectsActiveBySystem(@Param("systemId") String systemId,
                                      @Param("active") Boolean active);
    @Modifying
    @Transactional
    @Query("DELETE FROM Subject s WHERE s.system.id = :systemId")
    void deleteBySystemId(@Param("systemId") String systemId);

}