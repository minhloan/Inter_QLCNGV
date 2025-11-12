package com.example.teacherservice.service.auditlog;

import com.example.teacherservice.model.AuditLog;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.AuditLogRepository;
import com.example.teacherservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@RequiredArgsConstructor
@Service
public class AuditLogServiceImpl implements AuditLogService{
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public AuditLog writeAndBroadcast(String actorUserId, String action, String entity, String entityId, String metaJson) {
        User actor = actorUserId != null ? userRepository.findById(actorUserId).orElse(null) : null;

        AuditLog log = AuditLog.builder()
                .actorUser(actor)
                .action(action)
                .entity(entity)
                .entityId(entityId)
                .metaJson(metaJson)
                .build();
        AuditLog saved = auditLogRepository.save(log);

        var payload = new AuditPayload(
                saved.getId(),
                actor != null ? actor.getId() : null,
                action, entity, entityId, metaJson,
                saved.getCreationTimestamp()
        );
        messagingTemplate.convertAndSend("/topic/audit", payload);
        return saved;
    }

    @Override
    public Page<AuditLog> list(Pageable pageable) {
        return auditLogRepository.findAll(pageable);
    }

    public record AuditPayload(
            String id, String actorUserId, String action, String entity,
            String entityId, String metaJson, java.time.LocalDateTime createdAt
    ) {}
}
