package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectAssignmentDto;
import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.model.SubjectSystemAssignment;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.SubjectSystemAssignmentRepository;
import com.example.teacherservice.repository.SubjectSystemRepository;
import com.example.teacherservice.request.subject.SubjectAssignmentUpsertRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectAssignmentServiceImpl implements SubjectAssignmentService {

    private final SubjectRepository subjectRepository;
    private final SubjectSystemRepository systemRepository;
    private final SubjectSystemAssignmentRepository assignmentRepository;

    @Override
    @Transactional(readOnly = true)
    public List<SubjectAssignmentDto> getAssignmentsBySystem(String systemId,
                                                             String keyword,
                                                             Semester semester,
                                                             Boolean isActive) {
        SubjectSystem system = systemRepository.findById(systemId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hệ đào tạo"));

        List<SubjectSystemAssignment> assignments = assignmentRepository.findBySystem(system);

        String normalizedKeyword = keyword != null ? keyword.trim().toLowerCase(Locale.ROOT) : null;

        return assignments.stream()
                .filter(a -> filterAssignment(a, normalizedKeyword, semester, isActive))
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private boolean filterAssignment(SubjectSystemAssignment assignment,
                                     String keyword,
                                     Semester semester,
                                     Boolean isActive) {

        if (keyword != null && !keyword.isBlank()) {
            String code = assignment.getSubject().getSkillCode();
            String name = assignment.getSubject().getSubjectName();
            boolean match = (code != null && code.toLowerCase(Locale.ROOT).contains(keyword))
                    || (name != null && name.toLowerCase(Locale.ROOT).contains(keyword));
            if (!match) return false;
        }

        if (semester != null && assignment.getSemester() != semester) return false;

        if (isActive != null && !isActive.equals(assignment.getIsActive())) return false;

        return true;
    }

    @Override
    @Transactional
    public SubjectAssignmentDto upsert(SubjectAssignmentUpsertRequest request) {
        Subject subject = subjectRepository.findById(request.getSubjectId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy môn học"));

        SubjectSystem system = systemRepository.findById(request.getSystemId())
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hệ đào tạo"));

        SubjectSystemAssignment assignment;

        if (request.getId() != null && !request.getId().isBlank()) {
            assignment = assignmentRepository.findById(request.getId())
                    .orElseThrow(() -> new NotFoundException("Không tìm thấy cấu hình môn học"));
        } else {
            assignment = assignmentRepository.findBySubjectAndSystem(subject, system)
                    .orElse(SubjectSystemAssignment.builder()
                            .subject(subject)
                            .system(system)
                            .build());
        }

        assignment.setSemester(request.getSemester());
        assignment.setHours(request.getHours());
        assignment.setIsActive(request.getIsActive());
        assignment.setNote(request.getNote());

        SubjectSystemAssignment saved = assignmentRepository.save(assignment);
        return toDto(saved);
    }

    @Override
    @Transactional
    public void delete(String assignmentId) {
        assignmentRepository.deleteById(assignmentId);
    }

    private SubjectAssignmentDto toDto(SubjectSystemAssignment assignment) {
        Subject subject = assignment.getSubject();
        SubjectSystem system = assignment.getSystem();

        return SubjectAssignmentDto.builder()
                .id(assignment.getId())
                .subjectId(subject.getId())
                .subjectCode(subject.getSkillCode())
                .subjectName(subject.getSubjectName())
                .systemId(system.getId())
                .systemCode(system.getSystemCode())
                .systemName(system.getSystemName())
                .semester(assignment.getSemester())
                .hours(assignment.getHours())
                .isActive(assignment.getIsActive())
                .note(assignment.getNote())
                .build();
    }
}

