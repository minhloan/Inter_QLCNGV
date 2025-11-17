package com.example.teacherservice.response;

import com.example.teacherservice.enums.AssignmentStatus;
import com.example.teacherservice.enums.Quarter;
import lombok.*;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeachingAssignmentListItemResponse {

    private String id;

    private String teacherId;
    private String teacherCode;
    private String teacherName;

    private String subjectId;
    private String subjectName;

    private String classId;
    private String classCode;

    private Integer year;
    private Quarter quarter;

    private String scheduleText;    // "Thứ 2, 4, 6 - 09:00-11:00"
    private AssignmentStatus status;
}