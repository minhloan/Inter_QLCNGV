package com.example.teacherservice.controller.subject;

import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.request.subjectsystem.SubjectSystemCreateRequest;
import com.example.teacherservice.request.subjectsystem.SubjectSystemUpdateRequest;
import com.example.teacherservice.service.subjectsystem.SubjectSystemService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/teacher/subject-systems")
public class SubjectSystemController {

    private final SubjectSystemService subjectSystemService;

    // ===================== GET ALL =====================
    @GetMapping("/getAll")
    public ResponseEntity<List<SubjectSystem>> getAll() {
        return ResponseEntity.ok(subjectSystemService.getAll());
    }

    // ===================== GET ACTIVE =====================
    @GetMapping("/active")
    public ResponseEntity<List<SubjectSystem>> getActiveSystems() {
        return ResponseEntity.ok(subjectSystemService.getActiveSystems());
    }

    // ===================== GET BY ID =====================
    @GetMapping("/{id}")
    public ResponseEntity<SubjectSystem> getById(@PathVariable String id) {
        return ResponseEntity.ok(subjectSystemService.getById(id));
    }

    // ===================== SEARCH + FILTER =====================
    @GetMapping("/search")
    public ResponseEntity<List<SubjectSystem>> search(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) Boolean isActive
    ) {
        return ResponseEntity.ok(
                subjectSystemService.searchWithFilters(keyword, isActive)
        );
    }

    // ===================== CREATE =====================
    @PostMapping("/create")
    public ResponseEntity<SubjectSystem> create(
            @Valid @RequestBody SubjectSystemCreateRequest request
    ) {
        SubjectSystem created = subjectSystemService.createSystem(request);
        return ResponseEntity.ok(created);
    }

    // ===================== UPDATE =====================
    @PutMapping("/update")
    public ResponseEntity<SubjectSystem> update(
            @Valid @RequestBody SubjectSystemUpdateRequest request
    ) {
        SubjectSystem updated = subjectSystemService.updateSystem(request);
        return ResponseEntity.ok(updated);
    }

    // ===================== DELETE (SOFT) =====================
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        subjectSystemService.deleteSystem(id);
        return ResponseEntity.ok().build();
    }
}
