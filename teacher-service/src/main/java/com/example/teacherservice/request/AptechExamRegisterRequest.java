package com.example.teacherservice.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptechExamRegisterRequest {
    private String sessionId;
    private String subjectId;
}
