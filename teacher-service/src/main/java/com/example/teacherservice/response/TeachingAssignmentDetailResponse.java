package com.example.teacherservice.response;

import com.example.teacherservice.enums.AssignmentStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeachingAssignmentDetailResponse {

    private String id;

    private String teacherId;
    private String teacherCode;
    private String teacherName;

    private String subjectId;
    private String subjectName;

    private String classId;
    private String classCode;

    private Integer year;
    private String quarterLabel;   // ví dụ: "2024-1"

    private String scheduleText;
    private AssignmentStatus status;

    private String failureReason;
    private String notes;

    private LocalDateTime assignedAt;
    private LocalDateTime completedAt;
}