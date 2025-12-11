package com.example.teacherservice.service.reports;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Service to generate reports using templates
 * Templates location: src/main/resources/templates/
 * - baocao-template.xlsx
 * - baocao-template.docx
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class TemplateReportService {

    private static final String EXCEL_TEMPLATE = "templates/baocao-template.xlsx";
    private static final String WORD_TEMPLATE = "templates/baocao-template.docx";
    
    // Starting row for data (after header)
    private static final int DATA_START_ROW = 5;

    /**
     * Generate Excel report using template
     * @param reportType Type of report (TEACHER_PERFORMANCE, SUBJECT_ANALYSIS, etc.)
     * @param data Report data
     * @return Excel file as byte array
     */
    public byte[] generateExcelFromTemplate(String reportType, Map<String, Object> data) throws IOException {
        try (InputStream templateStream = new ClassPathResource(EXCEL_TEMPLATE).getInputStream();
             Workbook workbook = new XSSFWorkbook(templateStream)) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            // Update report title based on type
            updateExcelTitle(sheet, reportType, data);
            
            // Populate data based on report type
            switch (reportType) {
                case "TEACHER_PERFORMANCE":
                    populateTeacherPerformance(sheet, data);
                    break;
                case "SUBJECT_ANALYSIS":
                    populateSubjectAnalysis(sheet, data);
                    break;
                case "PERSONAL_SUMMARY":
                    populatePersonalSummary(sheet, data);
                    break;
                case "QUARTER":
                    populateQuarterReport(sheet, data);
                    break;
                case "YEAR":
                    populateYearReport(sheet, data);
                    break;
                case "APTECH":
                    populateAptechReport(sheet, data);
                    break;
                case "TRIAL":
                    populateTrialReport(sheet, data);
                    break;
                default:
                    populateGenericReport(sheet, data);
            }
            
            // Auto-size columns
            for (int i = 0; i < 10; i++) {
                sheet.autoSizeColumn(i);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * Generate Word report using template
     */
    public byte[] generateWordFromTemplate(String reportType, Map<String, Object> data) throws IOException {
        try (InputStream templateStream = new ClassPathResource(WORD_TEMPLATE).getInputStream();
             XWPFDocument document = new XWPFDocument(templateStream)) {
            
            // Replace placeholders in template
            replacePlaceholders(document, reportType, data);
            
            // Add content based on report type
            switch (reportType) {
                case "TEACHER_PERFORMANCE":
                    addTeacherPerformanceContent(document, data);
                    break;
                case "SUBJECT_ANALYSIS":
                    addSubjectAnalysisContent(document, data);
                    break;
                case "PERSONAL_SUMMARY":
                    addPersonalSummaryContent(document, data);
                    break;
                default:
                    addGenericContent(document, data);
            }
            
            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
            document.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    // ============================================
    // EXCEL POPULATION METHODS
    // ============================================

    private void updateExcelTitle(Sheet sheet, String reportType, Map<String, Object> data) {
        // Row 4: Main title (after CUSC header which is rows 0-3)
        Row titleRow = sheet.getRow(4);
        if (titleRow == null) {
            titleRow = sheet.createRow(4);
        }
        
        Cell titleCell = titleRow.getCell(0);
        if (titleCell == null) {
            titleCell = titleRow.createCell(0);
        }
        
        String title = getReportTitle(reportType, data);
        titleCell.setCellValue(title);
        
        // Apply bold style
        CellStyle titleStyle = sheet.getWorkbook().createCellStyle();
        Font titleFont = sheet.getWorkbook().createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 14);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleCell.setCellStyle(titleStyle);
    }

    private void populateTeacherPerformance(Sheet sheet, Map<String, Object> data) {
        CellStyle dataStyle = createDataCellStyle(sheet.getWorkbook());
        int currentRow = DATA_START_ROW;

        // Section 1: Teacher Info
        createSectionHeader(sheet, currentRow++, "I. THÔNG TIN GIÁO VIÊN");
        currentRow = createInfoRow(sheet, currentRow, "Họ tên:", data.get("teacherName"));
        currentRow = createInfoRow(sheet, currentRow, "Trình độ:", data.get("qualification"));
        currentRow = createInfoRow(sheet, currentRow, "Email:", data.get("email"));
        currentRow++; // Blank row

        // Section 2: Overview Stats
        createSectionHeader(sheet, currentRow++, "II. TỔNG QUAN");
        currentRow = createInfoRow(sheet, currentRow, "Môn đã đăng ký:", data.get("totalSubjectsRegistered"));
        currentRow = createInfoRow(sheet, currentRow, "Lớp đã phân công:", data.get("totalAssignments"));
        currentRow = createInfoRow(sheet, currentRow, "Kỳ thi Aptech:", data.get("totalExams"));
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ đạt:", data.get("passRate") + "%");
        currentRow++; // Blank row

        // Section 3: Registered Subjects Table
        createSectionHeader(sheet, currentRow++, "III. DANH SÁCH MÔN HỌC");
        String[] subjectHeaders = {"STT", "Mã môn", "Tên môn", "System", "Ngày đăng ký"};
        currentRow = createTableHeader(sheet, currentRow, subjectHeaders);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> subjects = (List<Map<String, Object>>) data.get("registeredSubjects");
        if (subjects != null) {
            for (int i = 0; i < subjects.size(); i++) {
                Map<String, Object> subject = subjects.get(i);
                Row row = sheet.createRow(currentRow++);
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(i + 1);
                cell0.setCellStyle(dataStyle);
                Cell cell1 = row.createCell(1);
                cell1.setCellValue((String) subject.get("code"));
                cell1.setCellStyle(dataStyle);
                Cell cell2 = row.createCell(2);
                cell2.setCellValue((String) subject.get("name"));
                cell2.setCellStyle(dataStyle);
                Cell cell3 = row.createCell(3);
                cell3.setCellValue((String) subject.get("system"));
                cell3.setCellStyle(dataStyle);
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(formatDate(subject.get("registeredDate")));
                cell4.setCellStyle(dataStyle);
            }
        }
        currentRow++;

        // Section 4: Aptech Exams Table
        createSectionHeader(sheet, currentRow++, "IV. LỊCH SỬ KỲ THI APTECH");
        String[] examHeaders = {"STT", "Session", "Ngày thi", "Môn", "Điểm", "Kết quả"};
        currentRow = createTableHeader(sheet, currentRow, examHeaders);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("exams");
        if (exams != null) {
            for (int i = 0; i < exams.size(); i++) {
                Map<String, Object> exam = exams.get(i);
                Row row = sheet.createRow(currentRow++);
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(i + 1);
                cell0.setCellStyle(dataStyle);
                Cell cell1 = row.createCell(1);
                cell1.setCellValue((String) exam.get("sessionName"));
                cell1.setCellStyle(dataStyle);
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(formatDate(exam.get("examDate")));
                cell2.setCellStyle(dataStyle);
                Cell cell3 = row.createCell(3);
                cell3.setCellValue((String) exam.get("subjectName"));
                cell3.setCellStyle(dataStyle);
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(exam.get("score") != null ? exam.get("score").toString() : "N/A");
                cell4.setCellStyle(dataStyle);
                Cell cell5 = row.createCell(5);
                cell5.setCellValue((Boolean) exam.get("passed") ? "Đạt" : "Không đạt");
                cell5.setCellStyle(dataStyle);
            }
        }
    }

    private void populateSubjectAnalysis(Sheet sheet, Map<String, Object> data) {
        CellStyle dataStyle = createDataCellStyle(sheet.getWorkbook());
        int currentRow = DATA_START_ROW;

        // Section 1: Subject Info
        createSectionHeader(sheet, currentRow++, "I. THÔNG TIN MÔN HỌC");
        currentRow = createInfoRow(sheet, currentRow, "Mã môn:", data.get("subjectCode"));
        currentRow = createInfoRow(sheet, currentRow, "Tên môn:", data.get("subjectName"));
        currentRow = createInfoRow(sheet, currentRow, "System:", data.get("systemName"));
        currentRow++;

        // Section 2: Statistics
        createSectionHeader(sheet, currentRow++, "II. THỐNG KÊ");
        currentRow = createInfoRow(sheet, currentRow, "Số GV đã đăng ký:", data.get("totalTeachersRegistered"));
        currentRow = createInfoRow(sheet, currentRow, "Số lớp active:", data.get("totalActiveAssignments"));
        Boolean hasEnoughTeachers = (Boolean) data.get("hasEnoughTeachers");
        String hasEnoughText = hasEnoughTeachers != null ? (hasEnoughTeachers ? "Có" : "Không") : "N/A";
        currentRow = createInfoRow(sheet, currentRow, "Đủ GV:", hasEnoughText);
        currentRow++;

        // Section 3: Registered Teachers
        createSectionHeader(sheet, currentRow++, "III. GIÁO VIÊN ĐÃ ĐĂNG KÝ");
        String[] teacherHeaders = {"STT", "Mã GV", "Họ tên", "Trình độ", "Ngày đăng ký"};
        currentRow = createTableHeader(sheet, currentRow, teacherHeaders);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teachers = (List<Map<String, Object>>) data.get("registeredTeachers");
        if (teachers != null) {
            for (int i = 0; i < teachers.size(); i++) {
                Map<String, Object> teacher = teachers.get(i);
                Row row = sheet.createRow(currentRow++);
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(i + 1);
                cell0.setCellStyle(dataStyle);
                Cell cell1 = row.createCell(1);
                cell1.setCellValue((String) teacher.get("teacherId"));
                cell1.setCellStyle(dataStyle);
                Cell cell2 = row.createCell(2);
                cell2.setCellValue((String) teacher.get("teacherName"));
                cell2.setCellStyle(dataStyle);
                Cell cell3 = row.createCell(3);
                cell3.setCellValue((String) teacher.get("qualification"));
                cell3.setCellStyle(dataStyle);
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(formatDate(teacher.get("registeredDate")));
                cell4.setCellStyle(dataStyle);
            }
        }
        currentRow++;

        // Recommendations
        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) data.get("recommendations");
        if (recommendations != null && !recommendations.isEmpty()) {
            createSectionHeader(sheet, currentRow++, "IV. ĐỀ XUẤT");
            for (String rec : recommendations) {
                Row row = sheet.createRow(currentRow++);
                row.createCell(0).setCellValue("• " + rec);
            }
        }
    }

    private void populateAptechDetails(Sheet sheet, Map<String, Object> data) {
        int currentRow = DATA_START_ROW;
        
        createSectionHeader(sheet, currentRow++, "DANH SÁCH KỲ THI APTECH CHI TIẾT");
        currentRow  = createInfoRow(sheet, currentRow, "Kỳ:", data.get("period"));
        currentRow++;
        
        String[] headers = {"STT", "Mã GV", "Họ tên", "Session", "Môn thi", "Ngày thi", "Điểm", "Kết quả", "Certificate"};
        currentRow = createTableHeader(sheet, currentRow, headers);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("examDetails");
        if (exams != null) {
            for (int i = 0; i < exams.size(); i++) {
                Map<String, Object> exam = exams.get(i);
                Row row = sheet.createRow(currentRow++);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue((String) exam.get("teacherCode"));
                row.createCell(2).setCellValue((String) exam.get("teacherName"));
                row.createCell(3).setCellValue((String) exam.get("sessionName"));
                row.createCell(4).setCellValue((String) exam.get("subjectName"));
                row.createCell(5).setCellValue(formatDate(exam.get("examDate")));
                row.createCell(6).setCellValue(exam.get("score") != null ? exam.get("score").toString() : "N/A");
                row.createCell(7).setCellValue((Boolean) exam.get("passed") ? "Đạt" : "Không đạt");
                row.createCell(8).setCellValue(exam.get("certificateUrl") != null ? "Đã upload" : "Chưa upload");
            }
        }
        
        // Summary
        currentRow++;
        createSectionHeader(sheet, currentRow++, "TỔNG KẾT");
        currentRow = createInfoRow(sheet, currentRow, "Tổng số kỳ thi:", data.get("totalExams"));
        currentRow = createInfoRow(sheet, currentRow, "Số kỳ đạt:", data.get("passedExams"));
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ đạt:", data.get("passRate") + "%");
    }

    private void populateTrialDetails(Sheet sheet, Map<String, Object> data) {
        int currentRow = DATA_START_ROW;
        
        createSectionHeader(sheet, currentRow++, "DANH SÁCH GIẢNG THỬ CHI TIẾT");
        currentRow = createInfoRow(sheet, currentRow, "Kỳ:", data.get("period"));
        currentRow++;
        
        String[] headers = {"STT", "Mã GV", "Họ tên", "Môn", "Ngày giảng", "Đánh giá", "Kết luận", "Nhận xét"};
        currentRow = createTableHeader(sheet, currentRow, headers);
        
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trials = (List<Map<String, Object>>) data.get("trialDetails");
        if (trials != null) {
            for (int i = 0; i < trials.size(); i++) {
                Map<String, Object> trial = trials.get(i);
                Row row = sheet.createRow(currentRow++);
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue((String) trial.get("teacherCode"));
                row.createCell(2).setCellValue((String) trial.get("teacherName"));
                row.createCell(3).setCellValue((String) trial.get("subjectName"));
                row.createCell(4).setCellValue(formatDate(trial.get("teachingDate")));
                row.createCell(5).setCellValue(trial.get("score") != null ? trial.get("score").toString() : "N/A");
                row.createCell(6).setCellValue((String) trial.get("conclusion"));
                row.createCell(7).setCellValue((String) trial.get("comments"));
            }
        }
        
        // Summary
        currentRow++;
        createSectionHeader(sheet, currentRow++, "TỔNG KẾT");
        currentRow = createInfoRow(sheet, currentRow, "Tổng số buổi:", data.get("totalTrials"));
        currentRow = createInfoRow(sheet, currentRow, "Số buổi đạt:", data.get("passedTrials"));
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ đạt:", data.get("passRate") + "%");
    }

    private void populatePersonalSummary(Sheet sheet, Map<String, Object> data) {
        CellStyle dataStyle = createDataCellStyle(sheet.getWorkbook());
        int currentRow = DATA_START_ROW;

        // Section 1: Profile Overview
        createSectionHeader(sheet, currentRow++, "I. THÔNG TIN CÁ NHÂN");
        @SuppressWarnings("unchecked")
        Map<String, Object> profile = (Map<String, Object>) data.get("profile");
        currentRow = createInfoRow(sheet, currentRow, "Họ tên:", profile.get("fullName"));
        currentRow = createInfoRow(sheet, currentRow, "Trình độ:", data.get("qualification"));
        currentRow = createInfoRow(sheet, currentRow, "Email:", profile.get("email"));
        currentRow++;

        // Section 2: Teaching Activities
        createSectionHeader(sheet, currentRow++, "II. HOẠT ĐỘNG GIẢNG DẠY");
        currentRow = createInfoRow(sheet, currentRow, "Môn đã đăng ký:",
            ((List<?>) data.get("registeredSubjects")).size());
        currentRow = createInfoRow(sheet, currentRow, "Lớp hiện tại:",
            ((List<?>) data.get("currentAssignments")).size());
        currentRow = createInfoRow(sheet, currentRow, "Lớp đã hoàn thành:",
            ((List<?>) data.get("pastAssignments")).size());
        currentRow++;

        // Current Assignments Table
        createSectionHeader(sheet, currentRow++, "III. LỚP ĐANG GIẢNG");
        String[] assignHeaders = {"STT", "Môn học", "Lớp", "Ngày bắt đầu", "Ngày kết thúc"};
        currentRow = createTableHeader(sheet, currentRow, assignHeaders);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> assignments = (List<Map<String, Object>>) data.get("currentAssignments");
        if (assignments != null) {
            for (int i = 0; i < assignments.size(); i++) {
                Map<String, Object> assign = assignments.get(i);
                Row row = sheet.createRow(currentRow++);
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(i + 1);
                cell0.setCellStyle(dataStyle);
                Cell cell1 = row.createCell(1);
                cell1.setCellValue((String) assign.get("subjectName"));
                cell1.setCellStyle(dataStyle);
                Cell cell2 = row.createCell(2);
                cell2.setCellValue((String) assign.get("className"));
                cell2.setCellStyle(dataStyle);
                Cell cell3 = row.createCell(3);
                cell3.setCellValue(formatDate(assign.get("startDate")));
                cell3.setCellStyle(dataStyle);
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(formatDate(assign.get("endDate")));
                cell4.setCellStyle(dataStyle);
            }
        }
        currentRow++;

        // Section 4: Certifications & Exams
        createSectionHeader(sheet, currentRow++, "IV. CHỨNG CHỈ & KỲ THI");
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ đạt tổng thể:", data.get("overallPassRate") + "%");
        currentRow++;

        String[] examHeaders = {"STT", "Session", "Ngày thi", "Môn", "Điểm", "Kết quả"};
        currentRow = createTableHeader(sheet, currentRow, examHeaders);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("examHistory");
        if (exams != null) {
            for (int i = 0; i < exams.size(); i++) {
                Map<String, Object> exam = exams.get(i);
                Row row = sheet.createRow(currentRow++);
                Cell cell0 = row.createCell(0);
                cell0.setCellValue(i + 1);
                cell0.setCellStyle(dataStyle);
                Cell cell1 = row.createCell(1);
                cell1.setCellValue((String) exam.get("sessionName"));
                cell1.setCellStyle(dataStyle);
                Cell cell2 = row.createCell(2);
                cell2.setCellValue(formatDate(exam.get("examDate")));
                cell2.setCellStyle(dataStyle);
                Cell cell3 = row.createCell(3);
                cell3.setCellValue((String) exam.get("subjectName"));
                cell3.setCellStyle(dataStyle);
                Cell cell4 = row.createCell(4);
                cell4.setCellValue(exam.get("score") != null ? exam.get("score").toString() : "N/A");
                cell4.setCellStyle(dataStyle);
                Cell cell5 = row.createCell(5);
                cell5.setCellValue(exam.get("passed") != null && (Boolean) exam.get("passed") ? "Đạt" : "Chưa có KQ");
                cell5.setCellStyle(dataStyle);
            }
        }
    }

    private void populateQuarterReport(Sheet sheet, Map<String, Object> data) {
        int currentRow = DATA_START_ROW;

        // Period info
        currentRow = createInfoRow(sheet, currentRow, "Thời gian:", getPeriodText(data));
        currentRow++;

        // Teacher stats table
        String[] headers = {"STT", "Mã GV", "Họ tên", "Số môn", "Hoàn thành", "Tỷ lệ", "Ghi chú"};
        currentRow = createTableHeader(sheet, currentRow, headers);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherQuarterStats = (List<Map<String, Object>>) data.get("teacherQuarterStats");
        if (teacherQuarterStats != null && !teacherQuarterStats.isEmpty()) {
            for (int i = 0; i < teacherQuarterStats.size(); i++) {
                Map<String, Object> teacher = teacherQuarterStats.get(i);
                Row row = sheet.createRow(currentRow++);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue((String) teacher.get("teacherCode"));
                row.createCell(2).setCellValue((String) teacher.get("teacherName"));
                row.createCell(3).setCellValue(teacher.get("totalSubjects") != null ? teacher.get("totalSubjects").toString() : "0");
                row.createCell(4).setCellValue(teacher.get("completedSubjects") != null ? teacher.get("completedSubjects").toString() : "0");
                row.createCell(5).setCellValue((teacher.get("completionRate") != null ? teacher.get("completionRate").toString() : "0") + "%");
                row.createCell(6).setCellValue(teacher.get("notes") != null ? (String) teacher.get("notes") : "");
            }
        }
        currentRow++;

        // Summary
        currentRow = createInfoRow(sheet, currentRow, "Tổng số giảng viên:", data.get("totalTeachers") != null ? data.get("totalTeachers").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tổng số môn học:", data.get("totalSubjects") != null ? data.get("totalSubjects").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tổng môn hoàn thành:", data.get("totalCompleted") != null ? data.get("totalCompleted").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ hoàn thành trung bình:", (data.get("avgCompletionRate") != null ? data.get("avgCompletionRate").toString() : "0") + "%");
    }

    private void populateYearReport(Sheet sheet, Map<String, Object> data) {
        int currentRow = DATA_START_ROW;

        // Period info
        currentRow = createInfoRow(sheet, currentRow, "Thời gian:", getPeriodText(data));
        currentRow++;

        // Teacher stats table
        String[] headers = {"STT", "Mã GV", "Họ tên", "Tổng môn", "Hoàn thành", "Tỷ lệ", "Số thi", "Thi đạt", "Giảng thử"};
        currentRow = createTableHeader(sheet, currentRow, headers);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherYearStats = (List<Map<String, Object>>) data.get("teacherYearStats");
        if (teacherYearStats != null && !teacherYearStats.isEmpty()) {
            for (int i = 0; i < teacherYearStats.size(); i++) {
                Map<String, Object> teacher = teacherYearStats.get(i);
                Row row = sheet.createRow(currentRow++);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue(teacher.get("teacherCode") != null ? (String) teacher.get("teacherCode") : "");
                row.createCell(2).setCellValue(teacher.get("teacherName") != null ? (String) teacher.get("teacherName") : "");
                row.createCell(3).setCellValue(teacher.get("totalSubjects") != null ? teacher.get("totalSubjects").toString() : "0");
                row.createCell(4).setCellValue(teacher.get("completedSubjects") != null ? teacher.get("completedSubjects").toString() : "0");
                row.createCell(5).setCellValue(teacher.get("completionRate") != null ? teacher.get("completionRate").toString() : "0");
                row.createCell(6).setCellValue(teacher.get("totalExams") != null ? teacher.get("totalExams").toString() : "0");
                row.createCell(7).setCellValue(teacher.get("passedExams") != null ? teacher.get("passedExams").toString() : "0");
                row.createCell(8).setCellValue(teacher.get("totalTrials") != null ? teacher.get("totalTrials").toString() : "0");
            }
        }
        currentRow++;

        // Summary
        createSectionHeader(sheet, currentRow++, "TỔNG KẾT NĂM");
        currentRow = createInfoRow(sheet, currentRow, "Tổng số giảng viên:", data.get("totalTeachers") != null ? data.get("totalTeachers").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tổng số môn học:", data.get("totalSubjects") != null ? data.get("totalSubjects").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tổng môn hoàn thành:", data.get("totalCompleted") != null ? data.get("totalCompleted").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ hoàn thành trung bình:", data.get("avgCompletionRate") != null ? data.get("avgCompletionRate").toString() + "%" : "0%");
        currentRow = createInfoRow(sheet, currentRow, "Tổng số kỳ thi:", data.get("totalExams") != null ? data.get("totalExams").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tổng thi đạt:", data.get("totalPassedExams") != null ? data.get("totalPassedExams").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ thi đạt trung bình:", data.get("avgExamPassRate") != null ? data.get("avgExamPassRate").toString() + "%" : "0%");
    }

    private void populateAptechReport(Sheet sheet, Map<String, Object> data) {
        int currentRow = DATA_START_ROW;

        // Period info
        currentRow = createInfoRow(sheet, currentRow, "Thời gian:", getPeriodText(data));
        currentRow++;

        // Exam details table
        String[] headers = {"STT", "Mã GV", "Họ tên", "Môn thi", "Ngày thi", "Điểm", "Kết quả", "Lần thi"};
        currentRow = createTableHeader(sheet, currentRow, headers);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allExams = (List<Map<String, Object>>) data.get("allExams");
        if (allExams != null && !allExams.isEmpty()) {
            for (int i = 0; i < allExams.size(); i++) {
                Map<String, Object> exam = allExams.get(i);
                Row row = sheet.createRow(currentRow++);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue(exam.get("teacherCode") != null ? (String) exam.get("teacherCode") : "");
                row.createCell(2).setCellValue(exam.get("teacherName") != null ? (String) exam.get("teacherName") : "");
                row.createCell(3).setCellValue(exam.get("subjectName") != null ? (String) exam.get("subjectName") : "");
                row.createCell(4).setCellValue(exam.get("examDate") != null ? exam.get("examDate").toString() : "N/A");
                row.createCell(5).setCellValue(exam.get("score") != null ? exam.get("score").toString() : "0");
                row.createCell(6).setCellValue(exam.get("result") != null ? (String) exam.get("result") : "");
                row.createCell(7).setCellValue(exam.get("attempt") != null ? exam.get("attempt").toString() : "1");
            }
        }
        currentRow++;

        // Summary
        currentRow = createInfoRow(sheet, currentRow, "Tổng số kỳ thi:", data.get("totalExams") != null ? data.get("totalExams").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Số môn đạt:", data.get("passedExams") != null ? data.get("passedExams").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Số môn không đạt:", String.valueOf(
                data.get("totalExams") != null && data.get("passedExams") != null ?
                        ((Number) data.get("totalExams")).longValue() - ((Number) data.get("passedExams")).longValue()
                        : 0
        ));
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ đạt:", data.get("passRate") != null ? data.get("passRate") + "%" : "0%");
        currentRow = createInfoRow(sheet, currentRow, "Số giảng viên tham gia:", data.get("participatedTeachers") != null ? data.get("participatedTeachers").toString() : "0");
    }

    private void populateTrialReport(Sheet sheet, Map<String, Object> data) {
        int currentRow = DATA_START_ROW;

        // Period info
        currentRow = createInfoRow(sheet, currentRow, "Thời gian:", getPeriodText(data));
        currentRow++;

        // Trial details table
        String[] headers = {"STT", "Mã GV", "Họ tên", "Môn học", "Ngày giảng thử", "Điểm", "Kết quả", "Nhận xét"};
        currentRow = createTableHeader(sheet, currentRow, headers);

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allTrials = (List<Map<String, Object>>) data.get("allTrials");
        if (allTrials != null && !allTrials.isEmpty()) {
            for (int i = 0; i < allTrials.size(); i++) {
                Map<String, Object> trial = allTrials.get(i);
                Row row = sheet.createRow(currentRow++);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue((String) trial.get("teacherCode"));
                row.createCell(2).setCellValue((String) trial.get("teacherName"));
                row.createCell(3).setCellValue((String) trial.get("subjectName"));
                row.createCell(4).setCellValue(trial.get("teachingDate") != null ?
                        trial.get("teachingDate").toString() : "N/A");
                row.createCell(5).setCellValue(trial.get("score") != null ?
                        trial.get("score").toString() : "0");
                row.createCell(6).setCellValue((String) trial.get("conclusion"));
                row.createCell(7).setCellValue((String) trial.get("comments"));
            }
        }
        currentRow += 2;

        // Summary
        currentRow = createInfoRow(sheet, currentRow, "Tổng số buổi giảng thử:", data.get("totalTrials") != null ? data.get("totalTrials").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Số buổi đạt:", data.get("passedTrials") != null ? data.get("passedTrials").toString() : "0");
        currentRow = createInfoRow(sheet, currentRow, "Tỷ lệ đạt:", data.get("passRate") != null ? data.get("passRate") + "%" : "0%");
        currentRow = createInfoRow(sheet, currentRow, "Số giảng viên tham gia:", data.get("participatedTeachers") != null ? data.get("participatedTeachers").toString() : "0");
    }

    private void populateGenericReport(Sheet sheet, Map<String, Object> data) {
        int currentRow = DATA_START_ROW;
        createSectionHeader(sheet, currentRow++, "BÁO CÁO TỔNG HỢP");

        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!(entry.getValue() instanceof List) && !(entry.getValue() instanceof Map)) {
                currentRow = createInfoRow(sheet, currentRow, entry.getKey() + ":", entry.getValue());
            }
        }
    }

    // ============================================
    // WORD POPULATION METHODS
    // ============================================

    private void replacePlaceholders(XWPFDocument document, String reportType, Map<String, Object> data) {
        // Replace text in paragraphs
        for (XWPFParagraph paragraph : document.getParagraphs()) {
            List<XWPFRun> runs = paragraph.getRuns();
            if (runs != null) {
                for (XWPFRun run : runs) {
                    String text = run.getText(0);
                    if (text != null) {
                        text = replacePlaceholder(text, reportType, data);
                        run.setText(text, 0);
                    }
                }
            }
        }
    }

    private String replacePlaceholder(String text, String reportType, Map<String, Object> data) {
        // Common placeholders
        text = text.replace("{REPORT_TITLE}", getReportTitle(reportType, data));
        text = text.replace("{PERIOD}", data.get("period") != null ? data.get("period").toString() : "");
        text = text.replace("{DATE}", LocalDate.now().format(DateTimeFormatter.ofPattern("dd/MM/yyyy")));
        
        return text;
    }

    private void addTeacherPerformanceContent(XWPFDocument document, Map<String, Object> data) {
        // Add content sections
        addParagraph(document, "I. THÔNG TIN GIÁO VIÊN", true, 12);
        addParagraph(document, "Họ tên: " + data.get("teacherName"), false, 11);
        addParagraph(document, "Trình độ: " + data.get("qualification"), false, 11);
        addParagraph(document, "Email: " + data.get("email"), false, 11);
        addParagraph(document, "", false, 11); // Blank line

        addParagraph(document, "II. TỔNG QUAN", true, 12);
        addParagraph(document, "Môn đã đăng ký: " + data.get("totalSubjectsRegistered"), false, 11);
        addParagraph(document, "Lớp đã phân công: " + data.get("totalAssignments"), false, 11);
        addParagraph(document, "Kỳ thi Aptech: " + data.get("totalExams"), false, 11);
        addParagraph(document, "Tỷ lệ đạt: " + data.get("passRate") + "%", false, 11);
        addParagraph(document, "", false, 11); // Blank line

        // Section 3: Registered Subjects Table
        addParagraph(document, "III. DANH SÁCH MÔN HỌC", true, 12);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> subjects = (List<Map<String, Object>>) data.get("registeredSubjects");
        if (subjects != null && !subjects.isEmpty()) {
            String[] subjectHeaders = {"STT", "Mã môn", "Tên môn", "System", "Ngày đăng ký"};
            String[] subjectKeys = {"index", "code", "name", "system", "registeredDate"};
            addTable(document, subjectHeaders, subjects, subjectKeys);
        }
        addParagraph(document, "", false, 11); // Blank line

        // Section 4: Aptech Exams Table
        addParagraph(document, "IV. LỊCH SỬ KỲ THI APTECH", true, 12);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("exams");
        if (exams != null && !exams.isEmpty()) {
            String[] examHeaders = {"STT", "Session", "Ngày thi", "Môn", "Điểm", "Kết quả"};
            String[] examKeys = {"index", "sessionName", "examDate", "subjectName", "score", "passed"};
            addTable(document, examHeaders, exams, examKeys);
        }
    }

    private void addSubjectAnalysisContent(XWPFDocument document, Map<String, Object> data) {
        addParagraph(document, "I. THÔNG TIN MÔN HỌC", true, 12);
        addParagraph(document, "Mã môn: " + data.get("subjectCode"), false, 11);
        addParagraph(document, "Tên môn: " + data.get("subjectName"), false, 11);
        addParagraph(document, "System: " + data.get("systemName"), false, 11);
        addParagraph(document, "", false, 11); // Blank line

        addParagraph(document, "II. THỐNG KÊ", true, 12);
        addParagraph(document, "Số GV đã đăng ký: " + data.get("totalTeachersRegistered"), false, 11);
        addParagraph(document, "Số lớp active: " + data.get("totalActiveAssignments"), false, 11);
        Boolean hasEnoughTeachers = (Boolean) data.get("hasEnoughTeachers");
        String hasEnoughText = hasEnoughTeachers != null ? (hasEnoughTeachers ? "Có" : "Không") : "N/A";
        addParagraph(document, "Đủ GV: " + hasEnoughText, false, 11);
        addParagraph(document, "", false, 11); // Blank line

        // Section 3: Registered Teachers Table
        addParagraph(document, "III. GIÁO VIÊN ĐÃ ĐĂNG KÝ", true, 12);
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teachers = (List<Map<String, Object>>) data.get("registeredTeachers");
        if (teachers != null && !teachers.isEmpty()) {
            String[] teacherHeaders = {"STT", "Mã GV", "Họ tên", "Trình độ", "Ngày đăng ký"};
            String[] teacherKeys = {"index", "teacherId", "teacherName", "qualification", "registeredDate"};
            addTable(document, teacherHeaders, teachers, teacherKeys);
        }
        addParagraph(document, "", false, 11); // Blank line

        // Recommendations
        @SuppressWarnings("unchecked")
        List<String> recommendations = (List<String>) data.get("recommendations");
        if (recommendations != null && !recommendations.isEmpty()) {
            addParagraph(document, "IV. ĐỀ XUẤT", true, 12);
            for (String rec : recommendations) {
                addParagraph(document, "• " + rec, false, 11);
            }
        }
    }

    private void addPersonalSummaryContent(XWPFDocument document, Map<String, Object> data) {
        // Section 1: Profile Overview
        addParagraph(document, "I. THÔNG TIN CÁ NHÂN", true, 12);
        @SuppressWarnings("unchecked")
        Map<String, Object> profile = (Map<String, Object>) data.get("profile");
        addParagraph(document, "Họ tên: " + profile.get("fullName"), false, 11);
        addParagraph(document, "Trình độ: " + data.get("qualification"), false, 11);
        addParagraph(document, "Email: " + profile.get("email"), false, 11);
        addParagraph(document, "", false, 11); // Blank line

        // Section 2: Teaching Activities
        addParagraph(document, "II. HOẠT ĐỘNG GIẢNG DẠY", true, 12);
        @SuppressWarnings("unchecked")
        List<?> registeredSubjects = (List<?>) data.get("registeredSubjects");
        @SuppressWarnings("unchecked")
        List<?> currentAssignments = (List<?>) data.get("currentAssignments");
        @SuppressWarnings("unchecked")
        List<?> pastAssignments = (List<?>) data.get("pastAssignments");
        addParagraph(document, "Môn đã đăng ký: " + (registeredSubjects != null ? registeredSubjects.size() : 0), false, 11);
        addParagraph(document, "Lớp hiện tại: " + (currentAssignments != null ? currentAssignments.size() : 0), false, 11);
        addParagraph(document, "Lớp đã hoàn thành: " + (pastAssignments != null ? pastAssignments.size() : 0), false, 11);
        addParagraph(document, "", false, 11); // Blank line

        // Current Assignments Table
        addParagraph(document, "III. LỚP ĐANG GIẢNG", true, 12);
        if (currentAssignments != null && !currentAssignments.isEmpty()) {
            String[] assignHeaders = {"STT", "Môn học", "Lớp", "Ngày bắt đầu", "Ngày kết thúc"};
            String[] assignKeys = {"index", "subjectName", "className", "startDate", "endDate"};
            addTable(document, assignHeaders, (List<Map<String, Object>>) currentAssignments, assignKeys);
        }
        addParagraph(document, "", false, 11); // Blank line

        // Section 4: Certifications & Exams
        addParagraph(document, "IV. CHỨNG CHỈ & KỲ THI", true, 12);
        addParagraph(document, "Tỷ lệ đạt tổng thể: " + data.get("overallPassRate") + "%", false, 11);
        addParagraph(document, "", false, 11); // Blank line

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("examHistory");
        if (exams != null && !exams.isEmpty()) {
            String[] examHeaders = {"STT", "Session", "Ngày thi", "Môn", "Điểm", "Kết quả"};
            String[] examKeys = {"index", "sessionName", "examDate", "subjectName", "score", "passed"};
            addTable(document, examHeaders, exams, examKeys);
        }
    }

    private void addGenericContent(XWPFDocument document, Map<String, Object> data) {
        addParagraph(document, "BÁO CÁO TỔNG HỢP", true, 12);
        for (Map.Entry<String, Object> entry : data.entrySet()) {
            if (!(entry.getValue() instanceof List) && !(entry.getValue() instanceof Map)) {
                addParagraph(document, entry.getKey() + ": " + entry.getValue(), false, 11);
            }
        }
    }

    // ============================================
    // HELPER METHODS
    // ============================================

    private void createSectionHeader(Sheet sheet, int rowIndex, String title) {
        Row row = sheet.createRow(rowIndex);
        Cell cell = row.createCell(0);
        cell.setCellValue(title);
        
        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        cell.setCellStyle(headerStyle);
    }

    private int createInfoRow(Sheet sheet, int rowIndex, String label, Object value) {
        Row row = sheet.createRow(rowIndex);
        row.createCell(0).setCellValue(label);
        row.createCell(1).setCellValue(value != null ? value.toString() : "N/A");
        return rowIndex + 1;
    }

    private int createTableHeader(Sheet sheet, int rowIndex, String[] headers) {
        Row headerRow = sheet.createRow(rowIndex);

        CellStyle headerStyle = sheet.getWorkbook().createCellStyle();
        Font headerFont = sheet.getWorkbook().createFont();
        headerFont.setBold(true);
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        return rowIndex + 1;
    }

    private CellStyle createDataCellStyle(Workbook workbook) {
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);
        return dataStyle;
    }

    private void addParagraph(XWPFDocument document, String text, boolean bold, int fontSize) {
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText(text);
        run.setBold(bold);
        run.setFontSize(fontSize);
    }

    private void addTable(XWPFDocument document, String[] headers, List<Map<String, Object>> data, String[] fieldKeys) {
        XWPFTable table = document.createTable();
        table.setWidth("100%");

        // Add header row
        XWPFTableRow headerRow = table.getRow(0);
        for (int i = 0; i < headers.length; i++) {
            XWPFTableCell cell = headerRow.getCell(i);
            if (cell == null) {
                cell = headerRow.createCell();
            }
            cell.setText(headers[i]);
            XWPFParagraph para = cell.getParagraphs().get(0);
            XWPFRun run = para.getRuns().get(0);
            run.setBold(true);
        }

        // Add data rows
        if (data != null) {
            int rowIndex = 1; // Start numbering from 1
            for (Map<String, Object> rowData : data) {
                XWPFTableRow row = table.createRow();
                for (int i = 0; i < fieldKeys.length; i++) {
                    String key = fieldKeys[i];
                    Object value = rowData.get(key);
                    String textValue;
                    if (key.equals("index")) {
                        textValue = String.valueOf(rowIndex);
                    } else {
                        textValue = value != null ? value.toString() : "N/A";
                        if (key.equals("registeredDate") || key.equals("examDate") || key.equals("teachingDate") ||
                            key.equals("startDate") || key.equals("endDate")) {
                            textValue = formatDate(value);
                        }
                    }
                    row.getCell(i).setText(textValue);
                }
                rowIndex++;
            }
        }
    }

    private String getReportTitle(String reportType, Map<String, Object> data) {
        switch (reportType) {
            case "TEACHER_PERFORMANCE":
                return "BÁO CÁO HIỆU SUẤT GIÁO VIÊN";
            case "SUBJECT_ANALYSIS":
                return "BÁO CÁO PHÂN TÍCH MÔN HỌC";
            case "PERSONAL_SUMMARY":
                return "BÁO CÁO CÁ NHÂN";
            case "QUARTER":
            case "YEAR":
            case "APTECH":
            case "TRIAL":
            default:
                return "BÁO CÁO TỔNG HỢP";
        }
    }

    private String formatDate(Object date) {
        if (date == null) return "N/A";

        if (date instanceof LocalDate) {
            return ((LocalDate) date).format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        } else if (date instanceof LocalDateTime) {
            return ((LocalDateTime) date).format(DateTimeFormatter.ofPattern("dd/MM/yyyy"));
        }

        return date.toString();
    }

    private String getPeriodText(Map<String, Object> data) {
        StringBuilder period = new StringBuilder("Năm: ");
        period.append(data.get("year") != null ? data.get("year").toString() : "");
        if (data.get("quarter") != null) {
            period.append(" | Quý: Q").append(data.get("quarter"));
        }
        return period.toString();
    }
}
