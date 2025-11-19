package com.example.teacherservice.request.subject;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectUpdateRequest {

    @NotBlank(message = "Id is required")
    private String id;

    private String subjectName;

    private Integer credit;

    private String description;

    private String systemId;

    private Boolean isActive;

    private String imageFileId;
}
