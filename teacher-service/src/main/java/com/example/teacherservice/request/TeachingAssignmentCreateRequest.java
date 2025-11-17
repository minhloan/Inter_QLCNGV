package com.example.teacherservice.request;

import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class TeachingAssignmentCreateRequest {
    private String teacherId;
    private String subjectId;
    private String classCode;
    private Integer year;
    private Integer quarter; // 1..4
    private String location;
    private String notes;

    private List<ScheduleSlotRequest> slots;
}
