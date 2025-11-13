package com.example.teacherservice.dto.notification;

import com.example.teacherservice.model.Notification;

import java.time.LocalDateTime;

public record NotificationResponse(
        String id,
        String title,
        String message,
        String type,
        boolean isRead,
        String relatedEntity,
        String relatedId,
        LocalDateTime createdAt
) {
    public static NotificationResponse from(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getType() != null ? notification.getType().name().toLowerCase() : "info",
                Boolean.TRUE.equals(notification.getRead()),
                notification.getRelatedEntity(),
                notification.getRelatedId(),
                notification.getCreationTimestamp()
        );
    }
}


