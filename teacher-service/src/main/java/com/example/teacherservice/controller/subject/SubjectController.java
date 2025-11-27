package com.example.teacherservice.controller.subject;


import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.enums.Semester;
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

    @GetMapping("/search")
    public ResponseEntity<List<SubjectDto>> searchSubjects(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String systemId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Semester semester
    ) {
        List<Subject> subjects =
                subjectService.searchSubjects(keyword, systemId, isActive, semester);

        List<SubjectDto> dtos = subjects.stream()
                .map(subjectService::toDto)
                .toList();

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/getAllRaw") // raw entity
    public ResponseEntity<List<Subject>> getAllSubjectRaw() {
        return ResponseEntity.ok(subjectService.getAllSubjects());
    }

    @PostMapping("/save")
    public ResponseEntity<Subject> saveSubject(@Valid @RequestBody SubjectCreateRequest request) {
        Subject saved = subjectService.saveSubject(request);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/getById/{id}")
    public ResponseEntity<SubjectDto> getSubjectById(@PathVariable String id) {
        Subject subject = subjectService.getSubjectById(id);
        SubjectDto dto = subjectService.toDto(subject);
        return ResponseEntity.ok(dto);
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
    public List<SubjectDto> getAllSubjects() {
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