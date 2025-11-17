package com.example.teacherservice.request;

import com.example.teacherservice.enums.AssignmentStatus;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeachingAssignmentStatusUpdateRequest {
    private AssignmentStatus status;
    private String failureReason;
}