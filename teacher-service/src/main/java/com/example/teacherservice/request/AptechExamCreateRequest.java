package com.example.teacherservice.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptechExamCreateRequest {
    private String sessionId;
    private String teacherId;
    private String subjectId;
    private Integer attempt;
    private Integer score;
    private String result; // PASS or FAIL
    private LocalDate examDate;
}
