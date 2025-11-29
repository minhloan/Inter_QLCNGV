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
                case "APTECH_DETAIL":
                    populateAptechDetails(sheet, data);
                    break;
                case "TRIAL_DETAIL":
                    populateTrialDetails(sheet, data);
                    break;
                case "PERSONAL_SUMMARY":
                    populatePersonalSummary(sheet, data);
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
                case "APTECH_DETAIL":
                    addAptechDetailsContent(document, data);
                    break;
                case "TRIAL_DETAIL":
                    addTrialDetailsContent(document, data);
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
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue((String) subject.get("code"));
                row.createCell(2).setCellValue((String) subject.get("name"));
                row.createCell(3).setCellValue((String) subject.get("system"));
                row.createCell(4).setCellValue(formatDate(subject.get("registeredDate")));
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
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue((String) exam.get("sessionName"));
                row.createCell(2).setCellValue(formatDate(exam.get("examDate")));
                row.createCell(3).setCellValue((String) exam.get("subjectName"));
                row.createCell(4).setCellValue(exam.get("score") != null ? exam.get("score").toString() : "N/A");
                row.createCell(5).setCellValue((Boolean) exam.get("passed") ? "Đạt" : "Không đạt");
            }
        }
    }

    private void populateSubjectAnalysis(Sheet sheet, Map<String, Object> data) {
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
        currentRow = createInfoRow(sheet, currentRow, "Đủ GV:", (Boolean) data.get("hasEnoughTeachers") ? "Có" : "Không");
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
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue((String) teacher.get("teacherId"));
                row.createCell(2).setCellValue((String) teacher.get("teacherName"));
                row.createCell(3).setCellValue((String) teacher.get("qualification"));
                row.createCell(4).setCellValue(formatDate(teacher.get("registeredDate")));
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
                row.createCell(1).setCellValue((String) exam.get("teacherId"));
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
                row.createCell(1).setCellValue((String) trial.get("teacherId"));
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
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue((String) assign.get("subjectName"));
                row.createCell(2).setCellValue((String) assign.get("className"));
                row.createCell(3).setCellValue(formatDate(assign.get("startDate")));
                row.createCell(4).setCellValue(formatDate(assign.get("endDate")));
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
                row.createCell(0).setCellValue(i + 1);
                row.createCell(1).setCellValue((String) exam.get("sessionName"));
                row.createCell(2).setCellValue(formatDate(exam.get("examDate")));
                row.createCell(3).setCellValue((String) exam.get("subjectName"));
                row.createCell(4).setCellValue(exam.get("score") != null ? exam.get("score").toString() : "N/A");
                row.createCell(5).setCellValue(exam.get("passed") != null && (Boolean) exam.get("passed") ? "Đạt" : "Chưa có KQ");
            }
        }
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
        addParagraph(document, "", false, 11); // Blank line
        
        addParagraph(document, "II. TỔNG QUAN", true, 12);
        addParagraph(document, "Môn đã đăng ký: " + data.get("totalSubjectsRegistered"), false, 11);
        addParagraph(document, "Lớp đã phân công: " + data.get("totalAssignments"), false, 11);
        addParagraph(document, "Kỳ thi Aptech: " + data.get("totalExams"), false, 11);
        addParagraph(document, "Tỷ lệ đạt: " + data.get("passRate") + "%", false, 11);
        // Add more content as needed...
    }

    private void addSubjectAnalysisContent(XWPFDocument document, Map<String, Object> data) {
        addParagraph(document, "I. THÔNG TIN MÔN HỌC", true, 12);
        addParagraph(document, "Mã môn: " + data.get("subjectCode"), false, 11);
        addParagraph(document, "Tên môn: " + data.get("subjectName"), false, 11);
        addParagraph(document, "System: " + data.get("systemName"), false, 11);
        // Add more content...
    }

    private void addAptechDetailsContent(XWPFDocument document, Map<String, Object> data) {
        addParagraph(document, "DANH SÁCH KỲ THI APTECH CHI TIẾT", true, 12);
        // Add table with exam details...
    }

    private void addTrialDetailsContent(XWPFDocument document, Map<String, Object> data) {
        addParagraph(document, "DANH SÁCH GIẢNG THỬ CHI TIẾT", true, 12);
        // Add table with trial details...
    }

    private void addPersonalSummaryContent(XWPFDocument document, Map<String, Object> data) {
        addParagraph(document, "I. THÔNG TIN CÁ NHÂN", true, 12);
        @SuppressWarnings("unchecked")
        Map<String, Object> profile = (Map<String, Object>) data.get("profile");
        addParagraph(document, "Họ tên: " + profile.get("fullName"), false, 11);
        // Add more content...
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

    private void addParagraph(XWPFDocument document, String text, boolean bold, int fontSize) {
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText(text);
        run.setBold(bold);
        run.setFontSize(fontSize);
    }

    private String getReportTitle(String reportType, Map<String, Object> data) {
        switch (reportType) {
            case "TEACHER_PERFORMANCE":
                return "BÁO CÁO HIỆU SUẤT GIÁO VIÊN";
            case "SUBJECT_ANALYSIS":
                return "BÁO CÁO PHÂN TÍCH MÔN HỌC";
            case "APTECH_DETAIL":
                return "BÁO CÁO CHI TIẾT KỲ THI APTECH";
            case "TRIAL_DETAIL":
                return "BÁO CÁO CHI TIẾT GIẢNG THỬ";
            case "PERSONAL_SUMMARY":
                return "BÁO CÁO CÁ NHÂN";
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
}
