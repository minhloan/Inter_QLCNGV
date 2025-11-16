package com.example.teacherservice.controller.subject;


import com.example.teacherservice.service.subject.SubjectService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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
}