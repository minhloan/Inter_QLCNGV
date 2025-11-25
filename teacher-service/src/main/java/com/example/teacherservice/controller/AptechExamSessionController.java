package com.example.teacherservice.controller;

import com.example.teacherservice.dto.aptech.AptechExamSessionDto;
import com.example.teacherservice.dto.common.PagedResponse;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.service.aptech.AptechExamService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/aptech-exam-session")
@RequiredArgsConstructor
public class AptechExamSessionController {

    private final AptechExamService aptechExamService;
    private final JwtUtil jwtUtil;

    @GetMapping
    public ResponseEntity<List<AptechExamSessionDto>> getAllSessions() {
        List<AptechExamSessionDto> sessions = aptechExamService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }

    @GetMapping("/upcoming")
    public ResponseEntity<PagedResponse<AptechExamSessionDto>> getUpcomingSessions(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String search
    ) {
        PagedResponse<AptechExamSessionDto> response = aptechExamService.getUpcomingSessions(page, size, search);
        return ResponseEntity.ok(response);
    }

    @PostMapping
    public ResponseEntity<AptechExamSessionDto> createSession(@RequestBody AptechExamSessionDto dto, HttpServletRequest request) {
        if (dto.getExamDate() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
        String userId = jwtUtil.ExtractUserId(request);
        AptechExamSessionDto created = aptechExamService.createSession(dto, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
}
