package com.example.teacherservice.dto.aptech;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptechOCRResponseDto {
    private String proofFileId;        // Saved file ID for exam proof
    private Integer extractedScore;    // From OCR
    private String extractedResult;    // PASS or FAIL
    private String extractedSubject;   // Subject name from OCR
    private String extractedName;      // Teacher name from OCR
    private String ocrRawText;         // Raw OCR text for debugging
    private boolean subjectMatch;      // Does OCR subject match exam subject?
    private boolean nameMatch;         // Does OCR name match teacher name?
}
