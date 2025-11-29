package com.example.teacherservice.service.reports;

import com.example.teacherservice.dto.reports.DashboardStatsDTO;
import com.example.teacherservice.dto.reports.ReportDTO;
import com.example.teacherservice.dto.reports.ReportRequestDTO;
import com.example.teacherservice.enums.*;
import com.example.teacherservice.model.*;
import com.example.teacherservice.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import com.fasterxml.jackson.databind.ObjectMapper;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReportService {

    private final ObjectMapper objectMapper;

    // Utility method to convert Integer quarter to Quarter enum
    private Quarter intToQuarter(Integer quarter) {
        if (quarter == null) return null;
        return switch (quarter) {
            case 1 -> Quarter.QUY1;
            case 2 -> Quarter.QUY2;
            case 3 -> Quarter.QUY3;
            case 4 -> Quarter.QUY4;
            default -> throw new IllegalArgumentException("Invalid quarter: " + quarter);
        };
    }

    // Utility method to convert Quarter enum to Integer
    private Integer quarterToInt(Quarter quarter) {
        if (quarter == null) return null;
        return switch (quarter) {
            case QUY1 -> 1;
            case QUY2 -> 2;
            case QUY3 -> 3;
            case QUY4 -> 4;
        };
    }

    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final SubjectRegistrationRepository subjectRegistrationRepository;
    private final AptechExamRepository aptechExamRepository;
    private final TrialTeachingRepository trialTeachingRepository;
    private final TeachingAssignmentRepository teachingAssignmentRepository;
    private final EvidenceRepository evidenceRepository;
    private final FileRepository fileRepository;
    private final TeacherReportGeneratorService teacherReportGeneratorService;
    private final ManagerReportGeneratorService managerReportGeneratorService;

    // Helper method to get first evaluation from a trial
    private TrialEvaluation getFirstEvaluation(TrialTeaching trial) {
        if (trial.getEvaluations() == null || trial.getEvaluations().isEmpty()) {
            return null;
        }
        return trial.getEvaluations().get(0);
    }

    @Transactional(readOnly = true)
    public DashboardStatsDTO getDashboardStats() {
        // Teacher stats
        long totalTeachers = userRepository.countActiveTeachers();
        long activeTeachers = userRepository.countActiveTeachers();
        long inactiveTeachers = userRepository.countByActive(Active.ACTIVE) - activeTeachers;

        // Subject stats
        long totalSubjects = subjectRepository.count();
        long activeSubjects = subjectRepository.countByIsActive(true);
        long inactiveSubjects = totalSubjects - activeSubjects;

        // Registration stats
        long totalRegistrations = subjectRegistrationRepository.count();
        long completedRegistrations = subjectRegistrationRepository.countByStatus(RegistrationStatus.COMPLETED);
        long notCompletedRegistrations = totalRegistrations - completedRegistrations;

        // Exam stats
        long totalExams = aptechExamRepository.count();
        long passedExams = aptechExamRepository.countByResult(ExamResult.PASS);
        long failedExams = totalExams - passedExams;

        // Trial stats
        long totalTrials = trialTeachingRepository.count();
        long passedTrials = trialTeachingRepository.countByStatus(TrialStatus.REVIEWED); // Assuming reviewed means completed
        long failedTrials = totalTrials - passedTrials;

        // Assignment stats
        long totalAssignments = teachingAssignmentRepository.count();
        long completedAssignments = teachingAssignmentRepository.countByStatus(AssignmentStatus.COMPLETED);
        long notCompletedAssignments = totalAssignments - completedAssignments;

        // Evidence stats
        long totalEvidence = evidenceRepository.count();
        long verifiedEvidence = evidenceRepository.countByStatus(EvidenceStatus.VERIFIED);
        long rejectedEvidence = evidenceRepository.countByStatus(EvidenceStatus.REJECTED);
        long pendingEvidence = evidenceRepository.countByStatus(EvidenceStatus.PENDING);

        // Calculate rates
        double examPassRate = totalExams > 0 ? (double) passedExams / totalExams * 100 : 0;
        double trialPassRate = totalTrials > 0 ? (double) passedTrials / totalTrials * 100 : 0;
        double assignmentCompletionRate = totalAssignments > 0 ? (double) completedAssignments / totalAssignments * 100 : 0;
        double evidenceVerificationRate = totalEvidence > 0 ? (double) verifiedEvidence / totalEvidence * 100 : 0;

        return DashboardStatsDTO.builder()
                .totalTeachers(totalTeachers)
                .activeTeachers(activeTeachers)
                .inactiveTeachers(inactiveTeachers)
                .totalSubjects(totalSubjects)
                .activeSubjects(activeSubjects)
                .inactiveSubjects(inactiveSubjects)
                .totalRegistrations(totalRegistrations)
                .completedRegistrations(completedRegistrations)
                .notCompletedRegistrations(notCompletedRegistrations)
                .totalExams(totalExams)
                .passedExams(passedExams)
                .failedExams(failedExams)
                .totalTrials(totalTrials)
                .passedTrials(passedTrials)
                .failedTrials(failedTrials)
                .totalAssignments(totalAssignments)
                .completedAssignments(completedAssignments)
                .notCompletedAssignments(notCompletedAssignments)
                .totalEvidence(totalEvidence)
                .verifiedEvidence(verifiedEvidence)
                .rejectedEvidence(rejectedEvidence)
                .pendingEvidence(pendingEvidence)
                .examPassRate(Math.round(examPassRate * 100.0) / 100.0)
                .trialPassRate(Math.round(trialPassRate * 100.0) / 100.0)
                .assignmentCompletionRate(Math.round(assignmentCompletionRate * 100.0) / 100.0)
                .evidenceVerificationRate(Math.round(evidenceVerificationRate * 100.0) / 100.0)
                .build();
    }

    @Transactional(readOnly = true)
    public List<ReportDTO> getReports(String teacherId, String reportType, Integer year, Integer quarter) {
        List<Report> reports;

        if (teacherId != null) {
            // Personal reports for specific teacher
            reports = reportRepository.findByTeacherIdOrderByCreationTimestampDesc(teacherId);
        } else {
            // Admin reports - filter by type, year, quarter
            if (reportType != null && year != null) {
                if ("QUARTER".equals(reportType) && quarter != null) {
                    reports = reportRepository.findByReportTypeAndYearAndQuarter(reportType, year, quarter);
                } else {
                    reports = reportRepository.findByReportTypeAndYearOrderByCreationTimestampDesc(reportType, year);
                }
            } else {
                reports = reportRepository.findAll();
            }
        }

        return reports.stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public ReportDTO generateReport(ReportRequestDTO request, String generatedByUserId) {
        User generatedBy = null;
        User teacher = null;
        try {
            generatedBy = userRepository.findById(generatedByUserId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            if (request.getTeacherId() != null && !"all".equals(request.getTeacherId())) {
                teacher = userRepository.findById(request.getTeacherId())
                        .orElseThrow(() -> new RuntimeException("Teacher not found"));
            }

            // Generate report data based on type
            Map<String, Object> reportData = generateReportData(request);

            // Create file based on report type and data
            File reportFile = createReportFile(request, reportData, teacher);

            // Serialize additional params
            String paramsJson = request.getParamsJson();
            if (paramsJson == null || paramsJson.isEmpty()) {
                try {
                    Map<String, Object> params = new java.util.HashMap<>();
                    if (request.getStartDate() != null) params.put("startDate", request.getStartDate().toString());
                    if (request.getEndDate() != null) params.put("endDate", request.getEndDate().toString());
                    if (request.getSubjectId() != null) params.put("subjectId", request.getSubjectId());
                    if (!params.isEmpty()) {
                        paramsJson = objectMapper.writeValueAsString(params);
                    }
                } catch (Exception e) {
                    log.error("Error serializing params", e);
                }
            }

            // Save report record
            Report report = Report.builder()
                    .teacher(teacher)
                    .year(request.getYear())
                    .quarter(request.getQuarter())
                    .reportType(request.getReportType())
                    .file(reportFile)
                    .paramsJson(paramsJson)
                    .status("GENERATED")
                    .generatedBy(generatedBy)
                    .build();

            report = reportRepository.save(report);
            
            return convertToDTO(report);
        } catch (Exception e) {
            log.error("Error generating report", e);
            throw new RuntimeException("Error generating report: " + e.getMessage());
        }
    }

    private Map<String, Object> generateReportData(ReportRequestDTO request) {
        String reportType = request.getReportType();
        Integer year = request.getYear();
        Integer quarter = request.getQuarter();
        String teacherId = request.getTeacherId();

        Map<String, Object> reportData = new java.util.HashMap<>();
        reportData.put("reportType", reportType);
        reportData.put("year", year);
        reportData.put("quarter", quarter);
        reportData.put("generatedAt", LocalDateTime.now());

        if ("all".equals(teacherId)) {
            // Manager report - summary data for all teachers
            switch (reportType) {
                case "QUARTER":
                    reportData.putAll(generateManagerQuarterReportData(year, quarter));
                    break;
                case "YEAR":
                    reportData.putAll(generateManagerYearReportData(year));
                    break;
                case "APTECH":
                    reportData.putAll(generateManagerAptechReportData(year, quarter));
                    break;
                case "TRIAL":
                    reportData.putAll(generateManagerTrialReportData(year, quarter));
                    break;
                case "TEACHER_PERFORMANCE":
                    // For manager, teacherId is usually "all", but for this report we need a specific teacher.
                    // If teacherId is "all", we might need to handle it or throw error.
                    // But wait, the request might have a specific teacherId even if user is manager.
                    // If teacherId is "all", we can't generate a single teacher performance report.
                    // Assuming manager selects a teacher for this report, so teacherId won't be "all".
                    // But the logic above says if ("all".equals(teacherId))...
                    // So if manager requests this, they MUST provide a teacherId, so it goes to the 'else' block?
                    // Actually, for TEACHER_PERFORMANCE, manager selects a teacher. So teacherId will NOT be "all".
                    // So it will fall into the 'else' block below.
                    // But what about SUBJECT_ANALYSIS? That doesn't need a teacher.
                    // So we need to handle non-teacher-specific reports here.
                    break;
                case "SUBJECT_ANALYSIS":
                    reportData.putAll(aggregateSubjectAnalysisData(request.getSubjectId(), request.getStartDate(), request.getEndDate()));
                    break;
                case "APTECH_DETAIL":
                    reportData.putAll(aggregateAptechDetailsData(request.getStartDate(), request.getEndDate()));
                    break;
                case "TRIAL_DETAIL":
                    reportData.putAll(aggregateTrialDetailsData(request.getStartDate(), request.getEndDate()));
                    break;
            }
        } else {
            // Teacher report - data for specific teacher
            switch (reportType) {
                case "QUARTER":
                    reportData.putAll(generateQuarterReportData(teacherId, year, quarter));
                    break;
                case "YEAR":
                    reportData.putAll(generateYearReportData(teacherId, year));
                    break;
                case "APTECH":
                    reportData.putAll(generateAptechReportData(teacherId, year, quarter));
                    break;
                case "TRIAL":
                    reportData.putAll(generateTrialReportData(teacherId, year, quarter));
                    break;
                case "TEACHER_PERFORMANCE":
                    reportData.putAll(aggregateTeacherPerformanceData(teacherId, request.getStartDate(), request.getEndDate()));
                    break;
                case "PERSONAL_SUMMARY":
                    reportData.putAll(aggregatePersonalSummaryData(teacherId));
                    break;
            }
        }

        return reportData;
    }

    private Map<String, Object> generateQuarterReportData(String teacherId, Integer year, Integer quarter) {
        Map<String, Object> data = new java.util.HashMap<>();

        // Get subject registrations for the quarter
        List<SubjectRegistration> registrations = subjectRegistrationRepository
                .findByTeacherIdAndYearAndQuarter(teacherId, year, intToQuarter(quarter));

        List<Map<String, Object>> subjectsData = registrations.stream()
                .map(reg -> {
                    Map<String, Object> subjectData = new java.util.HashMap<>();
                    subjectData.put("subjectName", reg.getSubject().getSubjectName());
                    subjectData.put("subjectCode", reg.getSubject().getSkillCode());
                    subjectData.put("className", "APTECH" + (reg.getSubject().getSkillCode().hashCode() % 10 + 1)); // Mock class name
//                    subjectData.put("totalHours", reg.getSubject().getCredit() * 15); // Mock hours
                    subjectData.put("status", reg.getStatus().toString());
                    subjectData.put("notes", "");
                    return subjectData;
                })
                .collect(Collectors.toList());

        data.put("subjects", subjectsData);
        data.put("totalSubjects", registrations.size());
        data.put("completedSubjects", registrations.stream()
                .filter(reg -> reg.getStatus() == RegistrationStatus.COMPLETED)
                .count());

        return data;
    }

    private Map<String, Object> generateYearReportData(String teacherId, Integer year) {
        Map<String, Object> data = new java.util.HashMap<>();

        // Get all registrations for the year
        List<SubjectRegistration> registrations = subjectRegistrationRepository
                .findByTeacherIdAndYear(teacherId, year);

        long totalRegistrations = registrations.size();
        long completedRegistrations = registrations.stream()
                .filter(reg -> reg.getStatus() == RegistrationStatus.COMPLETED)
                .count();

        // Get exam results for the year
        List<AptechExam> exams = aptechExamRepository.findByTeacherIdAndYear(teacherId, year);
        long totalExams = exams.size();
        long passedExams = exams.stream()
                .filter(exam -> exam.getResult() == ExamResult.PASS)
                .count();

        // Get trial results for the year
        List<TrialTeaching> trials = trialTeachingRepository.findByTeacherIdAndYear(teacherId, year);
        long totalTrials = trials.size();
        long passedTrials = trials.stream()
                .filter(trial -> {
                    TrialEvaluation eval = getFirstEvaluation(trial);
                    return eval != null && eval.getConclusion() == TrialConclusion.PASS;
                })
                .count();

        // Quarterly breakdown
        List<Map<String, Object>> quarterlyStats = new java.util.ArrayList<>();
        for (int q = 1; q <= 4; q++) {
            Quarter quarterEnum = intToQuarter(q);
            List<SubjectRegistration> quarterRegs = registrations.stream()
                    .filter(reg -> reg.getQuarter().equals(quarterEnum))
                    .collect(Collectors.toList());

            Map<String, Object> quarterData = new java.util.HashMap<>();
            quarterData.put("quarter", q);
            quarterData.put("totalSubjects", quarterRegs.size());
            quarterData.put("completedSubjects", quarterRegs.stream()
                    .filter(reg -> reg.getStatus() == RegistrationStatus.COMPLETED)
                    .count());
            quarterlyStats.add(quarterData);
        }

        data.put("totalRegistrations", totalRegistrations);
        data.put("completedRegistrations", completedRegistrations);
        data.put("completionRate", totalRegistrations > 0 ?
                Math.round((double) completedRegistrations / totalRegistrations * 10000.0) / 100.0 : 0.0);

        data.put("totalExams", totalExams);
        data.put("passedExams", passedExams);
        data.put("examPassRate", totalExams > 0 ?
                Math.round((double) passedExams / totalExams * 10000.0) / 100.0 : 0.0);

        data.put("totalTrials", totalTrials);
        data.put("passedTrials", passedTrials);
        data.put("trialPassRate", totalTrials > 0 ?
                Math.round((double) passedTrials / totalTrials * 10000.0) / 100.0 : 0.0);

        data.put("quarterlyStats", quarterlyStats);

        return data;
    }

    private Map<String, Object> generateAptechReportData(String teacherId, Integer year, Integer quarter) {
        Map<String, Object> data = new java.util.HashMap<>();

        // Get exam results
        List<AptechExam> exams;
        if (quarter != null) {
            exams = aptechExamRepository.findByTeacherIdAndYearAndQuarter(teacherId, year, quarter);
        } else {
            exams = aptechExamRepository.findByTeacherIdAndYear(teacherId, year);
        }

        List<Map<String, Object>> examData = exams.stream()
                .map(exam -> {
                    Map<String, Object> examInfo = new java.util.HashMap<>();
                    examInfo.put("subjectName", exam.getSubject().getSubjectName());
                    examInfo.put("subjectCode", exam.getSubject().getSkillCode());
                    examInfo.put("examDate", exam.getExamDate());
                    examInfo.put("score", exam.getScore());
                    examInfo.put("result", exam.getResult().toString());
                    examInfo.put("attempt", exam.getAttempt());
                    return examInfo;
                })
                .collect(Collectors.toList());

        long totalExams = exams.size();
        long passedExams = exams.stream()
                .filter(exam -> exam.getResult() == ExamResult.PASS)
                .count();

        data.put("exams", examData);
        data.put("totalExams", totalExams);
        data.put("passedExams", passedExams);
        data.put("failedExams", totalExams - passedExams);
        data.put("passRate", totalExams > 0 ?
                Math.round((double) passedExams / totalExams * 10000.0) / 100.0 : 0.0);

        return data;
    }

    private Map<String, Object> generateTrialReportData(String teacherId, Integer year, Integer quarter) {
        Map<String, Object> data = new java.util.HashMap<>();

        // Get all trial teaching results for the teacher first
        List<TrialTeaching> allTrials = trialTeachingRepository.findByTeacherId(teacherId);
        log.debug("Found {} total trials for teacher {}", allTrials.size(), teacherId);

        // Filter by year and quarter in Java to handle null dates
        List<TrialTeaching> trials = allTrials.stream()
                .filter(trial -> {
                    if (trial.getTeachingDate() == null) {
                        log.warn("Trial {} has null teachingDate", trial.getId());
                        return false; // Skip trials with null dates
                    }
                    int trialYear = trial.getTeachingDate().getYear();
                    boolean yearMatches = year == null || trialYear == year;
                    if (!yearMatches) {
                        log.debug("Trial {} year {} does not match requested year {}", trial.getId(), trialYear, year);
                        return false;
                    }
                    if (quarter != null) {
                        int trialQuarter = (trial.getTeachingDate().getMonthValue() - 1) / 3 + 1;
                        boolean quarterMatches = trialQuarter == quarter;
                        if (!quarterMatches) {
                            log.debug("Trial {} quarter {} does not match requested quarter {}", trial.getId(), trialQuarter, quarter);
                            return false;
                        }
                    }
                    return true;
                })
                .collect(Collectors.toList());

        log.debug("Filtered to {} trials for year {} and quarter {}", trials.size(), year, quarter);

        List<Map<String, Object>> trialData = trials.stream()
                .map(trial -> {
                    Map<String, Object> trialInfo = new java.util.HashMap<>();
                    trialInfo.put("subjectName", trial.getSubject().getSubjectName());
                    trialInfo.put("subjectCode", trial.getSubject().getSkillCode());
                    trialInfo.put("teachingDate", trial.getTeachingDate());
                    trialInfo.put("location", trial.getLocation());
                    trialInfo.put("status", trial.getStatus().toString());

                    TrialEvaluation eval = getFirstEvaluation(trial);
                    if (eval != null) {
                        trialInfo.put("score", eval.getScore());
                        trialInfo.put("conclusion", eval.getConclusion().toString());
                        trialInfo.put("comments", eval.getComments());
                    } else {
                        trialInfo.put("score", null);
                        trialInfo.put("conclusion", "PENDING");
                        trialInfo.put("comments", "");
                    }

                    return trialInfo;
                })
                .collect(Collectors.toList());

        long totalTrials = trials.size();
        long passedTrials = trials.stream()
                .filter(trial -> {
                    TrialEvaluation eval = getFirstEvaluation(trial);
                    return eval != null && eval.getConclusion() == TrialConclusion.PASS;
                })
                .count();

        data.put("trials", trialData);
        data.put("totalTrials", totalTrials);
        data.put("passedTrials", passedTrials);
        data.put("failedTrials", totalTrials - passedTrials);
        data.put("passRate", totalTrials > 0 ?
                Math.round((double) passedTrials / totalTrials * 10000.0) / 100.0 : 0.0);

        return data;
    }

    private File createReportFile(ReportRequestDTO request, Map<String, Object> reportData, User teacher) throws IOException {
        // Generate file content based on report type
        byte[] fileContent = generateFileContent(request, reportData, teacher);

        // Create file record
        String fileName = generateFileName(request);
        String mimeType = getMimeType(fileName);
        File file = File.builder()
                .fileName(fileName)
                .filePath("/reports/" + fileName)
                .type(mimeType)
                .sizeBytes((long) fileContent.length)
                .uploadedBy(teacher)
                .build();

        // Save file to storage (this would need actual file storage implementation)
        // For now, just save the record
        return fileRepository.save(file);
    }

    private String getMimeType(String fileName) {
        if (fileName.endsWith(".xlsx")) {
            return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
        } else if (fileName.endsWith(".docx")) {
            return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
        } else {
            return "application/pdf";
        }
    }

    private byte[] generateFileContent(ReportRequestDTO request, Map<String, Object> reportData, User teacher) throws IOException {
        // Generate actual file content based on format (PDF, Excel, Word)
        String format = request.getParamsJson() != null && request.getParamsJson().contains("format") ?
            extractFormatFromParams(request.getParamsJson()) : "PDF";

        // Choose report generator service based on primaryRole
        boolean isManagerReport = "all".equals(request.getTeacherId()) ||
            (teacher != null && teacher.getPrimaryRole() == Role.MANAGE);

        if (isManagerReport) {
            // Manager reports use ManagerReportGeneratorService (no teacher parameter)
            switch (format.toUpperCase()) {
                case "EXCEL":
                case "XLSX":
                    return managerReportGeneratorService.generateExcelReport(reportData);
                case "WORD":
                case "DOCX":
                    return managerReportGeneratorService.generateWordReport(reportData);
                case "PDF":
                default:
                    return managerReportGeneratorService.generatePdfReport(reportData);
            }
        } else {
            // Teacher reports use TeacherReportGeneratorService (with teacher parameter)
            switch (format.toUpperCase()) {
                case "EXCEL":
                case "XLSX":
                    return teacherReportGeneratorService.generateExcelReport(reportData, teacher);
                case "WORD":
                case "DOCX":
                    return teacherReportGeneratorService.generateWordReport(reportData, teacher);
                case "PDF":
                default:
                    return teacherReportGeneratorService.generatePdfReport(reportData, teacher);
            }
        }
    }

    private String extractFormatFromParams(String paramsJson) {
        // Simple extraction - in real implementation, parse JSON properly
        if (paramsJson.contains("\"format\":\"excel\"") || paramsJson.contains("\"format\":\"xlsx\"")) {
            return "EXCEL";
        } else if (paramsJson.contains("\"format\":\"word\"") || paramsJson.contains("\"format\":\"docx\"")) {
            return "WORD";
        } else {
            return "PDF";
        }
    }

    private String generateFileName(ReportRequestDTO request) {
        String timestamp = String.valueOf(System.currentTimeMillis());
        String type = request.getReportType().toLowerCase();
        String year = request.getYear() != null ? "_" + request.getYear() : "";
        String quarter = request.getQuarter() != null ? "_q" + request.getQuarter() : "";

        String format = request.getParamsJson() != null && request.getParamsJson().contains("format") ?
            extractFormatFromParams(request.getParamsJson()) : "PDF";

        String extension = switch (format.toUpperCase()) {
            case "EXCEL", "XLSX" -> ".xlsx";
            case "WORD", "DOCX" -> ".docx";
            default -> ".pdf";
        };

        return type + "_report" + year + quarter + "_" + timestamp + extension;
    }

    private ReportDTO convertToDTO(Report report) {
        return ReportDTO.builder()
                .id(report.getId())
                .teacherId(report.getTeacher() != null ? report.getTeacher().getId() : null)
                .teacherName(report.getTeacher() != null && report.getTeacher().getUserDetails() != null ?
                        report.getTeacher().getUserDetails().getFirstName() + " " +
                        report.getTeacher().getUserDetails().getLastName() : null)
                .year(report.getYear())
                .quarter(report.getQuarter())
                .reportType(report.getReportType())
                .fileId(report.getFile() != null ? report.getFile().getId() : null)
                .filePath(report.getFile() != null ? report.getFile().getFilePath() : null)
                .paramsJson(report.getParamsJson())
                .status(report.getStatus())
                .generatedBy(report.getGeneratedBy() != null && report.getGeneratedBy().getUserDetails() != null ?
                        report.getGeneratedBy().getUserDetails().getFirstName() + " " +
                        report.getGeneratedBy().getUserDetails().getLastName() : null)
                .createdAt(report.getCreationTimestamp())
                .updatedAt(report.getUpdateTimestamp())
                .build();
    }

    // Personal stats methods
    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPersonalSubjects(String teacherId) {
        List<SubjectRegistration> registrations = subjectRegistrationRepository
                .findByTeacherId(teacherId);

        return registrations.stream()
                .map(reg -> {
                    Map<String, Object> subjectData = new java.util.HashMap<>();
                    subjectData.put("subjectId", reg.getSubject().getId());
                    subjectData.put("subjectName", reg.getSubject().getSubjectName());
                    subjectData.put("subjectCode", reg.getSubject().getSkillCode());
                    subjectData.put("year", reg.getYear());
                    subjectData.put("quarter", reg.getQuarter());
                    subjectData.put("status", reg.getStatus().toString());
//                    subjectData.put("credit", reg.getSubject().getCredit());
                    return subjectData;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPersonalExams(String teacherId) {
        List<AptechExam> exams = aptechExamRepository.findByTeacherId(teacherId);

        return exams.stream()
                .map(exam -> {
                    Map<String, Object> examData = new java.util.HashMap<>();
                    examData.put("examId", exam.getId());
                    examData.put("subjectName", exam.getSubject().getSubjectName());
                    examData.put("subjectCode", exam.getSubject().getSkillCode());
                    examData.put("examDate", exam.getExamDate());
                    examData.put("score", exam.getScore());
                    examData.put("result", exam.getResult().toString());
                    examData.put("attempt", exam.getAttempt());
                    return examData;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPersonalTrials(String teacherId) {
        List<TrialTeaching> trials = trialTeachingRepository.findByTeacherId(teacherId);

        return trials.stream()
                .map(trial -> {
                    Map<String, Object> trialData = new java.util.HashMap<>();
                    trialData.put("trialId", trial.getId());
                    trialData.put("subjectName", trial.getSubject().getSubjectName());
                    trialData.put("subjectCode", trial.getSubject().getSkillCode());
                    trialData.put("teachingDate", trial.getTeachingDate());
                    trialData.put("location", trial.getLocation());
                    trialData.put("status", trial.getStatus().toString());

                    TrialEvaluation eval = getFirstEvaluation(trial);
                    if (eval != null) {
                        trialData.put("score", eval.getScore());
                        trialData.put("conclusion", eval.getConclusion().toString());
                        trialData.put("comments", eval.getComments());
                    } else {
                        trialData.put("score", null);
                        trialData.put("conclusion", "PENDING");
                        trialData.put("comments", "");
                    }

                    return trialData;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getPersonalPassRates(String teacherId) {
        // Get exam pass rate
        List<AptechExam> exams = aptechExamRepository.findByTeacherId(teacherId);
        long totalExams = exams.size();
        long passedExams = exams.stream()
                .filter(exam -> exam.getResult() == ExamResult.PASS)
                .count();

        // Get trial pass rate
        List<TrialTeaching> trials = trialTeachingRepository.findByTeacherId(teacherId);
        long totalTrials = trials.size();
        long passedTrials = trials.stream()
                .filter(trial -> {
                    TrialEvaluation eval = getFirstEvaluation(trial);
                    return eval != null && eval.getConclusion() == TrialConclusion.PASS;
                })
                .count();

        // Get subject completion rate
        List<SubjectRegistration> registrations = subjectRegistrationRepository
                .findByTeacherId(teacherId);
        long totalRegistrations = registrations.size();
        long completedRegistrations = registrations.stream()
                .filter(reg -> reg.getStatus() == RegistrationStatus.COMPLETED)
                .count();

        Map<String, Object> passRates = new java.util.HashMap<>();
        passRates.put("examPassRate", totalExams > 0 ? Math.round((double) passedExams / totalExams * 10000.0) / 100.0 : 0.0);
        passRates.put("trialPassRate", totalTrials > 0 ? Math.round((double) passedTrials / totalTrials * 10000.0) / 100.0 : 0.0);
        passRates.put("completionRate", totalRegistrations > 0 ? Math.round((double) completedRegistrations / totalRegistrations * 10000.0) / 100.0 : 0.0);
        passRates.put("overallPassRate", (totalExams + totalTrials + totalRegistrations) > 0 ?
                Math.round((double) (passedExams + passedTrials + completedRegistrations) / (totalExams + totalTrials + totalRegistrations) * 10000.0) / 100.0 : 0.0);

        return passRates;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPersonalEvidence(String teacherId) {
        List<Evidence> evidence = evidenceRepository.findByTeacherId(teacherId);

        return evidence.stream()
                .map(ev -> {
                    Map<String, Object> evidenceData = new java.util.HashMap<>();
                    evidenceData.put("evidenceId", ev.getId());
                    evidenceData.put("subjectName", ev.getSubject().getSubjectName());
                    evidenceData.put("subjectCode", ev.getSubject().getSkillCode());
                    evidenceData.put("submittedDate", ev.getSubmittedDate());
                    evidenceData.put("status", ev.getStatus().toString());
                    evidenceData.put("ocrFullName", ev.getOcrFullName());
                    evidenceData.put("ocrEvaluator", ev.getOcrEvaluator());
                    evidenceData.put("ocrResult", ev.getOcrResult() != null ? ev.getOcrResult().toString() : null);
                    evidenceData.put("verifiedAt", ev.getVerifiedAt());
                    return evidenceData;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getPersonalAssignments(String teacherId) {
        List<TeachingAssignment> assignments = teachingAssignmentRepository.findByTeacherId(teacherId);

        return assignments.stream()
                .map(assignment -> {
                    Map<String, Object> assignmentData = new java.util.HashMap<>();
                    assignmentData.put("assignmentId", assignment.getId());
                    assignmentData.put("subjectName", assignment.getScheduleClass().getSubject().getSubjectName());
                    assignmentData.put("subjectCode", assignment.getScheduleClass().getSubject().getSkillCode());
                    assignmentData.put("year", assignment.getScheduleClass().getYear());
                    assignmentData.put("quarter", quarterToInt(assignment.getScheduleClass().getQuarter()));
                    assignmentData.put("status", assignment.getStatus().toString());
                    assignmentData.put("assignedAt", assignment.getAssignedAt());
                    assignmentData.put("completedAt", assignment.getCompletedAt());
                    assignmentData.put("notes", assignment.getNotes());
                    return assignmentData;
                })
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> regenerateReportData(Report report) {
        String reportType = report.getReportType();
        Integer year = report.getYear();
        Integer quarter = report.getQuarter();

        Map<String, Object> reportData = new java.util.HashMap<>();
        reportData.put("reportType", reportType);
        reportData.put("year", year);
        reportData.put("quarter", quarter);
        reportData.put("generatedAt", report.getCreationTimestamp());

        // Deserialize params
        java.time.LocalDate startDate = null;
        java.time.LocalDate endDate = null;
        String subjectId = null;

        if (report.getParamsJson() != null && !report.getParamsJson().isEmpty()) {
            try {
                Map<String, Object> params = objectMapper.readValue(report.getParamsJson(), new com.fasterxml.jackson.core.type.TypeReference<Map<String, Object>>(){});
                if (params.containsKey("startDate")) startDate = java.time.LocalDate.parse((String) params.get("startDate"));
                if (params.containsKey("endDate")) endDate = java.time.LocalDate.parse((String) params.get("endDate"));
                if (params.containsKey("subjectId")) subjectId = (String) params.get("subjectId");
            } catch (Exception e) {
                log.error("Error deserializing params for report " + report.getId(), e);
            }
        }

        if (report.getTeacher() == null) {
            // Manager report
            switch (reportType) {
                case "QUARTER":
                    reportData.putAll(generateManagerQuarterReportData(year, quarter));
                    break;
                case "YEAR":
                    reportData.putAll(generateManagerYearReportData(year));
                    break;
                case "APTECH":
                    reportData.putAll(generateManagerAptechReportData(year, quarter));
                    break;
                case "TRIAL":
                    reportData.putAll(generateManagerTrialReportData(year, quarter));
                    break;
                case "SUBJECT_ANALYSIS":
                    reportData.putAll(aggregateSubjectAnalysisData(subjectId, startDate, endDate));
                    break;
                case "APTECH_DETAIL":
                    reportData.putAll(aggregateAptechDetailsData(startDate, endDate));
                    break;
                case "TRIAL_DETAIL":
                    reportData.putAll(aggregateTrialDetailsData(startDate, endDate));
                    break;
            }
        } else {
            // Teacher report
            String teacherId = report.getTeacher().getId();
            switch (reportType) {
                case "QUARTER":
                    reportData.putAll(generateQuarterReportData(teacherId, year, quarter));
                    break;
                case "YEAR":
                    reportData.putAll(generateYearReportData(teacherId, year));
                    break;
                case "APTECH":
                    reportData.putAll(generateAptechReportData(teacherId, year, quarter));
                    break;
                case "TRIAL":
                    reportData.putAll(generateTrialReportData(teacherId, year, quarter));
                    break;
                case "TEACHER_PERFORMANCE":
                    reportData.putAll(aggregateTeacherPerformanceData(teacherId, startDate, endDate));
                    break;
                case "PERSONAL_SUMMARY":
                    reportData.putAll(aggregatePersonalSummaryData(teacherId));
                    break;
            }
        }

        return reportData;
    }

    private Map<String, Object> generateManagerQuarterReportData(Integer year, Integer quarter) {
        Map<String, Object> data = new java.util.HashMap<>();

        // Get trial statistics for the quarter - aggregate from all teachers
        List<TrialTeaching> trials = trialTeachingRepository.findAll().stream()
                .filter(t -> t.getTeachingDate() != null &&
                        t.getTeachingDate().getYear() == year &&
                         (quarter == null || ((t.getTeachingDate().getMonthValue() - 1) / 3 + 1) == quarter))
                .toList();
        long totalTrials = trials.size();
        long passedTrials = trials.stream()
                .filter(t -> {
                    TrialEvaluation eval = getFirstEvaluation(t);
                    return eval != null && eval.getConclusion() == TrialConclusion.PASS;
                })
                .count();
        double passRate = totalTrials > 0 ? (double) passedTrials / totalTrials * 100 : 0;

        // Get teacher count
        long totalTeachers = userRepository.countActiveTeachers();

        data.put("totalTrials", totalTrials);
        data.put("passedTrials", passedTrials);
        data.put("passRate", Math.round(passRate * 100.0) / 100.0); // Round to 2 decimal places
        data.put("totalTeachers", totalTeachers);

        return data;
    }

    private Map<String, Object> generateManagerYearReportData(Integer year) {
        Map<String, Object> data = new java.util.HashMap<>();

        // Aggregate data for all quarters in the year
        long totalTrials = 0;
        long passedTrials = 0;

        for (int q = 1; q <= 4; q++) {
            final int quarter = q; // Make effectively final for lambda
            List<TrialTeaching> trials = trialTeachingRepository.findAll().stream()
                    .filter(t -> t.getTeachingDate() != null &&
                            t.getTeachingDate().getYear() == year &&
                            ((t.getTeachingDate().getMonthValue() - 1) / 3 + 1) == quarter)
                    .toList();
            totalTrials += trials.size();
            passedTrials += trials.stream()
                    .filter(t -> {
                        TrialEvaluation eval = getFirstEvaluation(t);
                        return eval != null && eval.getConclusion() == TrialConclusion.PASS;
                    })
                    .count();
        }

        double passRate = totalTrials > 0 ? (double) passedTrials / totalTrials * 100 : 0;
        long totalTeachers = userRepository.countActiveTeachers();

        data.put("totalTrials", totalTrials);
        data.put("passedTrials", passedTrials);
        data.put("passRate", Math.round(passRate * 100.0) / 100.0);
        data.put("totalTeachers", totalTeachers);

        return data;
    }

    private Map<String, Object> generateManagerAptechReportData(Integer year, Integer quarter) {
        Map<String, Object> data = new java.util.HashMap<>();

        // Get exam statistics for the period - aggregate from all teachers
        List<AptechExam> exams = aptechExamRepository.findAll().stream()
                .filter(e -> e.getExamDate() != null &&
                        e.getExamDate().getYear() == year &&
                        ((e.getExamDate().getMonthValue() - 1) / 3 + 1) == quarter)
                .toList();
        long totalExams = exams.size();
        long passedExams = exams.stream()
                .filter(e -> ExamResult.PASS.equals(e.getResult()))
                .count();
        double passRate = totalExams > 0 ? (double) passedExams / totalExams * 100 : 0;

        data.put("totalExams", totalExams);
        data.put("passedExams", passedExams);
        data.put("passRate", Math.round(passRate * 100.0) / 100.0);
        data.put("totalTeachers", userRepository.countActiveTeachers());

        return data;
    }

    private Map<String, Object> generateManagerTrialReportData(Integer year, Integer quarter) {
        // Same as quarter report for trials
        return generateManagerQuarterReportData(year, quarter);
    }

    /**
     * NEW DATA AGGREGATION METHODS FOR TEMPLATE REPORTS
     */
    
    @Transactional(readOnly = true)
    public Map<String, Object> aggregateTeacherPerformanceData(String teacherId, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        Map<String, Object> data = new java.util.HashMap<>();
        
        // Get teacher info
        User teacher = userRepository.findById(teacherId).orElseThrow();
        data.put("teacherName", teacher.getUserDetails() != null ? 
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : "N/A");
        data.put("qualification", teacher.getAcademicRank() != null ? teacher.getAcademicRank() : "N/A");
        data.put("email", teacher.getEmail());
        
        // Get all registrations
        List<SubjectRegistration> registrations = subjectRegistrationRepository.findByTeacherId(teacherId);
        data.put("totalSubjectsRegistered", registrations.size());
        
        // Map subjects to DTOs
        List<Map<String, Object>> subjects = registrations.stream()
            .map(reg -> {
                Map<String, Object> subject = new java.util.HashMap<>();
                subject.put("code", reg.getSubject().getSkillCode());
                subject.put("name", reg.getSubject().getSubjectName());
                subject.put("system", reg.getSubject().getSystem() != null ? reg.getSubject().getSystem().getSystemName() : "N/A");
                subject.put("registeredDate", reg.getCreationTimestamp());
                return subject;
            })
            .collect(Collectors.toList());
        data.put("registeredSubjects", subjects);
        
        // Get assignments
        List<TeachingAssignment> assignments = teachingAssignmentRepository.findByTeacherId(teacherId);
        data.put("totalAssignments", assignments.size());
        
        // Get trials
        List<TrialTeaching> trials = trialTeachingRepository.findByTeacherId(teacherId);
        data.put("totalTrials", trials.size());
        
        // Get exams
        List<AptechExam> exams = aptechExamRepository.findByTeacherId(teacherId);
        data.put("totalExams", exams.size());
        
        // Map exams to DTOs
        List<Map<String, Object>> examList = exams.stream()
            .map(exam -> {
                Map<String, Object> examData = new java.util.HashMap<>();
                examData.put("sessionName", exam.getSession() != null ? exam.getSession().getExamDate().toString() : "N/A");
                examData.put("examDate", exam.getExamDate());
                examData.put("subjectName", exam.getSubject().getSubjectName());
                examData.put("score", exam.getScore());
                examData.put("passed", exam.getResult() == ExamResult.PASS);
                return examData;
            })
            .collect(Collectors.toList());
        data.put("exams", examList);
        
        // Calculate pass rate
        long passedExams = exams.stream().filter(e -> e.getResult() == ExamResult.PASS).count();
        double passRate = exams.isEmpty() ? 0 : (passedExams * 100.0 / exams.size());
        data.put("passRate", Math.round(passRate * 10) / 10.0);
        
        data.put("period", formatPeriod(startDate, endDate));
        
        return data;
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> aggregateSubjectAnalysisData(String subjectId, java.time.LocalDate startDate, java.time.LocalDate endDate) {
        Map<String, Object> data = new java.util.HashMap<>();
        
        // Get subject info
        Subject subject = subjectRepository.findById(subjectId).orElseThrow();
        data.put("subjectCode", subject.getSkillCode());
        data.put("subjectName", subject.getSubjectName());
        data.put("systemName", subject.getSystem() != null ? subject.getSystem().getSystemName() : "N/A");
        
        // Get registrations by querying all and filtering
        List<SubjectRegistration> registrations = subjectRegistrationRepository.findAll().stream()
            .filter(r -> r.getSubject().getId().equals(subjectId))
            .collect(Collectors.toList());
        data.put("totalTeachersRegistered", registrations.size());
        
        // Map teachers
        List<Map<String, Object>> teachers = registrations.stream()
            .map(reg -> {
                Map<String, Object> teacher = new java.util.HashMap<>();
                User user = reg.getTeacher();
                teacher.put("teacherId", user.getId());
                teacher.put("teacherName", user.getUserDetails() != null ? 
                    user.getUserDetails().getFirstName() + " " + user.getUserDetails().getLastName() : "N/A");
                teacher.put("qualification", user.getAcademicRank() != null ? user.getAcademicRank() : "N/A");
                teacher.put("registeredDate", reg.getCreationTimestamp());
                return teacher;
            })
            .collect(Collectors.toList());
        data.put("registeredTeachers", teachers);
        
        // Get assignments for this subject
        long activeAssignments = teachingAssignmentRepository.findAll().stream()
            .filter(a -> a.getScheduleClass().getSubject().getId().equals(subjectId))
            .filter(a -> a.getStatus() == AssignmentStatus.ASSIGNED)
            .count();
        data.put("totalActiveAssignments", activeAssignments);
        
        // Analysis
        boolean hasEnoughTeachers = registrations.size() >= 2;
        data.put("hasEnoughTeachers", hasEnoughTeachers);
        
        // Recommendations
        List<String> recommendations = new java.util.ArrayList<>();
        if (!hasEnoughTeachers) {
            recommendations.add("Cần tuyển thêm giáo viên cho môn học này");
        }
        if (activeAssignments > registrations.size() * 2) {
            recommendations.add("Số lớp phân công quá nhiều so với số giáo viên");
        }
        data.put("recommendations", recommendations);
        
        data.put("period", formatPeriod(startDate, endDate));
        
        return data;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> aggregateAptechDetailsData(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        Map<String, Object> data = new java.util.HashMap<>();
        
        // Get all exams in period
        List<AptechExam> exams = aptechExamRepository.findAll().stream()
            .filter(e -> {
                if (e.getExamDate() == null) return false;
                boolean afterStart = startDate == null || !e.getExamDate().isBefore(startDate);
                boolean beforeEnd = endDate == null || !e.getExamDate().isAfter(endDate);
                return afterStart && beforeEnd;
            })
            .collect(Collectors.toList());
            
        data.put("totalExams", exams.size());
        
        // Map to DTOs
        List<Map<String, Object>> examList = exams.stream()
            .map(exam -> {
                Map<String, Object> examData = new java.util.HashMap<>();
                examData.put("teacherName", exam.getTeacher() != null && exam.getTeacher().getUserDetails() != null ? 
                    exam.getTeacher().getUserDetails().getFirstName() + " " + exam.getTeacher().getUserDetails().getLastName() : "N/A");
                examData.put("subjectCode", exam.getSubject().getSkillCode());
                examData.put("subjectName", exam.getSubject().getSubjectName());
                examData.put("examDate", exam.getExamDate());
                examData.put("score", exam.getScore());
                examData.put("result", exam.getResult().toString());
                return examData;
            })
            .collect(Collectors.toList());
        data.put("exams", examList);
        
        // Stats
        long passed = exams.stream().filter(e -> e.getResult() == ExamResult.PASS).count();
        data.put("passedExams", passed);
        data.put("failedExams", exams.size() - passed);
        double passRate = exams.isEmpty() ? 0 : (passed * 100.0 / exams.size());
        data.put("passRate", Math.round(passRate * 100.0) / 100.0);
        
        data.put("period", formatPeriod(startDate, endDate));
        
        return data;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> aggregateTrialDetailsData(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        Map<String, Object> data = new java.util.HashMap<>();
        
        // Get all trials in period
        List<TrialTeaching> trials = trialTeachingRepository.findAll().stream()
            .filter(t -> {
                if (t.getTeachingDate() == null) return false;
                boolean afterStart = startDate == null || !t.getTeachingDate().isBefore(startDate);
                boolean beforeEnd = endDate == null || !t.getTeachingDate().isAfter(endDate);
                return afterStart && beforeEnd;
            })
            .collect(Collectors.toList());
            
        data.put("totalTrials", trials.size());
        
        // Map to DTOs
        List<Map<String, Object>> trialList = trials.stream()
            .map(trial -> {
                Map<String, Object> trialData = new java.util.HashMap<>();
                trialData.put("teacherName", trial.getTeacher() != null && trial.getTeacher().getUserDetails() != null ? 
                    trial.getTeacher().getUserDetails().getFirstName() + " " + trial.getTeacher().getUserDetails().getLastName() : "N/A");
                trialData.put("subjectCode", trial.getSubject().getSkillCode());
                trialData.put("subjectName", trial.getSubject().getSubjectName());
                trialData.put("teachingDate", trial.getTeachingDate());
                
                TrialEvaluation eval = getFirstEvaluation(trial);
                trialData.put("score", eval != null ? eval.getScore() : "N/A");
                trialData.put("result", eval != null ? eval.getConclusion().toString() : "PENDING");
                
                return trialData;
            })
            .collect(Collectors.toList());
        data.put("trials", trialList);
        
        // Stats
        long passed = trials.stream().filter(t -> {
            TrialEvaluation eval = getFirstEvaluation(t);
            return eval != null && eval.getConclusion() == TrialConclusion.PASS;
        }).count();
        data.put("passedTrials", passed);
        data.put("failedTrials", trials.size() - passed);
        double passRate = trials.isEmpty() ? 0 : (passed * 100.0 / trials.size());
        data.put("passRate", Math.round(passRate * 100.0) / 100.0);
        
        data.put("period", formatPeriod(startDate, endDate));
        
        return data;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> aggregatePersonalSummaryData(String teacherId) {
        Map<String, Object> data = new java.util.HashMap<>();
        
        // Get teacher info
        User teacher = userRepository.findById(teacherId).orElseThrow();
        data.put("teacherName", teacher.getUserDetails() != null ? 
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : "N/A");
        data.put("email", teacher.getEmail());
        data.put("qualification", teacher.getAcademicRank() != null ? teacher.getAcademicRank() : "N/A");
        
        // Summary stats
        // Subjects
        List<SubjectRegistration> registrations = subjectRegistrationRepository.findByTeacherId(teacherId);
        data.put("totalSubjects", registrations.size());
        long completedSubjects = registrations.stream().filter(r -> r.getStatus() == RegistrationStatus.COMPLETED).count();
        data.put("completedSubjects", completedSubjects);
        
        // Exams
        List<AptechExam> exams = aptechExamRepository.findByTeacherId(teacherId);
        data.put("totalExams", exams.size());
        long passedExams = exams.stream().filter(e -> e.getResult() == ExamResult.PASS).count();
        data.put("passedExams", passedExams);
        double examPassRate = exams.isEmpty() ? 0 : (passedExams * 100.0 / exams.size());
        data.put("examPassRate", Math.round(examPassRate * 100.0) / 100.0);
        
        // Trials
        List<TrialTeaching> trials = trialTeachingRepository.findByTeacherId(teacherId);
        data.put("totalTrials", trials.size());
        long passedTrials = trials.stream().filter(t -> {
            TrialEvaluation eval = getFirstEvaluation(t);
            return eval != null && eval.getConclusion() == TrialConclusion.PASS;
        }).count();
        data.put("passedTrials", passedTrials);
        double trialPassRate = trials.isEmpty() ? 0 : (passedTrials * 100.0 / trials.size());
        data.put("trialPassRate", Math.round(trialPassRate * 100.0) / 100.0);
        
        // Assignments
        List<TeachingAssignment> assignments = teachingAssignmentRepository.findByTeacherId(teacherId);
        data.put("totalAssignments", assignments.size());
        long completedAssignments = assignments.stream().filter(a -> a.getStatus() == AssignmentStatus.COMPLETED).count();
        data.put("completedAssignments", completedAssignments);
        
        return data;
    }

    private String formatPeriod(java.time.LocalDate startDate, java.time.LocalDate endDate) {
        if (startDate == null || endDate == null) {
            return "N/A";
        }
        java.time.format.DateTimeFormatter formatter = java.time.format.DateTimeFormatter.ofPattern("dd/MM/yyyy");
        return startDate.format(formatter) + " - " + endDate.format(formatter);
    }
}
