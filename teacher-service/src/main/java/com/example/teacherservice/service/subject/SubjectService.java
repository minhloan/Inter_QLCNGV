package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.enums.SubjectSystem;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.request.subject.SubjectCreateRequest;
import com.example.teacherservice.request.subject.SubjectUpdateRequest;

import java.util.List;

public interface SubjectService {
    List<SubjectDto> getAll();
    List<SubjectDto> getAllSubjectsByTrial();
    List<SubjectDto> searchSubjects(String keyword);

    Subject saveSubject(SubjectCreateRequest request);

    Subject getSubjectById(String id);

    Subject findSubjectById(String id);

    Subject updateSubject(SubjectUpdateRequest request);

    void deleteSubjectById(String id);   // soft delete = isActive = false

    // KHÔNG PHÂN TRANG NỮA
    List<Subject> getAllSubjects();

    List<Subject> searchSubjects(String keyword,
                                 SubjectSystem system,
                                 Boolean isActive);
}