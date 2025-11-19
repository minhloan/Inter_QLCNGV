package com.example.teacherservice.service.subjectsystem;

import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.SubjectSystemRepository;
import com.example.teacherservice.request.subjectsystem.SubjectSystemCreateRequest;
import com.example.teacherservice.request.subjectsystem.SubjectSystemUpdateRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectSystemServiceImpl implements SubjectSystemService {

    private final SubjectSystemRepository subjectSystemRepository;
    private final SubjectRepository subjectRepository;

    // -------------------------------------------------
    // GET ALL
    // -------------------------------------------------
    @Override
    public List<SubjectSystem> getAll() {
        return subjectSystemRepository.findAll();
    }

    @Override
    public List<SubjectSystem> getActiveSystems() {
        return subjectSystemRepository.findByIsActiveTrue();
    }

    // -------------------------------------------------
    // SEARCH
    // -------------------------------------------------
    @Override
    public List<SubjectSystem> search(String keyword) {
        if (!StringUtils.hasText(keyword)) return getAll();
        return subjectSystemRepository.searchByKeyword(keyword.trim());
    }

    @Override
    public List<SubjectSystem> searchWithFilters(String keyword, Boolean isActive) {
        String kw = (keyword == null || keyword.isBlank()) ? null : keyword.trim();
        return subjectSystemRepository.searchWithFilters(kw, isActive);
    }

    // -------------------------------------------------
    // GET BY ID
    // -------------------------------------------------
    @Override
    public SubjectSystem getById(String id) {
        return subjectSystemRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("System not found"));
    }

    // -------------------------------------------------
    // CREATE
    // -------------------------------------------------
    @Override
    public SubjectSystem createSystem(SubjectSystemCreateRequest req) {

        if (subjectSystemRepository.existsBySystemCodeIgnoreCase(req.getSystemCode())) {
            throw new IllegalArgumentException("System code already exists");
        }

        SubjectSystem system = SubjectSystem.builder()
                .systemCode(req.getSystemCode())
                .systemName(req.getSystemName())
                .isActive(true)
                .build();

        return subjectSystemRepository.save(system);
    }

    // -------------------------------------------------
    // UPDATE
    // -------------------------------------------------
    @Override
    public SubjectSystem updateSystem(SubjectSystemUpdateRequest req) {

        SubjectSystem system = getById(req.getId());

        if (StringUtils.hasText(req.getSystemCode())) {
            system.setSystemCode(req.getSystemCode());
        }

        if (StringUtils.hasText(req.getSystemName())) {
            system.setSystemName(req.getSystemName());
        }

        if (req.getIsActive() != null) {
            system.setIsActive(req.getIsActive());
        }

        return subjectSystemRepository.save(system);
    }

    @Override
    public void deleteSystem(String id) {

        boolean inUse = subjectRepository.existsBySystem_Id(id);
        if (inUse) {
            throw new IllegalStateException("Không thể xoá hệ đào tạo vì còn môn học đang sử dụng");
        }

        SubjectSystem sys = getById(id);
        subjectSystemRepository.delete(sys);
    }


    @Override
    public boolean isInUse(String systemId) {
        return subjectRepository.existsBySystem_Id(systemId);
    }
}
