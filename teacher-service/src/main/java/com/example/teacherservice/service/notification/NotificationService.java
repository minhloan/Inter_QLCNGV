package com.example.teacherservice.service.notification;

import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.model.Notification;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public interface NotificationService {
    Notification createAndSend(String userId, String title, String message, NotificationType type, String relatedEntity, String relatedId);
    void broadcast(String currentUserId, String title, String message, NotificationType type, String relatedEntity, String relatedId);
    List<Notification> getAll(String userId);
    List<Notification> getUnread(String userId);
    void markRead(String userId, String notificationId);
    void markAllRead(String userId);
    void delete(String userId, String notificationId);
}
