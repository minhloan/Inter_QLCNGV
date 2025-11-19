package com.example.teacherservice.request.subjectsystem;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectSystemUpdateRequest {

    @NotBlank(message = "Id is required")
    private String id;

    private String systemCode;

    private String systemName;

    private Boolean isActive;
}
