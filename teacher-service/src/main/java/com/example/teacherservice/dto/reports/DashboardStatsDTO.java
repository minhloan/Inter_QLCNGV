package com.example.teacherservice.dto.reports;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardStatsDTO {
    // Teacher stats
    private long totalTeachers;
    private long activeTeachers;
    private long inactiveTeachers;

    // Subject stats
    private long totalSubjects;
    private long activeSubjects;
    private long inactiveSubjects;

    // Registration stats
    private long totalRegistrations;
    private long completedRegistrations;
    private long notCompletedRegistrations;

    // Exam stats
    private long totalExams;
    private long passedExams;
    private long failedExams;

    // Trial stats
    private long totalTrials;
    private long passedTrials;
    private long failedTrials;

    // Assignment stats
    private long totalAssignments;
    private long completedAssignments;
    private long notCompletedAssignments;

    // Evidence stats
    private long totalEvidence;
    private long verifiedEvidence;
    private long rejectedEvidence;
    private long pendingEvidence;

    // Completion rates
    private double examPassRate;
    private double trialPassRate;
    private double assignmentCompletionRate;
    private double evidenceVerificationRate;
}
