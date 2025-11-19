package com.example.teacherservice.controller;

import com.example.teacherservice.dto.aptech.AptechExamSessionDto;
import com.example.teacherservice.service.aptech.AptechExamService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/aptech-exam-session")
@RequiredArgsConstructor
public class AptechExamSessionController {

    private final AptechExamService aptechExamService;

    @GetMapping
    public ResponseEntity<List<AptechExamSessionDto>> getAllSessions() {
        List<AptechExamSessionDto> sessions = aptechExamService.getAllSessions();
        return ResponseEntity.ok(sessions);
    }
}
