package com.example.teacherservice.request.subjectsystem;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectSystemCreateRequest {

    @NotBlank(message = "System code is required")
    private String systemCode;

    @NotBlank(message = "System name is required")
    private String systemName;
}
