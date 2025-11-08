package com.example.teacherservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "audit_logs", indexes = {
    @Index(name = "idx_entity_id", columnList = "entity,entity_id"),
    @Index(name = "idx_actor_user", columnList = "actor_user_id"),
    @Index(name = "idx_creation_timestamp", columnList = "creation_timestamp")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuditLog extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_user_id")
    private User actorUser;

    @Column(name = "action", length = 50)
    private String action;

    @Column(name = "entity", length = 50)
    private String entity;

    @Column(name = "entity_id", length = 64)
    private String entityId;

    @Column(name = "meta_json", columnDefinition = "TEXT")
    private String metaJson;
}

