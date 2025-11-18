package com.example.teacherservice.controller;

import com.example.teacherservice.enums.AssignmentStatus;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.request.TeachingAssignmentCreateRequest;
import com.example.teacherservice.request.TeachingAssignmentStatusUpdateRequest;
import com.example.teacherservice.response.TeachingAssignmentDetailResponse;
import com.example.teacherservice.response.TeachingAssignmentListItemResponse;
import com.example.teacherservice.response.TeachingEligibilityResponse;
import com.example.teacherservice.service.teachingassignmentserivce.TeachingAssignmentService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    public ResponseEntity<Page<TeachingAssignmentListItemResponse>> getAssignments(
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AssignmentStatus status,
            @RequestParam(required = false) String semester
    ) {
        Page<TeachingAssignmentListItemResponse> response =
                teachingAssignmentService.searchAssignments(keyword, status, semester, page, size);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/my")
    public ResponseEntity<Page<TeachingAssignmentListItemResponse>> getMyAssignments(
            HttpServletRequest request,
            @RequestParam(defaultValue = "0") Integer page,
            @RequestParam(defaultValue = "10") Integer size,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) AssignmentStatus status,
            @RequestParam(required = false) Integer year
    ) {
        String teacherUserId = jwtUtil.ExtractUserId(request);

        Page<TeachingAssignmentListItemResponse> response =
                teachingAssignmentService.searchAssignmentsForTeacher(
                        teacherUserId,
                        keyword,
                        status,
                        year,
                        page,
                        size
                );

        return ResponseEntity.ok(response);
    }
}