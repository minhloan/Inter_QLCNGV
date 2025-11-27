package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.File;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.SubjectSystemRepository;
import com.example.teacherservice.request.subject.SubjectCreateRequest;
import com.example.teacherservice.request.subject.SubjectUpdateRequest;
import com.example.teacherservice.service.file.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.stream.Collectors;

@Service("subjectService")
@RequiredArgsConstructor
public class SubjectServiceImpl implements SubjectService {

    private final SubjectRepository subjectRepository;
    private final SubjectSystemRepository systemRepository;
    private final FileService fileService;

    // CREATE
    @Override
    public Subject saveSubject(SubjectCreateRequest request) {

        SubjectSystem system = null;
        if (StringUtils.hasText(request.getSystemId())) {
            system = systemRepository.findById(request.getSystemId())
                    .orElseThrow(() -> new NotFoundException("System not found"));
        }

        Subject subject = new Subject();
        subject.setSubjectCode(request.getSubjectCode());
        subject.setSubjectName(request.getSubjectName());

        // HOURS OPTIONAL
        if (request.getHours() != null) {
            subject.setHours(request.getHours());
        } else {
            subject.setHours(null);
        }

        // SEMESTER OPTIONAL
        if (request.getSemester() != null) {
            subject.setSemester(request.getSemester());
        } else {
            subject.setSemester(null);
        }

        subject.setDescription(request.getDescription());
        subject.setSystem(system);
        subject.setIsActive(request.getIsActive() != null ? request.getIsActive() : true);

        if (StringUtils.hasText(request.getImageFileId())) {
            File img = fileService.findFileById(request.getImageFileId());
            subject.setImage_subject(img);
        }

        return subjectRepository.save(subject);
    }

    // READ
    @Override
    public Subject getSubjectById(String id) {
        return findSubjectById(id);
    }

    @Override
    public Subject findSubjectById(String id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subject not found"));
    }

    // UPDATE
    @Override
    public Subject updateSubject(SubjectUpdateRequest request) {

        Subject toUpdate = findSubjectById(request.getId());
        if (StringUtils.hasText(request.getSubjectName())) {
            toUpdate.setSubjectName(request.getSubjectName());
        }

        // HOURS OPTIONAL
        if (request.getHours() != null) {
            toUpdate.setHours(request.getHours());
        } else {
            toUpdate.setHours(null);
        }

        // SEMESTER OPTIONAL
        if (request.getSemester() != null) {
            toUpdate.setSemester(request.getSemester());
        } else {
            toUpdate.setSemester(null);
        }

        if (request.getDescription() != null) {
            toUpdate.setDescription(request.getDescription());
        }

        // SYSTEM
        if (request.getSystemId() != null) {
            if (!request.getSystemId().isBlank()) {
                SubjectSystem sys = systemRepository.findById(request.getSystemId())
                        .orElseThrow(() -> new NotFoundException("System not found"));
                toUpdate.setSystem(sys);
            } else {
                toUpdate.setSystem(null);
            }
        }

        if (request.getIsActive() != null) {
            toUpdate.setIsActive(request.getIsActive());
        }

        // IMAGE
        if (request.getImageFileId() != null) {
            if ("__DELETE__".equals(request.getImageFileId())) {
                toUpdate.setImage_subject(null);
            } else if (!request.getImageFileId().isBlank()) {
                File img = fileService.findFileById(request.getImageFileId());
                toUpdate.setImage_subject(img);
            }
        }

        return subjectRepository.save(toUpdate);
    }

    // DELETE (SOFT DELETE)
    @Override
    public void deleteSubjectById(String id) {
        Subject subject = findSubjectById(id);
        subjectRepository.delete(subject);
    }

    @Override
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public List<Subject> searchSubjects(String keyword,
                                        String systemId,
                                        Boolean isActive,
                                        Semester semester) {
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return subjectRepository.searchWithFilters(kw, systemId, isActive, semester);
    }

    @Override
    public List<SubjectDto> getAll() {
        return subjectRepository.findAll().stream()
                .map(this::toDto)
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


    @Override
    public SubjectDto toDto(Subject s) {
        return SubjectDto.builder()
                .id(s.getId())
                .subjectCode(s.getSubjectCode())
                .subjectName(s.getSubjectName())
                .hours(s.getHours())
                .semester(s.getSemester() != null ? s.getSemester().name() : null)
                .description(s.getDescription())
                .systemId(s.getSystem() != null ? s.getSystem().getId() : null)
                .systemName(s.getSystem() != null ? s.getSystem().getSystemName() : null)
                .isActive(s.getIsActive())
                .imageFileId(s.getImage_subject() != null ? s.getImage_subject().getId() : null)
                .isNewSubject(s.getIsNewSubject())
                .build();
    }
}