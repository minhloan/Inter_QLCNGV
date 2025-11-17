package com.example.teacherservice.controller;

import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.request.TeachingAssignmentCreateRequest;
import com.example.teacherservice.request.TeachingAssignmentStatusUpdateRequest;
import com.example.teacherservice.response.TeachingAssignmentDetailResponse;
import com.example.teacherservice.response.TeachingAssignmentListItemResponse;
import com.example.teacherservice.response.TeachingEligibilityResponse;
import com.example.teacherservice.service.teachingassignmentserivce.TeachingAssignmentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/teacher/teachingAssignment")
public class TeachingAssignment {

    private final JwtUtil jwtUtil;
    private final TeachingAssignmentService teachingAssignmentService;

    @GetMapping("/eligibility")
    ResponseEntity<TeachingEligibilityResponse> checkEligibility(
            @RequestParam String teacherId,
            @RequestParam String subjectId) {
        return ResponseEntity.ok(
                teachingAssignmentService.checkEligibility(teacherId, subjectId)
        );
    }

    @PostMapping
    ResponseEntity<TeachingAssignmentDetailResponse> createAssignment(
            @RequestBody TeachingAssignmentCreateRequest request,
            HttpServletRequest httpServletRequest
    ) {
        String assignedByUserId = jwtUtil.ExtractUserId(httpServletRequest);
        TeachingAssignmentDetailResponse response =
                teachingAssignmentService.createAssignment(request, assignedByUserId);

        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<TeachingAssignmentDetailResponse> updateStatus(
            @PathVariable String id,
            @RequestBody TeachingAssignmentStatusUpdateRequest request) {

        TeachingAssignmentDetailResponse response =
                teachingAssignmentService.updateStatus(id, request);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<TeachingAssignmentDetailResponse> getDetail(@PathVariable String id) {
        TeachingAssignmentDetailResponse response = teachingAssignmentService.getById(id);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<TeachingAssignmentListItemResponse>> getAllAssignments() {
        return ResponseEntity.ok(
                teachingAssignmentService.getAllAssignments()
        );
    }
}