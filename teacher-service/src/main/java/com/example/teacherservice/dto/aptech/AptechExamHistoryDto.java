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
public class AptechExamHistoryDto {
    private String id;
    private LocalDate examDate;
    private LocalTime examTime;
    private String room;
    private String subjectName;
    private Integer attempt;
    private Integer score;
    private ExamResult result;
    private String examProofFileId;
    private String certificateFileId;
}
