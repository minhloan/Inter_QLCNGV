package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.repository.SubjectRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service("subjectService")
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {
    private final SubjectRepository subjectRepository;

    @Override
    public List<SubjectDto> getAll() {
        return subjectRepository.findAll().stream()
                .map(s -> SubjectDto.builder()
                        .id(s.getId())
                        .subjectCode(s.getSubjectCode())
                        .subjectName(s.getSubjectName())
                        .credit(s.getCredit())
                        .system(s.getSystem())
                        .isActive(s.getIsActive())
                        .build())
                .collect(Collectors.toList());
    }

    @Override
    public List<SubjectDto> getAllSubjectsByTrial() {
        return subjectRepository.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubjectDto> searchSubjects(String keyword) {
        return subjectRepository.findBySubjectNameContainingIgnoreCase(keyword).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    private SubjectDto toDto(Subject subject) {
        return SubjectDto.builder()
                .id(subject.getId())
                .subjectCode(subject.getSubjectCode())
                .subjectName(subject.getSubjectName())
                .credit(subject.getCredit())
                .description(subject.getDescription())
                .system(subject.getSystem())
                .isActive(subject.getIsActive())
                .build();
    }
}