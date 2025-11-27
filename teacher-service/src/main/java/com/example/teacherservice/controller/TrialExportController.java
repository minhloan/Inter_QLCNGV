package com.example.teacherservice.controller;

import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.dto.trial.TrialTeachingDto;
import com.example.teacherservice.service.trial.TrialEvaluationExportService;
import com.example.teacherservice.service.trial.TrialEvaluationService;
import com.example.teacherservice.service.trial.TrialTeachingService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/trial/export")
@RequiredArgsConstructor
@Slf4j
public class TrialExportController {

    private final TrialEvaluationExportService exportService;
    private final TrialTeachingService trialTeachingService;
    private final TrialEvaluationService evaluationService;

    /**
     * BM06.39 - Export Phân công đánh giá giáo viên giảng thử (Word)
     */
    @GetMapping("/{trialId}/assignment")
    public ResponseEntity<byte[]> exportAssignment(@PathVariable String trialId) {
        try {
            TrialTeachingDto trial = trialTeachingService.getTrialById(trialId);
            byte[] document = exportService.generateAssignmentDocument(trial);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", 
                    "BM06.39-Phan_cong_danh_gia_GV_giang_thu_" + trialId + ".docx");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document);
        } catch (Exception e) {
            log.error("Error exporting assignment document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * BM06.40 - Export Phiếu đánh giá giảng thử (Excel)
     * Cho phép export ngay cả khi chưa có evaluation (sẽ export template trống)
     */
    @GetMapping("/{trialId}/evaluation-form/{attendeeId}")
    public ResponseEntity<byte[]> exportEvaluationForm(
            @PathVariable String trialId,
            @PathVariable String attendeeId) {
        try {
            TrialTeachingDto trial = trialTeachingService.getTrialById(trialId);
            
            // Tìm evaluation nếu có, nếu không có thì để null (sẽ export template trống)
            TrialEvaluationDto evaluation = null;
            try {
                evaluation = evaluationService.getEvaluationByAttendeeId(attendeeId);
            } catch (com.example.teacherservice.exception.NotFoundException e) {
                log.info("No evaluation found for attendeeId: {}, exporting empty template", attendeeId);
                // Cho phép export template trống nếu chưa có evaluation
            }
            
            byte[] document = exportService.generateEvaluationForm(trial, evaluation);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            headers.setContentDispositionFormData("attachment", 
                    "BM06.40-Phieu_danh_gia_giang_thu_" + trialId + "_" + attendeeId + ".xlsx");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document);
        } catch (Exception e) {
            log.error("Error exporting evaluation form", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * BM06.41 - Export Biên bản đánh giá giảng thử (Word)
     */
    @GetMapping("/{trialId}/minutes")
    public ResponseEntity<byte[]> exportMinutes(@PathVariable String trialId) {
        try {
            TrialTeachingDto trial = trialTeachingService.getTrialById(trialId);
            byte[] document = exportService.generateMinutesDocument(trial);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.wordprocessingml.document"));
            headers.setContentDispositionFormData("attachment", 
                    "BM06.41-BB_danh_gia_giang_thu_" + trialId + ".docx");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document);
        } catch (Exception e) {
            log.error("Error exporting minutes document", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    /**
     * BM06.42 - Export Thống kê đánh giá GV giảng thử (Excel)
     * Supports filtering by:
     * - Date range (startDate + endDate)
     * - Month (year + month)
     * - Year only
     * - Teacher ID
     * - All trials (no filters)
     */
    @GetMapping("/statistics")
    public ResponseEntity<byte[]> exportStatistics(
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) Integer month) {
        try {
            List<TrialTeachingDto> trials;
            
            // Priority: startDate/endDate > month > year > teacherId > all
            if (startDate != null && endDate != null) {
                java.time.LocalDate start = java.time.LocalDate.parse(startDate);
                java.time.LocalDate end = java.time.LocalDate.parse(endDate);
                trials = trialTeachingService.getTrialsByDateRange(start, end);
            } else if (year != null && month != null) {
                trials = trialTeachingService.getTrialsByMonth(year, month);
            } else if (year != null) {
                trials = trialTeachingService.getTrialsByYear(year);
            } else if (teacherId != null && !teacherId.isEmpty()) {
                trials = trialTeachingService.getTrialsByTeacher(teacherId);
            } else {
                trials = trialTeachingService.getAllTrials();
            }
            
            byte[] document = exportService.generateStatisticsReport(trials);
            
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            
            // Generate filename based on filters
            String filename = generateStatisticsFilename(teacherId, startDate, endDate, year, month);
            
            // Simple Content-Disposition header without complex encoding
            headers.add("Content-Disposition", "attachment; filename=\"" + filename + "\"");
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document);
        } catch (Exception e) {
            log.error("Error exporting statistics report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
    
    private String generateStatisticsFilename(String teacherId, String startDate, String endDate, Integer year, Integer month) {
        StringBuilder filename = new StringBuilder("BM06.42-Thong_ke_danh_gia_GV_giang_thu");
        
        if (startDate != null && endDate != null) {
            filename.append("_").append(startDate).append("_to_").append(endDate);
        } else if (year != null && month != null) {
            filename.append("_").append(String.format("%04d-%02d", year, month));
        } else if (year != null) {
            filename.append("_").append(year);
        } else if (teacherId != null) {
            filename.append("_").append(teacherId);
        } else {
            filename.append("_all");
        }
        
        filename.append(".xlsx");
        return filename.toString();
    }
}

