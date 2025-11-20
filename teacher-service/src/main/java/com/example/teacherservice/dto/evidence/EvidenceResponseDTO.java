package com.example.teacherservice.dto.evidence;

import com.example.teacherservice.enums.EvidenceStatus;
import com.example.teacherservice.enums.ExamResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceResponseDTO {
    private String id;
    private String teacherId;
    private String teacherName;
    private String teacherCode;
    private String subjectId;
    private String subjectName;
    private String fileId;
    private String ocrText;
    private String ocrFullName;
    private String ocrEvaluator;
    private ExamResult ocrResult;
    private EvidenceStatus status;
    private LocalDate submittedDate;
    private String verifiedById;
    private String verifiedByName;
    private LocalDateTime verifiedAt;
    private LocalDateTime creationTimestamp;
    private LocalDateTime updateTimestamp;
}