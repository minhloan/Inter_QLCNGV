package com.example.teacherservice.controller.subject;


import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.service.subject.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/teacher/subjects")
public class SubjectController {
    private final SubjectService subjectService;

    @GetMapping
    public List<com.example.teacherservice.dto.subject.SubjectDto> getAllSubjects() {
        return subjectService.getAll();
    }

    @GetMapping("/getAllByTrial")
    public ResponseEntity<List<SubjectDto>> getAllSubjectsByTrial() {
        List<SubjectDto> subjects = subjectService.getAllSubjectsByTrial();
        return ResponseEntity.ok(subjects);
    }

    @GetMapping("/search")
    public ResponseEntity<List<SubjectDto>> searchSubjects(@RequestParam("q") String keyword) {
        List<SubjectDto> subjects = subjectService.searchSubjects(keyword);
        return ResponseEntity.ok(subjects);
    }
}