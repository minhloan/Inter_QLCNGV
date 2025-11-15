package com.example.teacherservice.controller;

import com.example.teacherservice.dto.log.AuditLogDto;
import com.example.teacherservice.service.auditlog.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/v1/teacher/audit-logs")
@RequiredArgsConstructor
public class AuditLogController {
    private final AuditLogService auditLogService;

    @GetMapping
    public ResponseEntity<Page<AuditLogDto>> list(@RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "20") int size,
                                                  @RequestParam(required = false) String keyword) {
        Page<AuditLogDto> result = auditLogService.search(keyword, PageRequest.of(page, size));
        return ResponseEntity.ok(result);
    }
}