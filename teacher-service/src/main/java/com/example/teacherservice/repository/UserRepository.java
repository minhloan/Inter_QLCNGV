package com.example.teacherservice.repository;

import com.example.teacherservice.enums.Active;
import com.example.teacherservice.model.User;
import feign.Param;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    @Query("""
    select u from users u
    where lower(u.username) like lower(concat('%', :keyword, '%'))
       or lower(u.email)    like lower(concat('%', :keyword, '%'))
       or lower(coalesce(u.userDetails.phoneNumber, '')) like lower(concat('%', :keyword, '%'))""")
    List<User> searchByKeyword(@Param("keyword") String keyword);
    boolean existsByEmailIgnoreCase(String email);
    boolean existsByUsernameIgnoreCase(String username);

    List<User> findAllByActive(Active active);
    long countByActive(Active active);
    @Query("SELECT COUNT(u) FROM users u WHERE u.primaryRole = 'TEACHER' AND u.active = 'ACTIVE'")
    long countActiveTeachers();
    @Query("SELECT u FROM users u where u.active = 'ACTIVE'")
    List<User> findAll(Active active);
    
    List<User> findAllByActiveAndIdNot(Active active, String excludedUserId);
    
    Optional<User> findByTeacherCode(String teacherCode);
    
    // Tìm theo username hoặc teacher code (case-insensitive)
    @Query("""
    SELECT u FROM users u 
    WHERE LOWER(u.username) = LOWER(:searchTerm)
       OR LOWER(u.teacherCode) = LOWER(:searchTerm)
    """)
    Optional<User> findByUsernameOrTeacherCode(@Param("searchTerm") String searchTerm);
}

