package com.example.teacherservice.request.trial;

import lombok.*;
import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TrialTeachingRequest {
    private String teacherId;
    private String subjectId;
    private LocalDate teachingDate;
    private String teachingTime;
    private String aptechExamId;
    private String location;
    private String note;
}
