package com.example.teacherservice.dto.evidence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateOCRTextDTO {
    private String ocrText;
    private String ocrFullName;
    private String ocrEvaluator;
}