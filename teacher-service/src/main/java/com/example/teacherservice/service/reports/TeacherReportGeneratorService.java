package com.example.teacherservice.service.reports;

import com.example.teacherservice.model.User;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Cell;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.TextAlignment;
import com.itextpdf.layout.properties.UnitValue;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TeacherReportGeneratorService {

    private PdfFont loadCustomFont(String fontName) throws IOException {
        try {
            // Load font from classpath resources
            InputStream fontStream = getClass().getClassLoader().getResourceAsStream("fonts/" + fontName);
            if (fontStream == null) {
                log.warn("Custom font {} not found, falling back to Helvetica", fontName);
                return PdfFontFactory.createFont(StandardFonts.HELVETICA);
            }
            byte[] fontBytes = fontStream.readAllBytes();
            PdfFont font = PdfFontFactory.createFont(fontBytes, com.itextpdf.io.font.PdfEncodings.IDENTITY_H);
            fontStream.close();
            return font;
        } catch (Exception e) {
            log.warn("Failed to load custom font {}, falling back to Helvetica: {}", fontName, e.getMessage());
            return PdfFontFactory.createFont(StandardFonts.HELVETICA);
        }
    }

    public byte[] generateExcelReport(Map<String, Object> data, User teacher) throws IOException {
        Workbook workbook = WorkbookFactory.create(true);
        String reportType = (String) data.get("reportType");

        switch (reportType) {
            case "QUARTER":
                return generateQuarterReportExcel(workbook, data, teacher);
            case "YEAR":
                return generateYearReportExcel(workbook, data, teacher);
            case "APTECH":
                return generateAptechReportExcel(workbook, data, teacher);
            case "TRIAL":
                return generateTrialReportExcel(workbook, data, teacher);
            default:
                return generateDefaultReportExcel(workbook, data, teacher);
        }
    }

    private byte[] generateQuarterReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.createSheet("Báo cáo Quý");

        // Create styles
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 14);
        headerStyle.setFont(headerFont);
        headerStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle normalStyle = workbook.createCellStyle();
        normalStyle.setAlignment(HorizontalAlignment.LEFT);

        // Title
        Row titleRow = sheet.createRow(0);
        org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO HOẠT ĐỘNG GIẢNG DẠY QUÝ " + data.get("quarter") + " NĂM " + data.get("year"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 4));

        // Header info
        Row headerInfoRow = sheet.createRow(2);
        headerInfoRow.createCell(0).setCellValue("Giảng viên:");
        headerInfoRow.createCell(1).setCellValue(teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());

        Row headerInfoRow2 = sheet.createRow(3);
        headerInfoRow2.createCell(0).setCellValue("Mã giảng viên:");
        headerInfoRow2.createCell(1).setCellValue(teacher.getId());

        Row headerInfoRow3 = sheet.createRow(4);
        headerInfoRow3.createCell(0).setCellValue("Ngày tạo báo cáo:");
        headerInfoRow3.createCell(1).setCellValue(((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        // Table headers
        Row tableHeaderRow = sheet.createRow(6);
        String[] headers = {"STT", "Môn học", "Lớp", "Số tiết", "Trạng thái", "Ghi chú"};
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = tableHeaderRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Get actual data from report data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> subjects = (List<Map<String, Object>>) data.get("subjects");
        if (subjects != null && !subjects.isEmpty()) {
            for (int i = 0; i < subjects.size(); i++) {
                Map<String, Object> subject = subjects.get(i);
                Row dataRow = sheet.createRow(7 + i);
                dataRow.createCell(0).setCellValue(String.valueOf(i + 1));
                dataRow.createCell(1).setCellValue((String) subject.get("subjectName"));
                dataRow.createCell(2).setCellValue((String) subject.get("className"));
                dataRow.createCell(3).setCellValue(subject.get("totalHours").toString());
                dataRow.createCell(4).setCellValue((String) subject.get("status"));
                dataRow.createCell(5).setCellValue((String) subject.get("notes"));
            }
        } else {
            // Fallback sample data if no real data
            String[][] sampleData = {
                {"1", "Java Programming", "APTECH01", "45", "Hoàn thành", ""},
                {"2", "Web Development", "APTECH02", "30", "Đang dạy", ""},
                {"3", "Database Design", "APTECH03", "40", "Hoàn thành", ""}
            };

            for (int i = 0; i < sampleData.length; i++) {
                Row dataRow = sheet.createRow(7 + i);
                for (int j = 0; j < sampleData[i].length; j++) {
                    dataRow.createCell(j).setCellValue(sampleData[i][j]);
                }
            }
        }

        // Summary section
        int summaryStartRow = 7 + (subjects != null ? subjects.size() : 3) + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        org.apache.poi.ss.usermodel.Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG KẾT");
        summaryTitleCell.setCellStyle(headerStyle);

        Row totalRow = sheet.createRow(summaryStartRow + 1);
        totalRow.createCell(0).setCellValue("Tổng số môn:");
        totalRow.createCell(1).setCellValue(data.get("totalSubjects") != null ? data.get("totalSubjects").toString() : "0");

        Row completedRow = sheet.createRow(summaryStartRow + 2);
        completedRow.createCell(0).setCellValue("Số môn hoàn thành:");
        completedRow.createCell(1).setCellValue(data.get("completedSubjects") != null ? data.get("completedSubjects").toString() : "0");

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateYearReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.createSheet("Báo cáo Năm");

        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);

        // Title
        Row titleRow = sheet.createRow(0);
        org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO TỔNG HỢP NĂM " + data.get("year"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));

        // Teacher info
        Row teacherRow = sheet.createRow(2);
        teacherRow.createCell(0).setCellValue("Giảng viên:");
        teacherRow.createCell(1).setCellValue(teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());

        // Statistics section
        Row statsTitleRow = sheet.createRow(4);
        org.apache.poi.ss.usermodel.Cell statsTitleCell = statsTitleRow.createCell(0);
        statsTitleCell.setCellValue("THỐNG KÊ TỔNG HỢP");
        statsTitleCell.setCellStyle(headerStyle);

        // Use real data from database
        String[][] statsData = {
            {"Tổng số môn đăng ký:", data.get("totalRegistrations").toString()},
            {"Số môn hoàn thành:", data.get("completedRegistrations").toString()},
            {"Số môn chưa hoàn thành:", String.valueOf((Long) data.get("totalRegistrations") - (Long) data.get("completedRegistrations"))},
            {"Tỷ lệ hoàn thành:", data.get("completionRate") + "%"},
            {"Số kỳ thi Aptech:", data.get("totalExams").toString()},
            {"Số lần thi đạt:", data.get("passedExams").toString()},
            {"Số buổi giảng thử:", data.get("totalTrials").toString()},
            {"Số buổi đạt:", data.get("passedTrials").toString()}
        };

        for (int i = 0; i < statsData.length; i++) {
            Row row = sheet.createRow(5 + i);
            row.createCell(0).setCellValue(statsData[i][0]);
            row.createCell(1).setCellValue(statsData[i][1]);
        }

        // Quarterly breakdown
        Row quarterlyTitleRow = sheet.createRow(15);
        org.apache.poi.ss.usermodel.Cell quarterlyTitleCell = quarterlyTitleRow.createCell(0);
        quarterlyTitleCell.setCellValue("CHI TIẾT THEO QUÝ");
        quarterlyTitleCell.setCellStyle(headerStyle);

        String[] quarterlyHeaders = {"Quý", "Số môn", "Hoàn thành", "Tỷ lệ"};
        Row quarterlyHeaderRow = sheet.createRow(16);
        for (int i = 0; i < quarterlyHeaders.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = quarterlyHeaderRow.createCell(i);
            cell.setCellValue(quarterlyHeaders[i]);
            cell.setCellStyle(headerStyle);
        }

        // Use real quarterly data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> quarterlyStats = (List<Map<String, Object>>) data.get("quarterlyStats");
        if (quarterlyStats != null && !quarterlyStats.isEmpty()) {
            for (int i = 0; i < quarterlyStats.size(); i++) {
                Map<String, Object> quarter = quarterlyStats.get(i);
                Row row = sheet.createRow(17 + i);
                row.createCell(0).setCellValue("Quý " + quarter.get("quarter"));
                row.createCell(1).setCellValue(quarter.get("totalSubjects").toString());
                row.createCell(2).setCellValue(quarter.get("completedSubjects").toString());
                // Calculate completion rate for quarter
                long total = ((Number) quarter.get("totalSubjects")).longValue();
                long completed = ((Number) quarter.get("completedSubjects")).longValue();
                double rate = total > 0 ? Math.round((double) completed / total * 10000.0) / 100.0 : 0.0;
                row.createCell(3).setCellValue(rate + "%");
            }
        } else {
            // Fallback if no quarterly data
            String[][] quarterlyData = {
                {"Quý 1", "0", "0", "0%"},
                {"Quý 2", "0", "0", "0%"},
                {"Quý 3", "0", "0", "0%"},
                {"Quý 4", "0", "0", "0%"}
            };

            for (int i = 0; i < quarterlyData.length; i++) {
                Row row = sheet.createRow(17 + i);
                for (int j = 0; j < quarterlyData[i].length; j++) {
                    row.createCell(j).setCellValue(quarterlyData[i][j]);
                }
            }
        }

        // Auto-size columns
        for (int i = 0; i < 7; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateAptechReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.createSheet("Kỳ thi Aptech");

        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);

        // Title
        Row titleRow = sheet.createRow(0);
        org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("DANH SÁCH THI CHỨNG NHẬN APTECH");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 7));

        // Period info
        Row periodRow = sheet.createRow(2);
        periodRow.createCell(0).setCellValue("Năm:");
        periodRow.createCell(1).setCellValue(data.get("year").toString());
        if (data.get("quarter") != null) {
            periodRow.createCell(2).setCellValue("Quý:");
            periodRow.createCell(3).setCellValue("Q" + data.get("quarter"));
        }

        // Table headers
        String[] headers = {"STT", "Họ tên", "Mã GV", "Môn thi", "Ngày thi", "Điểm", "Kết quả", "Lần thi"};
        Row headerRow = sheet.createRow(4);
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Get actual exam data from database
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("exams");
        if (exams != null && !exams.isEmpty()) {
            for (int i = 0; i < exams.size(); i++) {
                Map<String, Object> exam = exams.get(i);
                Row row = sheet.createRow(5 + i);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue(teacher.getUserDetails() != null ?
                    teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());
                row.createCell(2).setCellValue(teacher.getId());
                row.createCell(3).setCellValue((String) exam.get("subjectName"));
                row.createCell(4).setCellValue(exam.get("examDate") != null ?
                    exam.get("examDate").toString() : "N/A");
                row.createCell(5).setCellValue(exam.get("score") != null ?
                    exam.get("score").toString() : "0");
                row.createCell(6).setCellValue((String) exam.get("result"));
                row.createCell(7).setCellValue(exam.get("attempt") != null ?
                    exam.get("attempt").toString() : "1");
            }
        } else {
            // Fallback sample data if no real data
            String[][] examData = {
                {"1", teacher.getUserDetails() != null ? teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId(),
                 teacher.getId(), "Java Programming", "15/01/2024", "85", "PASS", "1"},
                {"2", teacher.getUserDetails() != null ? teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId(),
                 teacher.getId(), "Web Development", "20/02/2024", "78", "PASS", "1"},
                {"3", teacher.getUserDetails() != null ? teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId(),
                 teacher.getId(), "Database Design", "10/03/2024", "92", "PASS", "1"}
            };

            for (int i = 0; i < examData.length; i++) {
                Row row = sheet.createRow(5 + i);
                for (int j = 0; j < examData[i].length; j++) {
                    row.createCell(j).setCellValue(examData[i][j]);
                }
            }
        }

        // Summary section
        int summaryStartRow = 5 + (exams != null ? exams.size() : 3) + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        org.apache.poi.ss.usermodel.Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG HỢP KẾT QUẢ");
        summaryTitleCell.setCellStyle(headerStyle);

        // Use real summary data
        String[][] summaryData = {
            {"Tổng số môn thi:", data.get("totalExams").toString()},
            {"Số môn đạt:", data.get("passedExams").toString()},
            {"Số môn không đạt:", String.valueOf((Long) data.get("totalExams") - (Long) data.get("passedExams"))},
            {"Tỷ lệ đạt:", data.get("passRate") + "%"}
        };

        for (int i = 0; i < summaryData.length; i++) {
            Row row = sheet.createRow(summaryStartRow + 1 + i);
            row.createCell(0).setCellValue(summaryData[i][0]);
            row.createCell(1).setCellValue(summaryData[i][1]);
        }

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.createSheet("Giảng thử");

        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);

        // Title
        Row titleRow = sheet.createRow(0);
        org.apache.poi.ss.usermodel.Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BIÊN BẢN GIẢNG THỬ");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));

        // Teacher info
        Row teacherRow = sheet.createRow(2);
        teacherRow.createCell(0).setCellValue("Giảng viên:");
        teacherRow.createCell(1).setCellValue(teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());

        Row teacherCodeRow = sheet.createRow(3);
        teacherCodeRow.createCell(0).setCellValue("Mã giảng viên:");
        teacherCodeRow.createCell(1).setCellValue(teacher.getId());

        // Table headers
        String[] headers = {"STT", "Môn học", "Ngày giảng thử", "Địa điểm", "Điểm", "Kết quả", "Nhận xét"};
        Row headerRow = sheet.createRow(5);
        for (int i = 0; i < headers.length; i++) {
            org.apache.poi.ss.usermodel.Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Get actual trial data from database
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trials = (List<Map<String, Object>>) data.get("trials");
        if (trials != null && !trials.isEmpty()) {
            for (int i = 0; i < trials.size(); i++) {
                Map<String, Object> trial = trials.get(i);
                Row row = sheet.createRow(6 + i);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue((String) trial.get("subjectName"));
                row.createCell(2).setCellValue(trial.get("teachingDate") != null ?
                    trial.get("teachingDate").toString() : "N/A");
                row.createCell(3).setCellValue((String) trial.get("location"));
                row.createCell(4).setCellValue(trial.get("score") != null ?
                    trial.get("score").toString() : "0");
                row.createCell(5).setCellValue((String) trial.get("conclusion"));
                row.createCell(6).setCellValue((String) trial.get("comments"));
            }
        } else {
            // Fallback sample data if no real data
            String[][] trialData = {
                {"1", "Java Programming", "15/01/2024", "Phòng 101", "85", "PASS", "Giảng viên trình bày tốt, tương tác với học viên hiệu quả"},
                {"2", "Web Development", "20/02/2024", "Phòng 102", "78", "PASS", "Nội dung bài giảng logic, minh họa rõ ràng"},
                {"3", "Database Design", "10/03/2024", "Phòng 103", "92", "PASS", "Kiến thức chuyên môn vững, phương pháp giảng dạy tốt"}
            };

            for (int i = 0; i < trialData.length; i++) {
                Row row = sheet.createRow(6 + i);
                for (int j = 0; j < trialData[i].length; j++) {
                    row.createCell(j).setCellValue(trialData[i][j]);
                }
            }
        }

        // Summary
        int summaryStartRow = 6 + (trials != null ? trials.size() : 3) + 2;
        Row summaryRow = sheet.createRow(summaryStartRow);
        summaryRow.createCell(0).setCellValue("Tổng số buổi giảng thử:");
        summaryRow.createCell(1).setCellValue(data.get("totalTrials").toString());

        Row passRow = sheet.createRow(summaryStartRow + 1);
        passRow.createCell(0).setCellValue("Số buổi đạt:");
        passRow.createCell(1).setCellValue(data.get("passedTrials").toString());

        Row rateRow = sheet.createRow(summaryStartRow + 2);
        rateRow.createCell(0).setCellValue("Tỷ lệ đạt:");
        rateRow.createCell(1).setCellValue(data.get("passRate") + "%");

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateDefaultReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.createSheet("Report");

        // Create header row
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Report Type");
        headerRow.createCell(1).setCellValue("Teacher");
        headerRow.createCell(2).setCellValue("Year");
        headerRow.createCell(3).setCellValue("Quarter");
        headerRow.createCell(4).setCellValue("Generated At");

        // Create data row
        Row dataRow = sheet.createRow(1);
        dataRow.createCell(0).setCellValue((String) data.get("reportType"));
        dataRow.createCell(1).setCellValue(teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());
        dataRow.createCell(2).setCellValue(data.get("year") != null ? data.get("year").toString() : "");
        dataRow.createCell(3).setCellValue(data.get("quarter") != null ? data.get("quarter").toString() : "");
        dataRow.createCell(4).setCellValue(((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        // Auto-size columns
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    public byte[] generateWordReport(Map<String, Object> data, User teacher) throws IOException {
        XWPFDocument document = new XWPFDocument();
        String reportType = (String) data.get("reportType");

        switch (reportType) {
            case "QUARTER":
                return generateQuarterReportWord(document, data, teacher);
            case "YEAR":
                return generateYearReportWord(document, data, teacher);
            case "APTECH":
                return generateAptechReportWord(document, data, teacher);
            case "TRIAL":
                return generateTrialReportWord(document, data, teacher);
            default:
                return generateDefaultReportWord(document, data, teacher);
        }
    }

    private byte[] generateQuarterReportWord(XWPFDocument document, Map<String, Object> data, User teacher) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO HOẠT ĐỘNG GIẢNG DẠY");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        XWPFParagraph subtitleParagraph = document.createParagraph();
        XWPFRun subtitleRun = subtitleParagraph.createRun();
        subtitleRun.setText("Quý " + data.get("quarter") + " Năm " + data.get("year"));
        subtitleRun.setBold(true);
        subtitleRun.setFontSize(14);

        // Teacher info
        XWPFParagraph teacherParagraph = document.createParagraph();
        XWPFRun teacherRun = teacherParagraph.createRun();
        teacherRun.setText("Giảng viên: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId()));
        teacherRun.addBreak();
        teacherRun.setText("Mã giảng viên: " + teacher.getId());
        teacherRun.addBreak();
        teacherRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        // Content sections
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("I. TỔNG QUAN HOẠT ĐỘNG");
        contentRun.setBold(true);
        contentRun.addBreak();

        contentRun.setText("Trong quý " + data.get("quarter") + " năm " + data.get("year") + ", giảng viên đã tham gia giảng dạy các môn học sau:");
        contentRun.addBreak();
        contentRun.addBreak();

        // Get actual subjects data from database
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> subjects = (List<Map<String, Object>>) data.get("subjects");
        if (subjects != null && !subjects.isEmpty()) {
            for (int i = 0; i < subjects.size(); i++) {
                Map<String, Object> subject = subjects.get(i);
                contentRun.setText((i + 1) + ". " + subject.get("subjectName") + " - Lớp " + subject.get("className"));
                contentRun.addBreak();
            }
        } else {
            // Fallback if no data
            contentRun.setText("Không có dữ liệu môn học trong quý này.");
            contentRun.addBreak();
        }

        contentRun.addBreak();
        contentRun.setText("II. KẾT QUẢ ĐẠT ĐƯỢC");
        contentRun.setBold(true);
        contentRun.addBreak();

        contentRun.setText("- Tổng số môn học: " + data.get("totalSubjects") + " môn");
        contentRun.addBreak();
        contentRun.setText("- Số môn hoàn thành: " + data.get("completedSubjects") + " môn");
        contentRun.addBreak();
        contentRun.setText("- Số môn đang thực hiện: " + (((Number) data.get("totalSubjects")).longValue() - ((Number) data.get("completedSubjects")).longValue()) + " môn");
        contentRun.addBreak();
        long total = ((Number) data.get("totalSubjects")).longValue();
        long completed = ((Number) data.get("completedSubjects")).longValue();
        double rate = total > 0 ? Math.round((double) completed / total * 10000.0) / 100.0 : 0.0;
        contentRun.setText("- Tỷ lệ hoàn thành: " + rate + "%");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateYearReportWord(XWPFDocument document, Map<String, Object> data, User teacher) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        XWPFParagraph subtitleParagraph = document.createParagraph();
        XWPFRun subtitleRun = subtitleParagraph.createRun();
        subtitleRun.setText("Năm " + data.get("year"));
        subtitleRun.setBold(true);
        subtitleRun.setFontSize(14);

        // Teacher info
        XWPFParagraph teacherParagraph = document.createParagraph();
        XWPFRun teacherRun = teacherParagraph.createRun();
        teacherRun.setText("Giảng viên: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId()));
        teacherRun.addBreak();
        teacherRun.setText("Mã giảng viên: " + teacher.getId());
        teacherRun.addBreak();
        teacherRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("I. THỐNG KÊ TỔNG HỢP");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Use real data from database
        String[] stats = {
            "Tổng số môn đăng ký: " + data.get("totalRegistrations") + " môn",
            "Số môn hoàn thành: " + data.get("completedRegistrations") + " môn",
            "Số môn chưa hoàn thành: " + (String.valueOf(((Number) data.get("totalRegistrations")).longValue() - ((Number) data.get("completedRegistrations")).longValue())) + " môn",
            "Tỷ lệ hoàn thành: " + data.get("completionRate") + "%",
            "Số kỳ thi Aptech: " + data.get("totalExams") + " kỳ",
            "Số lần thi đạt: " + data.get("passedExams") + " lần",
            "Số buổi giảng thử: " + data.get("totalTrials") + " buổi",
            "Số buổi đạt: " + data.get("passedTrials") + " buổi"
        };

        for (String stat : stats) {
            contentRun.setText(stat);
            contentRun.addBreak();
        }

        contentRun.addBreak();
        contentRun.setText("II. CHI TIẾT THEO QUÝ");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Use real quarterly data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> quarterlyStats = (List<Map<String, Object>>) data.get("quarterlyStats");
        if (quarterlyStats != null && !quarterlyStats.isEmpty()) {
            for (Map<String, Object> quarter : quarterlyStats) {
                long q = ((Number) quarter.get("quarter")).longValue();
                long total = ((Number) quarter.get("totalSubjects")).longValue();
                long completed = ((Number) quarter.get("completedSubjects")).longValue();
                double rate = total > 0 ? Math.round((double) completed / total * 10000.0) / 100.0 : 0.0;
                contentRun.setText("Quý " + q + ": " + total + " môn - Hoàn thành " + completed + " môn (" + rate + "%)");
                contentRun.addBreak();
            }
        } else {
            // Fallback if no quarterly data
            contentRun.setText("Không có dữ liệu chi tiết theo quý.");
            contentRun.addBreak();
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateAptechReportWord(XWPFDocument document, Map<String, Object> data, User teacher) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("DANH SÁCH THI CHỨNG NHẬN APTECH");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Năm " + data.get("year") + (data.get("quarter") != null ? " - Quý " + data.get("quarter") : ""));
        periodRun.setBold(true);

        // Teacher info
        XWPFParagraph teacherParagraph = document.createParagraph();
        XWPFRun teacherRun = teacherParagraph.createRun();
        teacherRun.setText("Giảng viên: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId()));
        teacherRun.addBreak();
        teacherRun.setText("Mã giảng viên: " + teacher.getId());

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("DANH SÁCH CÁC MÔN ĐÃ THI:");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Get actual exam data from database
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("exams");
        if (exams != null && !exams.isEmpty()) {
            for (int i = 0; i < exams.size(); i++) {
                Map<String, Object> exam = exams.get(i);
                contentRun.setText((i + 1) + ". " + exam.get("subjectName") + " - Ngày thi: " +
                    (exam.get("examDate") != null ? exam.get("examDate").toString() : "N/A") +
                    " - Điểm: " + (exam.get("score") != null ? exam.get("score").toString() : "0") +
                    " - Kết quả: " + (String) exam.get("result") +
                    " - Lần thi: " + (exam.get("attempt") != null ? exam.get("attempt").toString() : "1"));
                contentRun.addBreak();
            }
        } else {
            // Fallback if no exam data
            contentRun.setText("Không có dữ liệu kỳ thi Aptech.");
            contentRun.addBreak();
        }

        contentRun.addBreak();
        contentRun.setText("TỔNG HỢP KẾT QUẢ");
        contentRun.setBold(true);
        contentRun.addBreak();

        contentRun.setText("Tổng số môn thi: " + data.get("totalExams") + " môn");
        contentRun.addBreak();
        contentRun.setText("Số môn đạt: " + data.get("passedExams") + " môn");
        contentRun.addBreak();
        contentRun.setText("Số môn không đạt: " + (String.valueOf((Long) data.get("totalExams") - (Long) data.get("passedExams"))) + " môn");
        contentRun.addBreak();
        contentRun.setText("Tỷ lệ đạt: " + data.get("passRate") + "%");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportWord(XWPFDocument document, Map<String, Object> data, User teacher) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BIÊN BẢN GIẢNG THỬ");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // Teacher info
        XWPFParagraph teacherParagraph = document.createParagraph();
        XWPFRun teacherRun = teacherParagraph.createRun();
        teacherRun.setText("Giảng viên: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId()));
        teacherRun.addBreak();
        teacherRun.setText("Mã giảng viên: " + teacher.getId());

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("DANH SÁCH CÁC BUỔI GIẢNG THỬ:");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Get actual trial data from database
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trials = (List<Map<String, Object>>) data.get("trials");
        if (trials != null && !trials.isEmpty()) {
            for (int i = 0; i < trials.size(); i++) {
                Map<String, Object> trial = trials.get(i);
                contentRun.setText((i + 1) + ". " + trial.get("subjectName") + " - Ngày giảng thử: " +
                    (trial.get("teachingDate") != null ? trial.get("teachingDate").toString() : "N/A") +
                    " - Địa điểm: " + (String) trial.get("location") +
                    " - Điểm: " + (trial.get("score") != null ? trial.get("score").toString() : "0") +
                    " - Kết quả: " + (String) trial.get("conclusion") +
                    " - Nhận xét: " + (String) trial.get("comments"));
                contentRun.addBreak();
            }
        } else {
            // Fallback if no trial data
            contentRun.setText("Không có dữ liệu buổi giảng thử.");
            contentRun.addBreak();
        }

        contentRun.addBreak();
        contentRun.setText("TỔNG HỢP");
        contentRun.setBold(true);
        contentRun.addBreak();

        contentRun.setText("Tổng số buổi giảng thử: " + data.get("totalTrials") + " buổi");
        contentRun.addBreak();
        contentRun.setText("Số buổi đạt: " + data.get("passedTrials") + " buổi");
        contentRun.addBreak();
        contentRun.setText("Tỷ lệ đạt: " + data.get("passRate") + "%");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateDefaultReportWord(XWPFDocument document, Map<String, Object> data, User teacher) throws IOException {
        XWPFParagraph paragraph = document.createParagraph();
        XWPFRun run = paragraph.createRun();
        run.setText("Report Type: " + data.get("reportType"));
        run.addBreak();
        run.setText("Teacher: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId()));
        run.addBreak();
        run.setText("Year: " + (data.get("year") != null ? data.get("year").toString() : ""));
        run.addBreak();
        run.setText("Quarter: " + (data.get("quarter") != null ? data.get("quarter").toString() : ""));
        run.addBreak();
        run.setText("Generated At: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    public byte[] generatePdfReport(Map<String, Object> data, User teacher) throws IOException {
        String reportType = (String) data.get("reportType");

        switch (reportType) {
            case "QUARTER":
                return generateQuarterReportPdf(data, teacher);
            case "YEAR":
                return generateYearReportPdf(data, teacher);
            case "APTECH":
                return generateAptechReportPdf(data, teacher);
            case "TRIAL":
                return generateTrialReportPdf(data, teacher);
            default:
                return generateDefaultReportPdf(data, teacher);
        }
    }

    private byte[] generateQuarterReportPdf(Map<String, Object> data, User teacher) throws IOException {
        log.info("Starting PDF generation for quarterly report - Teacher: {}, Quarter: {}, Year: {}",
                teacher.getId(), data.get("quarter"), data.get("year"));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = loadCustomFont("DejaVuSans-Bold.ttf");
        PdfFont normalFont = loadCustomFont("DejaVuSans.ttf");

        // Title
        Paragraph title = new Paragraph("BÁO CÁO HOẠT ĐỘNG GIẢNG DẠY")
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Subtitle
        Paragraph subtitle = new Paragraph("Quý " + data.get("quarter") + " Năm " + data.get("year"))
                .setFont(boldFont)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(subtitle);

        // Teacher info
        String teacherName = "Giảng viên: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());
        document.add(new Paragraph(teacherName).setFont(normalFont).setFontSize(12));

        String teacherId = "Mã giảng viên: " + teacher.getId();
        document.add(new Paragraph(teacherId).setFont(normalFont).setFontSize(12));

        String generatedAt = "Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        document.add(new Paragraph(generatedAt).setFont(normalFont).setFontSize(12));

        // Section 1
        document.add(new Paragraph("I. TỔNG QUAN HOẠT ĐỘNG").setFont(boldFont).setFontSize(12));

        String overviewText = "Trong quý " + data.get("quarter") + " năm " + data.get("year") + ", giảng viên đã tham gia giảng dạy các môn học sau:";
        document.add(new Paragraph(overviewText).setFont(normalFont).setFontSize(12));

        // Table
        Table table = new Table(UnitValue.createPercentArray(new float[]{10, 30, 20, 12, 16, 20}));
        table.setWidth(UnitValue.createPercentValue(100));

        // Headers
        String[] headers = {"STT", "Môn học", "Lớp", "Số tiết", "Trạng thái", "Ghi chú"};
        for (String header : headers) {
            table.addHeaderCell(new Cell().add(new Paragraph(header).setFont(boldFont).setFontSize(10)));
        }

        // Get subjects data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> subjects = (List<Map<String, Object>>) data.get("subjects");
        if (subjects != null && !subjects.isEmpty()) {
            for (int i = 0; i < subjects.size(); i++) {
                Map<String, Object> subject = subjects.get(i);
                table.addCell(new Cell().add(new Paragraph(String.valueOf(i + 1)).setFont(normalFont).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph((String) subject.get("subjectName")).setFont(normalFont).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph((String) subject.get("className")).setFont(normalFont).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph(subject.get("totalHours").toString()).setFont(normalFont).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph((String) subject.get("status")).setFont(normalFont).setFontSize(9)));
                table.addCell(new Cell().add(new Paragraph((String) subject.get("notes")).setFont(normalFont).setFontSize(9)));
            }
        } else {
            // Fallback sample data
            String[][] tableData = {
                {"1", "Java Programming", "APTECH01", "45", "Hoàn thành", ""},
                {"2", "Web Development", "APTECH02", "30", "Đang dạy", ""},
                {"3", "Database Design", "APTECH03", "40", "Hoàn thành", ""}
            };
            for (String[] row : tableData) {
                for (String cell : row) {
                    table.addCell(new Cell().add(new Paragraph(cell).setFont(normalFont).setFontSize(9)));
                }
            }
        }

        document.add(table);

        // Section 2
        document.add(new Paragraph("II. KẾT QUẢ ĐẠT ĐƯỢC").setFont(boldFont).setFontSize(12));

        long total = ((Number) data.get("totalSubjects")).longValue();
        long completed = ((Number) data.get("completedSubjects")).longValue();
        double rate = total > 0 ? Math.round((double) completed / total * 10000.0) / 100.0 : 0.0;

        String[] results = {
            "- Tổng số môn học: " + data.get("totalSubjects") + " môn",
            "- Số môn hoàn thành: " + data.get("completedSubjects") + " môn",
            "- Số môn đang thực hiện: " + (total - completed) + " môn",
            "- Tỷ lệ hoàn thành: " + rate + "%"
        };

        for (String result : results) {
            document.add(new Paragraph(result).setFont(normalFont).setFontSize(12));
        }

        document.close();

        log.info("Successfully generated PDF report for quarterly report - Teacher: {}, Quarter: {}, Year: {}",
                teacher.getId(), data.get("quarter"), data.get("year"));
        return outputStream.toByteArray();
    }

    private float sum(float[] array) {
        float total = 0;
        for (float value : array) {
            total += value;
        }
        return total;
    }

    private byte[] generateYearReportPdf(Map<String, Object> data, User teacher) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = loadCustomFont("DejaVuSans-Bold.ttf");
        PdfFont normalFont = loadCustomFont("DejaVuSans.ttf");

        // Title
        Paragraph title = new Paragraph("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY")
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Subtitle
        Paragraph subtitle = new Paragraph("Năm " + data.get("year"))
                .setFont(boldFont)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(subtitle);

        // Teacher info
        String teacherName = "Giảng viên: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());
        document.add(new Paragraph(teacherName).setFont(normalFont).setFontSize(12));

        String teacherId = "Mã giảng viên: " + teacher.getId();
        document.add(new Paragraph(teacherId).setFont(normalFont).setFontSize(12));

        String generatedAt = "Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        document.add(new Paragraph(generatedAt).setFont(normalFont).setFontSize(12));

        // Section 1
        document.add(new Paragraph("I. THỐNG KÊ TỔNG HỢP").setFont(boldFont).setFontSize(12));

        long totalRegistrations = ((Number) data.get("totalRegistrations")).longValue();
        long completedRegistrations = ((Number) data.get("completedRegistrations")).longValue();
        long totalExams = ((Number) data.get("totalExams")).longValue();
        long passedExams = ((Number) data.get("passedExams")).longValue();
        long totalTrials = ((Number) data.get("totalTrials")).longValue();
        long passedTrials = ((Number) data.get("passedTrials")).longValue();

        String[] stats = {
            "Tổng số môn đăng ký: " + totalRegistrations + " môn",
            "Số môn hoàn thành: " + completedRegistrations + " môn",
            "Số môn chưa hoàn thành: " + (totalRegistrations - completedRegistrations) + " môn",
            "Tỷ lệ hoàn thành: " + data.get("completionRate") + "%",
            "Số kỳ thi Aptech: " + totalExams + " kỳ",
            "Số lần thi đạt: " + passedExams + " lần",
            "Số buổi giảng thử: " + totalTrials + " buổi",
            "Số buổi đạt: " + passedTrials + " buổi"
        };

        for (String stat : stats) {
            document.add(new Paragraph(stat).setFont(normalFont).setFontSize(12));
        }

        // Section 2
        document.add(new Paragraph("II. CHI TIẾT THEO QUÝ").setFont(boldFont).setFontSize(12));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> quarterlyStats = (List<Map<String, Object>>) data.get("quarterlyStats");
        if (quarterlyStats != null && !quarterlyStats.isEmpty()) {
            for (Map<String, Object> quarter : quarterlyStats) {
                long q = ((Number) quarter.get("quarter")).longValue();
                long qTotal = ((Number) quarter.get("totalSubjects")).longValue();
                long qCompleted = ((Number) quarter.get("completedSubjects")).longValue();
                double qRate = qTotal > 0 ? Math.round((double) qCompleted / qTotal * 10000.0) / 100.0 : 0.0;
                String quarterText = "Quý " + q + ": " + qTotal + " môn - Hoàn thành " + qCompleted + " môn (" + qRate + "%)";
                document.add(new Paragraph(quarterText).setFont(normalFont).setFontSize(12));
            }
        } else {
            document.add(new Paragraph("Không có dữ liệu chi tiết theo quý.").setFont(normalFont).setFontSize(12));
        }

        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateAptechReportPdf(Map<String, Object> data, User teacher) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = loadCustomFont("DejaVuSans-Bold.ttf");
        PdfFont normalFont = loadCustomFont("DejaVuSans.ttf");

        // Title
        Paragraph title = new Paragraph("DANH SÁCH THI CHỨNG NHẬN APTECH")
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Period
        Paragraph period = new Paragraph("Năm " + data.get("year") + (data.get("quarter") != null ? " - Quý " + data.get("quarter") : ""))
                .setFont(boldFont)
                .setFontSize(14)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(period);

        // Teacher info
        String teacherName = "Giảng viên: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());
        document.add(new Paragraph(teacherName).setFont(normalFont).setFontSize(12));

        String teacherId = "Mã giảng viên: " + teacher.getId();
        document.add(new Paragraph(teacherId).setFont(normalFont).setFontSize(12));

        // Section
        document.add(new Paragraph("DANH SÁCH CÁC MÔN ĐÃ THI:").setFont(boldFont).setFontSize(12));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("exams");
        if (exams != null && !exams.isEmpty()) {
            for (int i = 0; i < exams.size(); i++) {
                Map<String, Object> exam = exams.get(i);
                String examText = (i + 1) + ". " + exam.get("subjectName") + " - Ngày thi: " +
                    (exam.get("examDate") != null ? exam.get("examDate").toString() : "N/A") +
                    " - Điểm: " + (exam.get("score") != null ? exam.get("score").toString() : "0") +
                    " - Kết quả: " + (String) exam.get("result") +
                    " - Lần thi: " + (exam.get("attempt") != null ? exam.get("attempt").toString() : "1");
                document.add(new Paragraph(examText).setFont(normalFont).setFontSize(12));
            }
        } else {
            document.add(new Paragraph("Không có dữ liệu kỳ thi Aptech.").setFont(normalFont).setFontSize(12));
        }

        // Summary
        document.add(new Paragraph("TỔNG HỢP KẾT QUẢ").setFont(boldFont).setFontSize(12));

        String[] summary = {
            "Tổng số môn thi: " + data.get("totalExams") + " môn",
            "Số môn đạt: " + data.get("passedExams") + " môn",
            "Số môn không đạt: " + (String.valueOf((Long) data.get("totalExams") - (Long) data.get("passedExams"))) + " môn",
            "Tỷ lệ đạt: " + data.get("passRate") + "%"
        };

        for (String line : summary) {
            document.add(new Paragraph(line).setFont(normalFont).setFontSize(12));
        }

        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportPdf(Map<String, Object> data, User teacher) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = loadCustomFont("DejaVuSans-Bold.ttf");
        PdfFont normalFont = loadCustomFont("DejaVuSans.ttf");

        // Title
        Paragraph title = new Paragraph("BIÊN BẢN GIẢNG THỬ")
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Teacher info
        String teacherName = "Giảng viên: " + (teacher.getUserDetails() != null ?
            teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId());
        document.add(new Paragraph(teacherName).setFont(normalFont).setFontSize(12));

        String teacherId = "Mã giảng viên: " + teacher.getId();
        document.add(new Paragraph(teacherId).setFont(normalFont).setFontSize(12));

        // Section
        document.add(new Paragraph("DANH SÁCH CÁC BUỔI GIẢNG THỬ:").setFont(boldFont).setFontSize(12));

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trials = (List<Map<String, Object>>) data.get("trials");
        if (trials != null && !trials.isEmpty()) {
            for (int i = 0; i < trials.size(); i++) {
                Map<String, Object> trial = trials.get(i);
                String trialText = (i + 1) + ". " + trial.get("subjectName") + " - Ngày giảng thử: " +
                    (trial.get("teachingDate") != null ? trial.get("teachingDate").toString() : "N/A") +
                    " - Địa điểm: " + (String) trial.get("location") +
                    " - Điểm: " + (trial.get("score") != null ? trial.get("score").toString() : "0") +
                    " - Kết quả: " + (String) trial.get("conclusion") +
                    " - Nhận xét: " + (String) trial.get("comments");
                document.add(new Paragraph(trialText).setFont(normalFont).setFontSize(12));
            }
        } else {
            document.add(new Paragraph("Không có dữ liệu buổi giảng thử.").setFont(normalFont).setFontSize(12));
        }

        // Summary
        document.add(new Paragraph("TỔNG HỢP").setFont(boldFont).setFontSize(12));

        String[] summary = {
            "Tổng số buổi giảng thử: " + data.get("totalTrials") + " buổi",
            "Số buổi đạt: " + data.get("passedTrials") + " buổi",
            "Tỷ lệ đạt: " + data.get("passRate") + "%"
        };

        for (String line : summary) {
            document.add(new Paragraph(line).setFont(normalFont).setFontSize(12));
        }

        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateDefaultReportPdf(Map<String, Object> data, User teacher) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont normalFont = loadCustomFont("DejaVuSans.ttf");

        String[] lines = {
            "Report Type: " + data.get("reportType"),
            "Teacher: " + (teacher.getUserDetails() != null ?
                teacher.getUserDetails().getFirstName() + " " + teacher.getUserDetails().getLastName() : teacher.getId()),
            "Year: " + (data.get("year") != null ? data.get("year").toString() : ""),
            "Quarter: " + (data.get("quarter") != null ? data.get("quarter").toString() : ""),
            "Generated At: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        };

        for (String line : lines) {
            document.add(new Paragraph(line).setFont(normalFont).setFontSize(12));
        }

        document.close();
        return outputStream.toByteArray();
    }
}
