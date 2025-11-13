package com.example.teacherservice.repository;

import com.example.teacherservice.model.Notification;
import com.example.teacherservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, String> {
    List<Notification> findByUserAndReadOrderByCreationTimestampDesc(User user, boolean read);
    List<Notification> findByUserOrderByCreationTimestampDesc(User user);
}