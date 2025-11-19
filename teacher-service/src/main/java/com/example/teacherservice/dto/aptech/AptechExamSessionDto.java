package com.example.teacherservice.dto.aptech;

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
public class AptechExamSessionDto {
    private String id;
    private LocalDate examDate;
    private LocalTime examTime;
    private String room;
    private String note;
}
