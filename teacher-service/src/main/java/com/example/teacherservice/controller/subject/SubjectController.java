package com.example.teacherservice.controller.subject;


import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.enums.SubjectSystem;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.request.subject.SubjectCreateRequest;
import com.example.teacherservice.request.subject.SubjectUpdateRequest;
import com.example.teacherservice.service.subject.SubjectService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/teacher/subjects")
public class SubjectController {
    private final SubjectService subjectService;

    @GetMapping("/getAll")
    public ResponseEntity<List<Subject>> getAllSubject() {
        List<Subject> subjects = subjectService.getAllSubjects();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/search")
    public ResponseEntity<List<Subject>> searchSubjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) SubjectSystem system,
            @RequestParam(required = false) Boolean isActive
    ) {
        List<Subject> subjects = subjectService.searchSubjects(keyword, system, isActive);
        return ResponseEntity.ok(subjects);
    }

    @PostMapping("/save")
    public ResponseEntity<Subject> saveSubject(@Valid @RequestBody SubjectCreateRequest request) {
        Subject saved = subjectService.saveSubject(request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<Subject> getSubjectById(@PathVariable String id) {
        Subject subject = subjectService.getSubjectById(id);
        return ResponseEntity.ok(subject);
    }

    @PutMapping("/update")
    public ResponseEntity<Subject> updateSubject(@Valid @RequestBody SubjectUpdateRequest request) {
        Subject updated = subjectService.updateSubject(request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/deleteById/{id}")
    public ResponseEntity<Void> deleteSubjectById(@PathVariable String id) {
        subjectService.deleteSubjectById(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping
    public List<com.example.teacherservice.dto.subject.SubjectDto> getAllSubjects() {
        return subjectService.getAll();
    }

    @GetMapping("/getAllByTrial")
    public ResponseEntity<List<SubjectDto>> getAllSubjectsByTrial() {
        List<SubjectDto> subjects = subjectService.getAllSubjectsByTrial();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/searchByTrial")
    public ResponseEntity<List<SubjectDto>> searchSubjects(@RequestParam("q") String keyword) {
        List<SubjectDto> subjects = subjectService.searchSubjects(keyword);
        return ResponseEntity.ok(subjects);
    }
}