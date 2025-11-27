package com.example.teacherservice.dto.teachersubjectregistration;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ImportPlanResultDto {

    private int totalRows;     // Tổng số dòng đọc (không tính header)
    private int successCount;  // Số dòng import thành công
    private int errorCount;    // Số dòng lỗi
    @Builder.Default
    private List<String> errors = new ArrayList<>(); // Danh sách message lỗi
}