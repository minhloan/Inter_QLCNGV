package com.example.teacherservice.service.notification;

import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.model.Notification;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.NotificationRepository;
import com.example.teacherservice.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class NotificationServiceImpl implements NotificationService{
    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Override
    public Notification createAndSend(String userId, String title, String message, NotificationType type, String relatedEntity, String relatedId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .type(type)
                .relatedEntity(relatedEntity)
                .relatedId(relatedId)
                .build();
        Notification saved = notificationRepository.save(n);
        var payload = new NotificationPayload(
                saved.getId(), title, message,
                type != null ? type.name() : null,
                relatedEntity, relatedId, saved.getCreationTimestamp()
        );
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", payload);
        return saved;
    }

    @Override
    public List<Notification> getUnread(String userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found with id: " + userId));

        return notificationRepository.findByUserAndReadOrderByCreationTimestampDesc(user,false);
    }

    @Override
    public void markRead(String userId, String notificationId) {
        Notification n = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found with id: " + notificationId));
        if(!n.getUser().getId().equals(userId))
            throw new IllegalArgumentException("Notification không thuộc về người dùng.");
        n.setRead(true);
        notificationRepository.save(n);
    }

    @Override
    public void markAllRead(String userId) {
        List<Notification> list = getUnread(userId);
        for (Notification n : list)
            n.setRead(true);
        notificationRepository.saveAll(list);
    }

    public record NotificationPayload(
            String id, String title, String message, String type,
            String relatedEntity, String relatedId, java.time.LocalDateTime createdAt
    ) {}
}
