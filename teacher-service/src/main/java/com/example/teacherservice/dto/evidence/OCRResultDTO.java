package com.example.teacherservice.dto.evidence;

import com.example.teacherservice.enums.ExamResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OCRResultDTO {
    private String ocrText;
    private String ocrFullName;
    private String ocrEvaluator;
    private ExamResult ocrResult;
    
    // Aptech-specific fields
    private Integer ocrScore;        // Extracted score (e.g., 30)
    private Integer ocrPercentage;   // Extracted percentage (e.g., 100)
    private String ocrSubjectName;   // Extracted subject (e.g., "1367-PHP (v8.x) with Laravel")
}