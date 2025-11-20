package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.request.subject.SubjectCreateRequest;
import com.example.teacherservice.request.subject.SubjectUpdateRequest;

import java.util.List;

public interface SubjectService {
    List<SubjectDto> getAll();
    List<SubjectDto> getAllSubjectsByTrial();
    List<SubjectDto> searchSubjects(String keyword);
    SubjectDto toDto(Subject subject);
    Subject saveSubject(SubjectCreateRequest request);

    Subject getSubjectById(String id);

    Subject findSubjectById(String id);

    Subject updateSubject(SubjectUpdateRequest request);

    void deleteSubjectById(String id);

    List<Subject> getAllSubjects();

    List<Subject> searchSubjects(String keyword,
                                 String systemId,
                                 Boolean isActive,
                                 Semester semester);
}