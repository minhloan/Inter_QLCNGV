package com.example.teacherservice.request.subject;

import com.example.teacherservice.enums.Semester;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubjectAssignmentUpsertRequest {
    private String id;

    @NotBlank(message = "SubjectId là bắt buộc")
    private String subjectId;

    @NotBlank(message = "SystemId là bắt buộc")
    private String systemId;

    private Semester semester;
    private Integer hours;

    @NotNull(message = "Trạng thái isActive bắt buộc")
    private Boolean isActive;

    private String note;
}

