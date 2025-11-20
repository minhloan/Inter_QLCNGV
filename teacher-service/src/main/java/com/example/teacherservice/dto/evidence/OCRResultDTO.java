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
}