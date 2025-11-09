package com.example.teacherservice.model;

import com.example.teacherservice.enums.NotificationType;
import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "notifications", indexes = {
    @Index(name = "idx_user_read", columnList = "user_id,is_read"),
    @Index(name = "idx_type", columnList = "type"),
    @Index(name = "idx_creation_timestamp", columnList = "creation_timestamp")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Notification extends BaseEntity {
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 50)
    private NotificationType type;

    @Column(name = "is_read", nullable = false)
    @Builder.Default
    private Boolean read = false;

    @Column(name = "related_entity", length = 50)
    private String relatedEntity;

    @Column(name = "related_id", length = 64)
    private String relatedId;
}