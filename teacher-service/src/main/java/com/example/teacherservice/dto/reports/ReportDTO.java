package com.example.teacherservice.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportDTO {
    private String id;
    private String teacherId;
    private String teacherName;
    private Integer year;
    private Integer quarter;
    private String reportType;
    private String fileId;
    private String filePath;
    private String paramsJson;
    private String status;
    private String generatedBy;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
