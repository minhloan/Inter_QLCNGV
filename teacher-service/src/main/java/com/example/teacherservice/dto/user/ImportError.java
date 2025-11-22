package com.example.teacherservice.dto.user;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO chứa thông tin lỗi khi import Excel
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportError {
    /**
     * Số dòng trong file Excel bị lỗi (bắt đầu từ 1, không tính header)
     */
    private int rowNumber;
    
    /**
     * Thông báo lỗi
     */
    private String message;
}

