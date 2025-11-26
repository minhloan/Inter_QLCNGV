package com.example.teacherservice.dto.aptech;

import com.example.teacherservice.enums.ExamResult;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptechExamDto {
    private String id;
    private String sessionId;
    private LocalDate examDate;
    private LocalTime examTime;
    private String room;
    private String teacherId;
    private String teacherCode;
    private String teacherName;
    private String subjectId;
    private String subjectCode;
    private String subjectName;
    private Integer attempt;
    private Integer score;
    private ExamResult result;
    private String aptechStatus;
    private String examProofFileId;
    private String certificateFileId;
    private boolean canRetake;
    private String retakeCondition;
}
