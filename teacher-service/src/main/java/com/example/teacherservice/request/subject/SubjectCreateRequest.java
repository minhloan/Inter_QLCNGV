package com.example.teacherservice.request.subject;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubjectCreateRequest {

    @NotBlank(message = "Subject code is required")
    private String subjectCode;

    @NotBlank(message = "Subject name is required")
    private String subjectName;

    @NotNull(message = "Credit is required")
    private Integer credit;

    private String description;

    @NotBlank(message = "SystemId is required")
    private String systemId;

    // default xử lý trong service
    private Boolean isActive;

    // id file ảnh
    private String imageFileId;
}
