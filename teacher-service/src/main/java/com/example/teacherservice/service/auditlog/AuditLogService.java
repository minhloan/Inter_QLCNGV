package com.example.teacherservice.service.auditlog;

import com.example.teacherservice.dto.log.AuditLogDto;
import com.example.teacherservice.model.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuditLogService {
    AuditLog writeAndBroadcast(String actorUserId, String action,
                               String entity, String entityId, String metaJson);
    Page<AuditLogDto> list(Pageable pageable);

    Page<AuditLogDto> search(String keyword, Pageable pageable);
}
