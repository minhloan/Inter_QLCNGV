package com.example.teacherservice.service.subject;

import com.example.teacherservice.dto.subject.SubjectDto;
import com.example.teacherservice.enums.SubjectSystem;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.File;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.repository.SubjectRepository;
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

    private final FileService fileService;
    @Override
    public Subject saveSubject(SubjectCreateRequest request) {
        // check trùng mã môn (giống check email ở SaveUser)
        if (subjectRepository.existsBySubjectCodeIgnoreCase(request.getSubjectCode())) {
            throw new IllegalArgumentException("Subject code already exists");
        }

        Subject subject = new Subject();
        subject.setSubjectCode(request.getSubjectCode());
        subject.setSubjectName(request.getSubjectName());
        subject.setCredit(request.getCredit());
        subject.setDescription(request.getDescription());
        subject.setSystem(request.getSystem());
        subject.setIsActive(
                request.getIsActive() != null
                        ? request.getIsActive()
                        : true
        );

        // liên kết ảnh nếu có imageFileId
        if (StringUtils.hasText(request.getImageFileId())) {
            File imageFile = fileService.findFileById(request.getImageFileId());
            subject.setImage_subject(imageFile);
        }

        return subjectRepository.save(subject);
    }

    @Override
    public Subject getSubjectById(String id) {
        return findSubjectById(id);
    }

    @Override
    public Subject findSubjectById(String id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Subject not found"));
    }


    @Override
    public Subject updateSubject(SubjectUpdateRequest request) {
        // giống updateUserById: lấy ra subject và update field nào có trong request
        Subject toUpdate = findSubjectById(request.getId());

        if (StringUtils.hasText(request.getSubjectName())) {
            toUpdate.setSubjectName(request.getSubjectName());
        }
        if (request.getCredit() != null) {
            toUpdate.setCredit(request.getCredit());
        }
        if (request.getDescription() != null) {
            toUpdate.setDescription(request.getDescription());
        }
        if (request.getSystem() != null) {
            toUpdate.setSystem(request.getSystem());
        }
        if (request.getIsActive() != null) {
            toUpdate.setIsActive(request.getIsActive());
        }

        // xử lý ảnh:
        // - nếu imageFileId = null -> không đụng tới ảnh
        // - nếu imageFileId = "" (chuỗi rỗng) -> xóa ảnh
        // - nếu imageFileId = id hợp lệ -> load File và set lại
        if (request.getImageFileId() != null) {
            if (!request.getImageFileId().isBlank()) {
                File imageFile = fileService.findFileById(request.getImageFileId());
                toUpdate.setImage_subject(imageFile);
            } else {
                // chuỗi rỗng => xóa ảnh hiện tại
                toUpdate.setImage_subject(null);
            }
        }

        return subjectRepository.save(toUpdate);
    }

    @Override
    public void deleteSubjectById(String id) {
        subjectRepository.deleteById(id);  // hoặc find rồi delete
    }


    @Override
    public List<Subject> getAllSubjects() {
        return subjectRepository.findAll();
    }

    @Override
    public List<Subject> searchSubjects(String keyword,
                                        SubjectSystem system,
                                        Boolean isActive) {
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return subjectRepository.searchWithFilters(kw, system, isActive);
    }

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