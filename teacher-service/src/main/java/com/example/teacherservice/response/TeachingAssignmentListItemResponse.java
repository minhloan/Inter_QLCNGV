package com.example.teacherservice.response;

import com.example.teacherservice.enums.AssignmentStatus;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeachingAssignmentListItemResponse {

    private String id;

    private String teacherCode;
    private String teacherName;

    private String subjectId;
    private String subjectName;

    private String classCode;

    private String semester;

    // "Thứ 2, 4, 6 - 09:00-11:00"
    private String schedule;

    // ASSIGNED / COMPLETED / NOT_COMPLETED / FAILED
    private AssignmentStatus status;
}