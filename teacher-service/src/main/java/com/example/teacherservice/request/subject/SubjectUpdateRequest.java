package com.example.teacherservice.request.subject;

import com.example.teacherservice.enums.Semester;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SubjectUpdateRequest {

    @NotBlank(message = "Id is required")
    private String id;

    private String subjectName;
    private String subjectCode;
    private String description;

    private String systemId;

    private Boolean isActive;

    private String imageFileId;
    private Integer hours;

    private Semester semester;

}
