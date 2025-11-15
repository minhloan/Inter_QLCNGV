package com.example.teacherservice.repository;

import com.example.teacherservice.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface AuditLogRepository extends JpaRepository<AuditLog, String> {
    @Query("SELECT al FROM AuditLog al " +
           "LEFT JOIN al.actorUser u " +
           "LEFT JOIN u.userDetails ud " +
           "WHERE (:keyword IS NULL OR :keyword = '' OR " +
           "       LOWER(al.action) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(al.entity) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(u.username) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(u.teacherCode) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
           "       LOWER(CONCAT(COALESCE(ud.firstName, ''), ' ', COALESCE(ud.lastName, ''))) LIKE LOWER(CONCAT('%', :keyword, '%'))) " +
           "ORDER BY al.creationTimestamp DESC")
    Page<AuditLog> search(@Param("keyword") String keyword, Pageable pageable);
}