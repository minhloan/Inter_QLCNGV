package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectDto;
import java.util.List;

public interface SubjectService {
    List<SubjectDto> getAll();
    List<SubjectDto> getAllSubjectsByTrial();
    List<SubjectDto> searchSubjects(String keyword);
}