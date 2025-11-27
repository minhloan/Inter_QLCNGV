package com.example.teacherservice.dto.adminteachersubjectregistration;

import lombok.Data;

import java.util.ArrayList;
import java.util.List;

@Data
public class ImportResultDto {
    private int totalRows;      // tổng số dòng dữ liệu (không tính header, không tính dòng trống)
    private int successCount;   // số đăng ký tạo mới thành công
    private int skippedCount;   // số dòng bị bỏ qua do trùng
    private int errorCount;     // số dòng lỗi
    private List<ImportRowError> errors = new ArrayList<>();
}