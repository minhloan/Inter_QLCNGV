package com.example.teacherservice.service.subjectsystem;

import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.request.subjectsystem.SubjectSystemCreateRequest;
import com.example.teacherservice.request.subjectsystem.SubjectSystemUpdateRequest;

import java.util.List;

public interface SubjectSystemService {

    // Lấy toàn bộ (không phân trang)
    List<SubjectSystem> getAll();

    // Lấy toàn bộ active
    List<SubjectSystem> getActiveSystems();

    // Search theo keyword
    List<SubjectSystem> search(String keyword);

    // Search + filter
    List<SubjectSystem> searchWithFilters(String keyword, Boolean isActive);

    // Lấy theo id
    SubjectSystem getById(String id);

    // Thêm system mới
    SubjectSystem createSystem(SubjectSystemCreateRequest request);

    // Cập nhật
    SubjectSystem updateSystem(SubjectSystemUpdateRequest request);

    // Xóa (soft delete = inactive)
    void deleteSystem(String id);

    // Kiểm tra system đang được sử dụng trong Subject
    boolean isInUse(String systemId);
}
