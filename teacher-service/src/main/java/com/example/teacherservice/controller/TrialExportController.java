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
     */
    @GetMapping("/{trialId}/evaluation-form/{attendeeId}")
    public ResponseEntity<byte[]> exportEvaluationForm(
            @PathVariable String trialId,
            @PathVariable String attendeeId) {
        try {
            TrialTeachingDto trial = trialTeachingService.getTrialById(trialId);
            TrialEvaluationDto evaluation = evaluationService.getEvaluationByAttendeeId(attendeeId);
            
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
     * Có thể filter theo teacherId hoặc lấy tất cả
     */
    @GetMapping("/statistics")
    public ResponseEntity<byte[]> exportStatistics(
            @RequestParam(required = false) String teacherId) {
        try {
            List<TrialTeachingDto> trials;
            if (teacherId != null && !teacherId.isEmpty()) {
                trials = trialTeachingService.getTrialsByTeacher(teacherId);
            } else {
                trials = trialTeachingService.getAllTrials();
            }
            
            byte[] document = exportService.generateStatisticsReport(trials);
            
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"));
            String filename = teacherId != null ? 
                    "BM06.42-Thong_ke_danh_gia_GV_giang_thu_" + teacherId + ".xlsx" :
                    "BM06.42-Thong_ke_danh_gia_GV_giang_thu_all.xlsx";
            headers.setContentDispositionFormData("attachment", filename);
            
            return ResponseEntity.ok()
                    .headers(headers)
                    .body(document);
        } catch (Exception e) {
            log.error("Error exporting statistics report", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}

