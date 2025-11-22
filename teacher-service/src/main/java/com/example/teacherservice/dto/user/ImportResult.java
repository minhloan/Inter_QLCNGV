package com.example.teacherservice.dto.user;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.ArrayList;
import java.util.List;

/**
 * DTO chứa kết quả import Excel
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ImportResult {
    /**
     * Số lượng user được tạo mới
     */
    private int created = 0;
    
    /**
     * Số lượng user được cập nhật
     */
    private int updated = 0;
    
    /**
     * Danh sách lỗi trong quá trình import
     */
    @Builder.Default
    private List<ImportError> errors = new ArrayList<>();
    
    /**
     * Tăng số lượng created
     */
    public void incrementCreated() {
        created++;
    }
    
    /**
     * Tăng số lượng updated
     */
    public void incrementUpdated() {
        updated++;
    }
    
    /**
     * Thêm lỗi vào danh sách
     */
    public void addError(ImportError error) {
        if (errors == null) {
            errors = new ArrayList<>();
        }
        errors.add(error);
    }
}

