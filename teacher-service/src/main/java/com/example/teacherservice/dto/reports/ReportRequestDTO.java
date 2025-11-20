package com.example.teacherservice.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportRequestDTO {
    private String reportType; // QUARTER, YEAR, APTECH, TRIAL
    private Integer year;
    private Integer quarter; // Optional, for QUARTER reports
    private String teacherId; // Required, for personal reports or "all" for manager reports
    private String paramsJson; // Additional parameters
}
