package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.File;
import com.example.teacherservice.model.Skill;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.repository.SkillRepository;
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
    private final SkillRepository skillRepository;
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
        
        // Find or create Skill if skillCode provided (via subjectCode param)
        if (StringUtils.hasText(request.getSubjectCode())) {
            Skill skill = skillRepository.findBySkillCode(request.getSubjectCode())
                    .orElseGet(() -> {
                        Skill newSkill = Skill.builder()
                                .skillCode(request.getSubjectCode())
                                .skillName(request.getDescription())
                                .isActive(true)
                                .build();
                        return skillRepository.save(newSkill);
                    });
            subject.setSkill(skill);
        }
        
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
            toUpdate.setSubjectName(request.getSubjectName().trim());
        }

        // Update Skill if code/description provided
        if (request.getSubjectCode() != null && !request.getSubjectCode().isBlank()) {
            String code = request.getSubjectCode().trim();
            
            // Check if skill already exists
            Skill existingSkill = skillRepository.findBySkillCode(code).orElse(null);
            
            if (existingSkill != null) {
                // Skill exists - just link it
                toUpdate.setSkill(existingSkill);
            } else {
                // Creating NEW skill - validate description is required
                if (!StringUtils.hasText(request.getDescription())) {
                    throw new IllegalArgumentException(
                        "Mô tả (Description) là bắt buộc khi thêm Skill Code mới chưa có trong hệ thống"
                    );
                }
                
                // Create and save new skill
                Skill newSkill = Skill.builder()
                        .skillCode(code)
                        .skillName(request.getDescription().trim())
                        .isActive(true)
                        .isNew(true)  // Mark as new skill
                        .build();
                Skill savedSkill = skillRepository.save(newSkill);
                
                // Link the new skill
                toUpdate.setSkill(savedSkill);
                
                // Mark this subject as having a new skill
                toUpdate.setIsNewSubject(true);
            }
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
                .subjectCode(s.getSkillCode())
                .subjectName(s.getSubjectName())
                .hours(s.getHours())
                .semester(s.getSemester() != null ? s.getSemester().name() : null)
                .description(s.getSkillName())
                .systemId(s.getSystem() != null ? s.getSystem().getId() : null)
                .systemName(s.getSystem() != null ? s.getSystem().getSystemName() : null)
                .isActive(s.getIsActive())
                .imageFileId(s.getImage_subject() != null ? s.getImage_subject().getId() : null)
                .isNewSubject(s.getIsNewSubject())
                .build();
    }
}