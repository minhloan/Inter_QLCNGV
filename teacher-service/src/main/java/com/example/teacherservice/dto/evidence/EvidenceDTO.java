package com.example.teacherservice.dto.evidence;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EvidenceDTO {
    private String teacherId;
    private String subjectId;
    private String submittedDate;
}