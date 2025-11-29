package com.example.teacherservice.controller;

import com.example.teacherservice.dto.reports.DashboardStatsDTO;
import com.example.teacherservice.dto.reports.ReportDTO;
import com.example.teacherservice.dto.reports.ReportRequestDTO;
import com.example.teacherservice.enums.Role;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.model.Report;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.ReportRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.service.reports.ManagerReportGeneratorService;
import com.example.teacherservice.service.reports.ReportService;
import com.example.teacherservice.service.reports.TeacherReportGeneratorService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/v1/teacher/reports")
@RequiredArgsConstructor
@Slf4j
public class ReportController {

    private final ReportService reportService;
    private final ReportRepository reportRepository;
    private final UserRepository userRepository;
    private final TeacherReportGeneratorService teacherReportGeneratorService;
    private final ManagerReportGeneratorService managerReportGeneratorService;
    private final com.example.teacherservice.service.reports.TemplateReportService templateReportService;
    private final JwtUtil jwtUtil;

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        try {
            DashboardStatsDTO stats = reportService.getDashboardStats();
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            log.error("Error getting dashboard stats", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping
    public ResponseEntity<List<ReportDTO>> getReports(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String reportType,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer quarter) {
        try {
            List<ReportDTO> reports = reportService.getReports(teacherId, reportType, year, quarter);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error getting reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/generate")
    public ResponseEntity<ReportDTO> generateReport(
            @RequestBody ReportRequestDTO request,
            HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            // If teacherId is not provided, use the current logged-in user as teacher
            if (request.getTeacherId() == null) {
                request.setTeacherId(userId);
            }
            ReportDTO report = reportService.generateReport(request, userId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/download/{reportId}")
    public ResponseEntity<byte[]> downloadReport(@PathVariable String reportId, @RequestParam String format, HttpServletRequest httpRequest) {
        try {
            // Get the report from database
            Report report = reportRepository.findById(reportId)
                    .orElseThrow(() -> new RuntimeException("Report not found"));

            // Get current user to determine role
            String userId = jwtUtil.ExtractUserId(httpRequest);
            User currentUser = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));

            // Check if user has permission to download this report
            boolean isAdmin = currentUser.getPrimaryRole() != null && currentUser.getPrimaryRole() == Role.MANAGE;
            boolean isPersonalReport = report.getTeacher() != null && report.getTeacher().getId().equals(userId);

            if (!isAdmin && !isPersonalReport) {
                return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
            }

            // Regenerate the full report data using the same logic as generation
            Map<String, Object> reportData = reportService.regenerateReportData(report);

            byte[] fileContent;
            String fileName;
            String contentType;

            // Determine which service to use based on primaryRole
            boolean useManagerService = isAdmin && (report.getTeacher() == null ||
                (report.getTeacher() != null && report.getTeacher().getPrimaryRole() == Role.MANAGE));
            boolean useTeacherService = !useManagerService; // Personal reports or admin downloading teacher report

            switch (format.toLowerCase()) {
                case "pdf":
                    // Keep using existing PDF generation
                    if (useManagerService) {
                        fileContent = managerReportGeneratorService.generatePdfReport(reportData);
                    } else {
                        fileContent = teacherReportGeneratorService.generatePdfReport(reportData, report.getTeacher());
                    }
                    fileName = generateFileName(report, ".pdf");
                    contentType = "application/pdf";
                    break;
                case "excel":
                    // NEW: Use TemplateReportService for Excel
                    String reportType = report.getReportType();
                    fileContent = templateReportService.generateExcelFromTemplate(reportType, reportData);
                    fileName = generateFileName(report, ".xlsx");
                    contentType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
                    break;
                case "word":
                    // NEW: Use TemplateReportService for Word  
                    reportType = report.getReportType();
                    fileContent = templateReportService.generateWordFromTemplate(reportType, reportData);
                    fileName = generateFileName(report, ".docx");
                    contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
                    break;
                default:
                    if (useManagerService) {
                        fileContent = managerReportGeneratorService.generatePdfReport(reportData);
                    } else {
                        fileContent = teacherReportGeneratorService.generatePdfReport(reportData, report.getTeacher());
                    }
                    fileName = generateFileName(report, ".pdf");
                    contentType = "application/pdf";
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType(contentType));
            headers.setContentDispositionFormData("attachment", fileName);

            return ResponseEntity.ok()
                    .headers(headers)
                    .body(fileContent);
        } catch (Exception e) {
            log.error("Error downloading report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    private String generateFileName(Report report, String extension) {
        if (report.getFile() != null && report.getFile().getFileName() != null) {
            // Use existing filename but replace extension
            return report.getFile().getFileName().replaceAll("\\.[^.]*$", extension);
        } else {
            // Generate filename dynamically
            String type = report.getReportType().toLowerCase();
            String year = report.getYear() != null ? "_" + report.getYear() : "";
            String quarter = report.getQuarter() != null ? "_q" + report.getQuarter() : "";
            String timestamp = String.valueOf(System.currentTimeMillis());

            return type + "_report" + year + quarter + "_" + timestamp + extension;
        }
    }

    // Personal reports for teachers
    @GetMapping("/personal")
    public ResponseEntity<List<ReportDTO>> getPersonalReports(HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            List<ReportDTO> reports = reportService.getReports(userId, null, null, null);
            return ResponseEntity.ok(reports);
        } catch (Exception e) {
            log.error("Error getting personal reports", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @PostMapping("/personal/generate")
    public ResponseEntity<ReportDTO> generatePersonalReport(
            @RequestBody ReportRequestDTO request,
            HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            request.setTeacherId(userId); // Set teacher ID to current user
            ReportDTO report = reportService.generateReport(request, userId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            log.error("Error generating personal report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    // Personal stats endpoints
    @GetMapping("/personal/subjects")
    public ResponseEntity<List<Map<String, Object>>> getPersonalSubjects(HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            List<Map<String, Object>> subjects = reportService.getPersonalSubjects(userId);
            return ResponseEntity.ok(subjects);
        } catch (Exception e) {
            log.error("Error getting personal subjects", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/personal/exams")
    public ResponseEntity<List<Map<String, Object>>> getPersonalExams(HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            List<Map<String, Object>> exams = reportService.getPersonalExams(userId);
            return ResponseEntity.ok(exams);
        } catch (Exception e) {
            log.error("Error getting personal exams", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/personal/trials")
    public ResponseEntity<List<Map<String, Object>>> getPersonalTrials(HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            List<Map<String, Object>> trials = reportService.getPersonalTrials(userId);
            return ResponseEntity.ok(trials);
        } catch (Exception e) {
            log.error("Error getting personal trials", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/personal/pass-rates")
    public ResponseEntity<Map<String, Object>> getPersonalPassRates(HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            Map<String, Object> passRates = reportService.getPersonalPassRates(userId);
            return ResponseEntity.ok(passRates);
        } catch (Exception e) {
            log.error("Error getting personal pass rates", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/personal/evidence")
    public ResponseEntity<List<Map<String, Object>>> getPersonalEvidence(HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            List<Map<String, Object>> evidence = reportService.getPersonalEvidence(userId);
            return ResponseEntity.ok(evidence);
        } catch (Exception e) {
            log.error("Error getting personal evidence", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @GetMapping("/personal/assignments")
    public ResponseEntity<List<Map<String, Object>>> getPersonalAssignments(HttpServletRequest httpRequest) {
        try {
            String userId = jwtUtil.ExtractUserId(httpRequest);
            List<Map<String, Object>> assignments = reportService.getPersonalAssignments(userId);
            return ResponseEntity.ok(assignments);
        } catch (Exception e) {
            log.error("Error getting personal assignments", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}
