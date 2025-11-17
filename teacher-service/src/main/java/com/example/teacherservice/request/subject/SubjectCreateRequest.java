package com.example.teacherservice.request.subject;

import com.example.teacherservice.enums.SubjectSystem;
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

    @NotNull(message = "System is required")
    private SubjectSystem system;   // APTECH / ARENA

    // có thể để mặc định true trong service nếu null
    private Boolean isActive;

    // id file ảnh (đã upload qua /v1/teacher/file/upload)
    private String imageFileId;
}
