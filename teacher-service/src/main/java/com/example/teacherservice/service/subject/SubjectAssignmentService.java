package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectAssignmentDto;
import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.request.subject.SubjectAssignmentUpsertRequest;

import java.util.List;

public interface SubjectAssignmentService {

    List<SubjectAssignmentDto> getAssignmentsBySystem(String systemId,
                                                      String keyword,
                                                      Semester semester,
                                                      Boolean isActive);

    SubjectAssignmentDto upsert(SubjectAssignmentUpsertRequest request);

    void delete(String assignmentId);
}

