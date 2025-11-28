package com.example.teacherservice.controller.subject;

import com.example.teacherservice.dto.subject.SubjectAssignmentDto;
import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.request.subject.SubjectAssignmentUpsertRequest;
import com.example.teacherservice.service.subject.SubjectAssignmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/teacher/subject-assignments")
public class SubjectAssignmentController {

    private final SubjectAssignmentService assignmentService;

    @GetMapping("/system/{systemId}")
    public ResponseEntity<List<SubjectAssignmentDto>> getAssignmentsBySystem(
            @PathVariable String systemId,
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Semester semester,
            @RequestParam(required = false) Boolean isActive
    ) {
        return ResponseEntity.ok(
                assignmentService.getAssignmentsBySystem(systemId, keyword, semester, isActive)
        );
    }

    @PostMapping
    public ResponseEntity<SubjectAssignmentDto> upsertAssignment(
            @Valid @RequestBody SubjectAssignmentUpsertRequest request
    ) {
        return ResponseEntity.ok(assignmentService.upsert(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAssignment(@PathVariable String id) {
        assignmentService.delete(id);
        return ResponseEntity.ok().build();
    }
}

