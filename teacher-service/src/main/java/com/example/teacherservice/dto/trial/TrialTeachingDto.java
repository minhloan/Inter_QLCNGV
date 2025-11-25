package com.example.teacherservice.dto.trial;

import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.enums.TrialStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrialTeachingDto {
    private String id;
    private String teacherId;
    private String teacherName;
    private String teacherCode;
    private String subjectId;
    private String subjectName;
    private String subjectCode;        // For Skill No column
    private String subjectDescription;  // For Skill Name column  
    private String systemName;          // For ITT/ACCP column
    private LocalDate teachingDate;
    private String teachingTime;
    private TrialStatus status;
    private TrialConclusion finalResult;
    private String location;
    private String note;
    private List<TrialAttendeeDto> attendees;
    private List<TrialEvaluationDto> evaluations; // Danh sách tất cả đánh giá từ hội đồng
    
    // Smart evaluation fields
    private Integer averageScore;
    private Boolean hasRedFlag;
    private Boolean needsReview;
    private Boolean adminOverride;
    private String resultNote;
}
