package com.example.teacherservice.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeachingAssignmentCreateRequest {

    private String teacherId;      // id giáo viên
    private String subjectId;      // id môn học

    private String classCode;      // mã lớp, ví dụ: DISM-2025-01
    private Integer year;          // 2025

    private Integer quarter;

    private String location;       // phòng học, ví dụ: P101
    private String notes;          // ghi chú

    private List<ScheduleSlotRequest> slots;
}
