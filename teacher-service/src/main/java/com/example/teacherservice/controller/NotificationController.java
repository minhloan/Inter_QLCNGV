package com.example.teacherservice.controller;

import com.example.teacherservice.dto.notification.NotificationResponse;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.service.notification.NotificationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/notifications")
@RequiredArgsConstructor
public class NotificationController {
    private final NotificationService notificationService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getAll(HttpServletRequest request) {
        String userId = jwtUtil.ExtractUserId(request);
        List<NotificationResponse> responses = notificationService.getAll(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @GetMapping("/unread")
    public ResponseEntity<List<NotificationResponse>> getUnread(HttpServletRequest request) {
        String userId = jwtUtil.ExtractUserId(request);
        List<NotificationResponse> responses = notificationService.getUnread(userId)
                .stream()
                .map(NotificationResponse::from)
                .toList();
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable("id") String id, HttpServletRequest request) {
        String userId = jwtUtil.ExtractUserId(request);
        notificationService.markRead(userId, id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(HttpServletRequest request) {
        String userId = jwtUtil.ExtractUserId(request);
        notificationService.markAllRead(userId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable("id") String id, HttpServletRequest request) {
        String userId = jwtUtil.ExtractUserId(request);
        notificationService.delete(userId, id);
        return ResponseEntity.noContent().build();
    }
}