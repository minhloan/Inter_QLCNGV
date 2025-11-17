package com.example.teacherservice.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeachingAssignmentCreateRequest {
    private String teacherId;        // id của User
    private String scheduleClassId;  // id của ScheduleClass
    private String notes;
}