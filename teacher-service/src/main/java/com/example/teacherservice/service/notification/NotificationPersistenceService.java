package com.example.teacherservice.service.notification;

import com.example.teacherservice.model.Notification;
import com.example.teacherservice.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.dao.DataAccessException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Propagation;
import org.springframework.transaction.annotation.Transactional;

@RequiredArgsConstructor
@Service
public class NotificationPersistenceService {
    private final NotificationRepository notificationRepository;

    @Transactional(propagation = Propagation.REQUIRES_NEW)
    public Notification saveAndFlush(Notification n) throws DataAccessException {
        return notificationRepository.saveAndFlush(n);
    }
}
