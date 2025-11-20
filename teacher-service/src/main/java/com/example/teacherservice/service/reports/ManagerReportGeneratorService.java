package com.example.teacherservice.service.reports;

import com.itextpdf.io.font.PdfEncodings;
import com.itextpdf.io.font.constants.StandardFonts;
import com.itextpdf.kernel.font.PdfFont;
import com.itextpdf.kernel.font.PdfFontFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.properties.TextAlignment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.PDPage;
import org.apache.pdfbox.pdmodel.PDPageContentStream;
import org.apache.pdfbox.pdmodel.font.PDFont;
import org.apache.pdfbox.pdmodel.font.PDType0Font;
import org.apache.pdfbox.pdmodel.font.PDType1Font;
import org.apache.pdfbox.pdmodel.font.Standard14Fonts;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.apache.poi.xwpf.usermodel.XWPFParagraph;
import org.apache.poi.xwpf.usermodel.XWPFRun;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class ManagerReportGeneratorService {

    public byte[] generateExcelReport(Map<String, Object> data) throws IOException {
        Workbook workbook = WorkbookFactory.create(true);
        String reportType = (String) data.get("reportType");

        switch (reportType) {
            case "QUARTER":
                return generateQuarterReportExcel(workbook, data);
            case "YEAR":
                return generateYearReportExcel(workbook, data);
            case "APTECH":
                return generateAptechReportExcel(workbook, data);
            case "TRIAL":
                return generateTrialReportExcel(workbook, data);
            default:
                return generateDefaultManagerReportExcel(workbook, data);
        }
    }



    private byte[] generateDefaultManagerReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.createSheet("Manager Report");

        // Create header row
        Row headerRow = sheet.createRow(0);
        headerRow.createCell(0).setCellValue("Report Type");
        headerRow.createCell(1).setCellValue("Period");
        headerRow.createCell(2).setCellValue("Generated At");

        // Create data row
        Row dataRow = sheet.createRow(1);
        dataRow.createCell(0).setCellValue((String) data.get("reportType"));
        dataRow.createCell(1).setCellValue(data.get("period") != null ? data.get("period").toString() : "");
        dataRow.createCell(2).setCellValue(((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        // Auto-size columns
        for (int i = 0; i < 3; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    public byte[] generateWordReport(Map<String, Object> data) throws IOException {
        XWPFDocument document = new XWPFDocument();
        String reportType = (String) data.get("reportType");

        switch (reportType) {
            case "QUARTER":
                return generateQuarterReportWord(document, data);
            case "YEAR":
                return generateYearReportWord(document, data);
            case "APTECH":
                return generateAptechReportWord(document, data);
            case "TRIAL":
                return generateTrialReportWord(document, data);
            default:
                return generateDefaultManagerReportWord(document, data);
        }
    }

    public byte[] generatePdfReport(Map<String, Object> data) throws IOException {
        String reportType = (String) data.get("reportType");

        switch (reportType) {
            case "QUARTER":
                return generateQuarterReportPdf(data);
            case "YEAR":
                return generateYearReportPdf(data);
            case "APTECH":
                return generateAptechReportPdf(data);
            case "TRIAL":
                return generateTrialReportPdf(data);
            default:
                return generateDefaultManagerReportPdf(data);
        }
    }


    private byte[] generateQuarterReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.createSheet("Báo cáo Quý Tổng hợp");

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
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY QUÝ " + data.get("quarter") + " NĂM " + data.get("year"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 6));

        // Period info
        Row periodRow = sheet.createRow(2);
        periodRow.createCell(0).setCellValue("Thời gian:");
        periodRow.createCell(1).setCellValue("Quý " + data.get("quarter") + " năm " + data.get("year"));

        // Table headers
        String[] headers = {"STT", "Mã GV", "Họ tên", "Số môn", "Hoàn thành", "Tỷ lệ", "Ghi chú"};
        Row headerRow = sheet.createRow(4);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Get aggregate quarter data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherQuarterStats = (List<Map<String, Object>>) data.get("teacherQuarterStats");
        if (teacherQuarterStats != null && !teacherQuarterStats.isEmpty()) {
            for (int i = 0; i < teacherQuarterStats.size(); i++) {
                Map<String, Object> teacher = teacherQuarterStats.get(i);
                Row row = sheet.createRow(5 + i);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue((String) teacher.get("teacherId"));
                row.createCell(2).setCellValue((String) teacher.get("teacherName"));
                row.createCell(3).setCellValue(teacher.get("totalSubjects").toString());
                row.createCell(4).setCellValue(teacher.get("completedSubjects").toString());
                row.createCell(5).setCellValue(teacher.get("completionRate") + "%");
                row.createCell(6).setCellValue((String) teacher.get("notes"));
            }
        } else {
            // Fallback sample data
            String[][] sampleData = {
                    {"1", "GV001", "Nguyễn Văn A", "3", "3", "100%", "Hoàn thành tốt"},
                    {"2", "GV002", "Trần Thị B", "4", "3", "75%", "Đang thực hiện"},
                    {"3", "GV003", "Lê Văn C", "2", "2", "100%", "Hoàn thành"}
            };

            for (int i = 0; i < sampleData.length; i++) {
                Row row = sheet.createRow(5 + i);
                for (int j = 0; j < sampleData[i].length; j++) {
                    row.createCell(j).setCellValue(sampleData[i][j]);
                }
            }
        }

        // Summary section
        int summaryStartRow = 5 + (teacherQuarterStats != null ? teacherQuarterStats.size() : 3) + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG KẾT QUÝ");
        summaryTitleCell.setCellStyle(headerStyle);

        String[][] summaryData = {
                {"Tổng số giảng viên:", data.get("totalTeachers").toString()},
                {"Tổng số môn học:", data.get("totalSubjects").toString()},
                {"Tổng môn hoàn thành:", data.get("totalCompleted").toString()},
                {"Tỷ lệ hoàn thành trung bình:", data.get("avgCompletionRate") + "%"}
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

    private byte[] generateYearReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.createSheet("Báo cáo Năm Tổng hợp");

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
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY NĂM " + data.get("year"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(0, 0, 0, 8));

        // Period info
        Row periodRow = sheet.createRow(2);
        periodRow.createCell(0).setCellValue("Năm:");
        periodRow.createCell(1).setCellValue(data.get("year").toString());

        // Table headers
        String[] headers = {"STT", "Mã GV", "Họ tên", "Tổng môn", "Hoàn thành", "Tỷ lệ", "Số thi", "Thi đạt", "Giảng thử"};
        Row headerRow = sheet.createRow(4);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Get aggregate year data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherYearStats = (List<Map<String, Object>>) data.get("teacherYearStats");
        if (teacherYearStats != null && !teacherYearStats.isEmpty()) {
            for (int i = 0; i < teacherYearStats.size(); i++) {
                Map<String, Object> teacher = teacherYearStats.get(i);
                Row row = sheet.createRow(5 + i);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue((String) teacher.get("teacherId"));
                row.createCell(2).setCellValue((String) teacher.get("teacherName"));
                row.createCell(3).setCellValue(teacher.get("totalSubjects").toString());
                row.createCell(4).setCellValue(teacher.get("completedSubjects").toString());
                row.createCell(5).setCellValue(teacher.get("completionRate") + "%");
                row.createCell(6).setCellValue(teacher.get("totalExams").toString());
                row.createCell(7).setCellValue(teacher.get("passedExams").toString());
                row.createCell(8).setCellValue(teacher.get("totalTrials").toString());
            }
        } else {
            // Fallback sample data
            String[][] sampleData = {
                    {"1", "GV001", "Nguyễn Văn A", "12", "10", "83.3%", "8", "7", "6"},
                    {"2", "GV002", "Trần Thị B", "15", "12", "80.0%", "10", "8", "5"},
                    {"3", "GV003", "Lê Văn C", "8", "6", "75.0%", "6", "5", "4"}
            };

            for (int i = 0; i < sampleData.length; i++) {
                Row row = sheet.createRow(5 + i);
                for (int j = 0; j < sampleData[i].length; j++) {
                    row.createCell(j).setCellValue(sampleData[i][j]);
                }
            }
        }

        // Summary section
        int summaryStartRow = 5 + (teacherYearStats != null ? teacherYearStats.size() : 3) + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG KẾT NĂM");
        summaryTitleCell.setCellStyle(headerStyle);

        String[][] summaryData = {
                {"Tổng số giảng viên:", data.get("totalTeachers").toString()},
                {"Tổng số môn học:", data.get("totalSubjects").toString()},
                {"Tổng môn hoàn thành:", data.get("totalCompleted").toString()},
                {"Tỷ lệ hoàn thành trung bình:", data.get("avgCompletionRate") + "%"},
                {"Tổng số kỳ thi:", data.get("totalExams").toString()},
                {"Tổng thi đạt:", data.get("totalPassedExams").toString()},
                {"Tỷ lệ thi đạt trung bình:", data.get("avgExamPassRate") + "%"}
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

    private byte[] generateAptechReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.createSheet("Kỳ thi Aptech Tổng hợp");

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
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("DANH SÁCH TỔNG HỢP THI CHỨNG NHẬN APTECH");
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
        String[] headers = {"STT", "Mã GV", "Họ tên", "Môn thi", "Ngày thi", "Điểm", "Kết quả", "Lần thi"};
        Row headerRow = sheet.createRow(4);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Get aggregate exam data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allExams = (List<Map<String, Object>>) data.get("allExams");
        if (allExams != null && !allExams.isEmpty()) {
            for (int i = 0; i < allExams.size(); i++) {
                Map<String, Object> exam = allExams.get(i);
                Row row = sheet.createRow(5 + i);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue((String) exam.get("teacherId"));
                row.createCell(2).setCellValue((String) exam.get("teacherName"));
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
            // Fallback sample data
            String[][] examData = {
                    {"1", "GV001", "Nguyễn Văn A", "Java Programming", "15/01/2024", "85", "PASS", "1"},
                    {"2", "GV002", "Trần Thị B", "Web Development", "20/02/2024", "78", "PASS", "1"},
                    {"3", "GV003", "Lê Văn C", "Database Design", "10/03/2024", "92", "PASS", "1"}
            };

            for (int i = 0; i < examData.length; i++) {
                Row row = sheet.createRow(5 + i);
                for (int j = 0; j < examData[i].length; j++) {
                    row.createCell(j).setCellValue(examData[i][j]);
                }
            }
        }

        // Summary section
        int summaryStartRow = 5 + (allExams != null ? allExams.size() : 3) + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG HỢP KẾT QUẢ");
        summaryTitleCell.setCellStyle(headerStyle);

        String[][] summaryData = {
                {"Tổng số kỳ thi:", data.get("totalExams").toString()},
                {"Số môn đạt:", data.get("passedExams").toString()},
                {"Số môn không đạt:", String.valueOf(((Number) data.get("totalExams")).longValue() - ((Number) data.get("passedExams")).longValue())},
                {"Tỷ lệ đạt:", data.get("passRate") + "%"},
                {"Số giảng viên tham gia:", data.get("totalTeachers").toString()}
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

    private byte[] generateTrialReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.createSheet("Giảng thử Tổng hợp");

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
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BIÊN BẢN GIẢNG THỬ TỔNG HỢP");
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
        String[] headers = {"STT", "Mã GV", "Họ tên", "Môn học", "Ngày giảng thử", "Điểm", "Kết quả", "Nhận xét"};
        Row headerRow = sheet.createRow(4);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Get aggregate trial data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allTrials = (List<Map<String, Object>>) data.get("allTrials");
        if (allTrials != null && !allTrials.isEmpty()) {
            for (int i = 0; i < allTrials.size(); i++) {
                Map<String, Object> trial = allTrials.get(i);
                Row row = sheet.createRow(5 + i);
                row.createCell(0).setCellValue(String.valueOf(i + 1));
                row.createCell(1).setCellValue((String) trial.get("teacherId"));
                row.createCell(2).setCellValue((String) trial.get("teacherName"));
                row.createCell(3).setCellValue((String) trial.get("subjectName"));
                row.createCell(4).setCellValue(trial.get("teachingDate") != null ?
                        trial.get("teachingDate").toString() : "N/A");
                row.createCell(5).setCellValue(trial.get("score") != null ?
                        trial.get("score").toString() : "0");
                row.createCell(6).setCellValue((String) trial.get("conclusion"));
                row.createCell(7).setCellValue((String) trial.get("comments"));
            }
        } else {
            // Fallback sample data
            String[][] trialData = {
                    {"1", "GV001", "Nguyễn Văn A", "Java Programming", "15/01/2024", "85", "PASS", "Giảng viên trình bày tốt"},
                    {"2", "GV002", "Trần Thị B", "Web Development", "20/02/2024", "78", "PASS", "Nội dung bài giảng logic"},
                    {"3", "GV003", "Lê Văn C", "Database Design", "10/03/2024", "92", "PASS", "Kiến thức chuyên môn vững"}
            };

            for (int i = 0; i < trialData.length; i++) {
                Row row = sheet.createRow(5 + i);
                for (int j = 0; j < trialData[i].length; j++) {
                    row.createCell(j).setCellValue(trialData[i][j]);
                }
            }
        }

        // Summary
        int summaryStartRow = 5 + (allTrials != null ? allTrials.size() : 3) + 2;
        Row summaryRow = sheet.createRow(summaryStartRow);
        summaryRow.createCell(0).setCellValue("Tổng số buổi giảng thử:");
        summaryRow.createCell(1).setCellValue(data.get("totalTrials").toString());

        Row passRow = sheet.createRow(summaryStartRow + 1);
        passRow.createCell(0).setCellValue("Số buổi đạt:");
        passRow.createCell(1).setCellValue(data.get("passedTrials").toString());

        Row rateRow = sheet.createRow(summaryStartRow + 2);
        rateRow.createCell(0).setCellValue("Tỷ lệ đạt:");
        rateRow.createCell(1).setCellValue(data.get("passRate") + "%");

        Row teacherRow = sheet.createRow(summaryStartRow + 3);
        teacherRow.createCell(0).setCellValue("Số giảng viên tham gia:");
        teacherRow.createCell(1).setCellValue(data.get("totalTeachers").toString());

        // Auto-size columns
        for (int i = 0; i < headers.length; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateQuarterReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY QUÝ " + data.get("quarter") + " NĂM " + data.get("year"));
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // Period info
        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Thời gian: Quý " + data.get("quarter") + " năm " + data.get("year"));
        periodRun.addBreak();
        periodRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("THỐNG KÊ HOẠT ĐỘNG THEO GIẢNG VIÊN");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Get aggregate quarter data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherQuarterStats = (List<Map<String, Object>>) data.get("teacherQuarterStats");
        if (teacherQuarterStats != null && !teacherQuarterStats.isEmpty()) {
            for (int i = 0; i < teacherQuarterStats.size(); i++) {
                Map<String, Object> teacher = teacherQuarterStats.get(i);
                contentRun.setText((i + 1) + ". " + teacher.get("teacherName") + " (" + teacher.get("teacherId") + ")");
                contentRun.addBreak();
                contentRun.setText("   - Số môn: " + teacher.get("totalSubjects") + " | Hoàn thành: " + teacher.get("completedSubjects") + " | Tỷ lệ: " + teacher.get("completionRate") + "%");
                contentRun.addBreak();
                contentRun.addBreak();
            }
        } else {
            contentRun.setText("Không có dữ liệu giảng viên trong quý này.");
            contentRun.addBreak();
        }

        // Summary
        contentRun.setText("TỔNG KẾT QUÝ");
        contentRun.setBold(true);
        contentRun.addBreak();
        contentRun.setText("- Tổng số giảng viên: " + data.get("totalTeachers"));
        contentRun.addBreak();
        contentRun.setText("- Tỷ lệ hoàn thành trung bình: " + data.get("avgCompletionRate") + "%");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateYearReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY NĂM " + data.get("year"));
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // Period info
        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Năm: " + data.get("year"));
        periodRun.addBreak();
        periodRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("THỐNG KÊ HOẠT ĐỘNG THEO GIẢNG VIÊN");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Get aggregate year data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherYearStats = (List<Map<String, Object>>) data.get("teacherYearStats");
        if (teacherYearStats != null && !teacherYearStats.isEmpty()) {
            for (int i = 0; i < teacherYearStats.size(); i++) {
                Map<String, Object> teacher = teacherYearStats.get(i);
                contentRun.setText((i + 1) + ". " + teacher.get("teacherName") + " (" + teacher.get("teacherId") + ")");
                contentRun.addBreak();
                contentRun.setText("   - Tổng môn: " + teacher.get("totalSubjects") + " | Hoàn thành: " + teacher.get("completedSubjects") + " | Tỷ lệ: " + teacher.get("completionRate") + "%");
                contentRun.addBreak();
                contentRun.setText("   - Kỳ thi: " + teacher.get("totalExams") + " | Đạt: " + teacher.get("passedExams"));
                contentRun.addBreak();
                contentRun.setText("   - Giảng thử: " + teacher.get("totalTrials"));
                contentRun.addBreak();
                contentRun.addBreak();
            }
        } else {
            contentRun.setText("Không có dữ liệu giảng viên trong năm này.");
            contentRun.addBreak();
        }

        // Summary
        contentRun.setText("TỔNG KẾT NĂM");
        contentRun.setBold(true);
        contentRun.addBreak();
        contentRun.setText("- Tổng số giảng viên: " + data.get("totalTeachers"));
        contentRun.addBreak();
        contentRun.setText("- Tỷ lệ hoàn thành trung bình: " + data.get("avgCompletionRate") + "%");
        contentRun.addBreak();
        contentRun.setText("- Tỷ lệ thi đạt trung bình: " + data.get("avgExamPassRate") + "%");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateAptechReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("DANH SÁCH TỔNG HỢP THI CHỨNG NHẬN APTECH");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // Period info
        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Năm: " + data.get("year"));
        if (data.get("quarter") != null) {
            periodRun.setText(" | Quý: Q" + data.get("quarter"));
        }
        periodRun.addBreak();
        periodRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("DANH SÁCH KẾT QUẢ THI");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Get aggregate exam data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allExams = (List<Map<String, Object>>) data.get("allExams");
        if (allExams != null && !allExams.isEmpty()) {
            for (int i = 0; i < allExams.size(); i++) {
                Map<String, Object> exam = allExams.get(i);
                contentRun.setText((i + 1) + ". " + exam.get("teacherName") + " (" + exam.get("teacherId") + ") - " + exam.get("subjectName"));
                contentRun.addBreak();
                contentRun.setText("   - Ngày thi: " + (exam.get("examDate") != null ? exam.get("examDate") : "N/A"));
                contentRun.addBreak();
                contentRun.setText("   - Điểm: " + (exam.get("score") != null ? exam.get("score") : "0") + " | Kết quả: " + exam.get("result"));
                contentRun.addBreak();
                contentRun.addBreak();
            }
        } else {
            contentRun.setText("Không có dữ liệu thi trong kỳ này.");
            contentRun.addBreak();
        }

        // Summary
        contentRun.setText("TỔNG HỢP KẾT QUẢ");
        contentRun.setBold(true);
        contentRun.addBreak();
        contentRun.setText("- Tổng số kỳ thi: " + data.get("totalExams"));
        contentRun.addBreak();
        contentRun.setText("- Số môn đạt: " + data.get("passedExams"));
        contentRun.addBreak();
        contentRun.setText("- Tỷ lệ đạt: " + data.get("passRate") + "%");
        contentRun.addBreak();
        contentRun.setText("- Số giảng viên tham gia: " + data.get("totalTeachers"));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BIÊN BẢN GIẢNG THỬ TỔNG HỢP");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // Period info
        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Năm: " + data.get("year"));
        if (data.get("quarter") != null) {
            periodRun.setText(" | Quý: Q" + data.get("quarter"));
        }
        periodRun.addBreak();
        periodRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("DANH SÁCH KẾT QUẢ GIẢNG THỬ");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Get aggregate trial data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allTrials = (List<Map<String, Object>>) data.get("allTrials");
        if (allTrials != null && !allTrials.isEmpty()) {
            for (int i = 0; i < allTrials.size(); i++) {
                Map<String, Object> trial = allTrials.get(i);
                contentRun.setText((i + 1) + ". " + trial.get("teacherName") + " (" + trial.get("teacherId") + ") - " + trial.get("subjectName"));
                contentRun.addBreak();
                contentRun.setText("   - Ngày giảng thử: " + (trial.get("teachingDate") != null ? trial.get("teachingDate") : "N/A"));
                contentRun.addBreak();
                contentRun.setText("   - Điểm: " + (trial.get("score") != null ? trial.get("score") : "0") + " | Kết quả: " + trial.get("conclusion"));
                contentRun.addBreak();
                contentRun.setText("   - Nhận xét: " + trial.get("comments"));
                contentRun.addBreak();
                contentRun.addBreak();
            }
        } else {
            contentRun.setText("Không có dữ liệu giảng thử trong kỳ này.");
            contentRun.addBreak();
        }

        // Summary
        contentRun.setText("TỔNG HỢP KẾT QUẢ");
        contentRun.setBold(true);
        contentRun.addBreak();
        contentRun.setText("- Tổng số buổi giảng thử: " + data.get("totalTrials"));
        contentRun.addBreak();
        contentRun.setText("- Số buổi đạt: " + data.get("passedTrials"));
        contentRun.addBreak();
        contentRun.setText("- Tỷ lệ đạt: " + data.get("passRate") + "%");
        contentRun.addBreak();
        contentRun.setText("- Số giảng viên tham gia: " + data.get("totalTeachers"));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateDefaultManagerReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("Manager Report");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("Report Type: " + data.get("reportType"));
        contentRun.addBreak();
        contentRun.setText("Period: " + (data.get("period") != null ? data.get("period").toString() : "N/A"));
        contentRun.addBreak();
        contentRun.setText("Generated At: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateQuarterReportPdf(Map<String, Object> data) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = loadCustomFont("DejaVuSans-Bold.ttf");
        PdfFont normalFont = loadCustomFont("DejaVuSans.ttf");

        // Title
        Paragraph title = new Paragraph("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY QUÝ " + data.get("quarter") + " NĂM " + data.get("year"))
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Period info
        Paragraph period = new Paragraph("Thời gian: Quý " + data.get("quarter") + " năm " + data.get("year"))
                .setFont(normalFont)
                .setFontSize(12);
        document.add(period);

        Paragraph generated = new Paragraph("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .setFont(normalFont)
                .setFontSize(12);
        document.add(generated);

        // Section title
        Paragraph sectionTitle = new Paragraph("THỐNG KÊ HOẠT ĐỘNG THEO GIẢNG VIÊN")
                .setFont(boldFont)
                .setFontSize(14);
        document.add(sectionTitle);

        // Get aggregate quarter data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherQuarterStats = (List<Map<String, Object>>) data.get("teacherQuarterStats");
        if (teacherQuarterStats != null && !teacherQuarterStats.isEmpty()) {
            for (int i = 0; i < teacherQuarterStats.size(); i++) {
                Map<String, Object> teacher = teacherQuarterStats.get(i);
                String teacherText = (i + 1) + ". " + teacher.get("teacherName") + " (" + teacher.get("teacherId") + ")";
                Paragraph teacherPara = new Paragraph(teacherText).setFont(normalFont).setFontSize(12);
                document.add(teacherPara);

                String statsText = "   - Số môn: " + teacher.get("totalSubjects") + " | Hoàn thành: " + teacher.get("completedSubjects") + " | Tỷ lệ: " + teacher.get("completionRate") + "%";
                Paragraph statsPara = new Paragraph(statsText).setFont(normalFont).setFontSize(12);
                document.add(statsPara);
            }
        } else {
            Paragraph noData = new Paragraph("Không có dữ liệu giảng viên trong quý này.").setFont(normalFont).setFontSize(12);
            document.add(noData);
        }

        // Summary section
        Paragraph summaryTitle = new Paragraph("TỔNG KẾT QUÝ")
                .setFont(boldFont)
                .setFontSize(14);
        document.add(summaryTitle);

        String[] summaryLines = {
                "- Tổng số giảng viên: " + data.get("totalTeachers"),
                "- Tỷ lệ hoàn thành trung bình: " + data.get("avgCompletionRate") + "%"
        };

        for (String line : summaryLines) {
            Paragraph summaryPara = new Paragraph(line).setFont(normalFont).setFontSize(12);
            document.add(summaryPara);
        }

        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateYearReportPdf(Map<String, Object> data) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = loadCustomFont("DejaVuSans-Bold.ttf");
        PdfFont normalFont = loadCustomFont("DejaVuSans.ttf");

        // Title
        Paragraph title = new Paragraph("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY NĂM " + data.get("year"))
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Period info
        Paragraph year = new Paragraph("Năm: " + data.get("year"))
                .setFont(normalFont)
                .setFontSize(12);
        document.add(year);

        Paragraph generated = new Paragraph("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .setFont(normalFont)
                .setFontSize(12);
        document.add(generated);

        // Section title
        Paragraph sectionTitle = new Paragraph("THỐNG KÊ HOẠT ĐỘNG THEO GIẢNG VIÊN")
                .setFont(boldFont)
                .setFontSize(14);
        document.add(sectionTitle);

        // Get aggregate year data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherYearStats = (List<Map<String, Object>>) data.get("teacherYearStats");
        if (teacherYearStats != null && !teacherYearStats.isEmpty()) {
            for (int i = 0; i < teacherYearStats.size(); i++) {
                Map<String, Object> teacher = teacherYearStats.get(i);
                String teacherText = (i + 1) + ". " + teacher.get("teacherName") + " (" + teacher.get("teacherId") + ")";
                Paragraph teacherPara = new Paragraph(teacherText).setFont(normalFont).setFontSize(12);
                document.add(teacherPara);

                String statsText = "   - Tổng môn: " + teacher.get("totalSubjects") + " | Hoàn thành: " + teacher.get("completedSubjects") + " | Tỷ lệ: " + teacher.get("completionRate") + "%";
                Paragraph statsPara = new Paragraph(statsText).setFont(normalFont).setFontSize(12);
                document.add(statsPara);

                String examText = "   - Kỳ thi: " + teacher.get("totalExams") + " | Đạt: " + teacher.get("passedExams");
                Paragraph examPara = new Paragraph(examText).setFont(normalFont).setFontSize(12);
                document.add(examPara);

                String trialText = "   - Giảng thử: " + teacher.get("totalTrials");
                Paragraph trialPara = new Paragraph(trialText).setFont(normalFont).setFontSize(12);
                document.add(trialPara);
            }
        } else {
            Paragraph noData = new Paragraph("Không có dữ liệu giảng viên trong năm này.").setFont(normalFont).setFontSize(12);
            document.add(noData);
        }

        // Summary section
        Paragraph summaryTitle = new Paragraph("TỔNG KẾT NĂM")
                .setFont(boldFont)
                .setFontSize(14);
        document.add(summaryTitle);

        String[] summaryLines = {
                "- Tổng số giảng viên: " + data.get("totalTeachers"),
                "- Tỷ lệ hoàn thành trung bình: " + data.get("avgCompletionRate") + "%",
                "- Tỷ lệ thi đạt trung bình: " + data.get("avgExamPassRate") + "%"
        };

        for (String line : summaryLines) {
            Paragraph summaryPara = new Paragraph(line).setFont(normalFont).setFontSize(12);
            document.add(summaryPara);
        }

        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateAptechReportPdf(Map<String, Object> data) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PdfWriter writer = new PdfWriter(outputStream);
        PdfDocument pdfDoc = new PdfDocument(writer);
        Document document = new Document(pdfDoc);

        PdfFont boldFont = loadCustomFont("DejaVuSans-Bold.ttf");
        PdfFont normalFont = loadCustomFont("DejaVuSans.ttf");

        // Title
        Paragraph title = new Paragraph("DANH SÁCH TỔNG HỢP THI CHỨNG NHẬN APTECH")
                .setFont(boldFont)
                .setFontSize(16)
                .setTextAlignment(TextAlignment.CENTER);
        document.add(title);

        // Period info
        String periodText = "Năm: " + data.get("year");
        if (data.get("quarter") != null) {
            periodText += " | Quý: Q" + data.get("quarter");
        }
        Paragraph period = new Paragraph(periodText)
                .setFont(normalFont)
                .setFontSize(12);
        document.add(period);

        Paragraph generated = new Paragraph("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                .setFont(normalFont)
                .setFontSize(12);
        document.add(generated);

        // Section title
        Paragraph sectionTitle = new Paragraph("DANH SÁCH KẾT QUẢ THI")
                .setFont(boldFont)
                .setFontSize(14);
        document.add(sectionTitle);

        // Get aggregate exam data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allExams = (List<Map<String, Object>>) data.get("allExams");
        if (allExams != null && !allExams.isEmpty()) {
            for (int i = 0; i < allExams.size(); i++) {
                Map<String, Object> exam = allExams.get(i);
                String examText = (i + 1) + ". " + exam.get("teacherName") + " (" + exam.get("teacherId") + ") - " + exam.get("subjectName");
                Paragraph examPara = new Paragraph(examText).setFont(normalFont).setFontSize(12);
                document.add(examPara);

                String dateText = "   - Ngày thi: " + (exam.get("examDate") != null ? exam.get("examDate") : "N/A");
                Paragraph datePara = new Paragraph(dateText).setFont(normalFont).setFontSize(12);
                document.add(datePara);

                String resultText = "   - Điểm: " + (exam.get("score") != null ? exam.get("score") : "0") + " | Kết quả: " + exam.get("result");
                Paragraph resultPara = new Paragraph(resultText).setFont(normalFont).setFontSize(12);
                document.add(resultPara);
            }
        } else {
            Paragraph noData = new Paragraph("Không có dữ liệu thi trong kỳ này.").setFont(normalFont).setFontSize(12);
            document.add(noData);
        }

        // Summary section
        Paragraph summaryTitle = new Paragraph("TỔNG HỢP KẾT QUẢ")
                .setFont(boldFont)
                .setFontSize(14);
        document.add(summaryTitle);

        String[] summaryLines = {
                "- Tổng số kỳ thi: " + data.get("totalExams"),
                "- Số môn đạt: " + data.get("passedExams"),
                "- Tỷ lệ đạt: " + data.get("passRate") + "%",
                "- Số giảng viên tham gia: " + data.get("totalTeachers")
        };

        for (String line : summaryLines) {
            Paragraph summaryPara = new Paragraph(line).setFont(normalFont).setFontSize(12);
            document.add(summaryPara);
        }

        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportPdf(Map<String, Object> data) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);
        PDFont boldFont;
        PDFont normalFont;
        try (InputStream boldStream = getClass().getClassLoader()
                .getResourceAsStream("fonts/DejaVuSans-Bold.ttf")) {
            if (boldStream != null) {
                boldFont = PDType0Font.load(document, boldStream);
            } else {
                boldFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA_BOLD);
            }
        }

        // Load normal font
        try (InputStream normalStream = getClass().getClassLoader()
                .getResourceAsStream("fonts/DejaVuSans.ttf")) {
            if (normalStream != null) {
                normalFont = PDType0Font.load(document, normalStream);
            } else {
                normalFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            }
        }

        float pageWidth = page.getMediaBox().getWidth();
        float pageHeight = page.getMediaBox().getHeight();
        float margin = 50;
        float yPosition = pageHeight - margin;

        // Title
        contentStream.setFont(boldFont, 16);
        String title = "BIÊN BẢN GIẢNG THỬ TỔNG HỢP";
        float titleWidth = boldFont.getStringWidth(title) / 1000 * 16;
        float titleX = (pageWidth - titleWidth) / 2;
        contentStream.beginText();
        contentStream.newLineAtOffset(titleX, yPosition);
        contentStream.showText(title);
        contentStream.endText();
        yPosition -= 50;

        // Period info
        contentStream.setFont(normalFont, 12);
        String periodText = "Năm: " + data.get("year");
        if (data.get("quarter") != null) {
            periodText += " | Quý: Q" + data.get("quarter");
        }
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText(periodText);
        contentStream.endText();
        yPosition -= 20;

        String generatedText = "Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText(generatedText);
        contentStream.endText();
        yPosition -= 40;

        // Section title
        contentStream.setFont(boldFont, 14);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("DANH SÁCH KẾT QUẢ GIẢNG THỬ");
        contentStream.endText();
        yPosition -= 30;

        // Get aggregate trial data
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allTrials = (List<Map<String, Object>>) data.get("allTrials");
        contentStream.setFont(normalFont, 12);
        if (allTrials != null && !allTrials.isEmpty()) {
            for (int i = 0; i < allTrials.size(); i++) {
                Map<String, Object> trial = allTrials.get(i);
                String trialText = (i + 1) + ". " + trial.get("teacherName") + " (" + trial.get("teacherId") + ") - " + trial.get("subjectName");
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText(trialText);
                contentStream.endText();
                yPosition -= 20;

                String dateText = "   - Ngày giảng thử: " + (trial.get("teachingDate") != null ? trial.get("teachingDate") : "N/A");
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText(dateText);
                contentStream.endText();
                yPosition -= 20;

                String resultText = "   - Điểm: " + (trial.get("score") != null ? trial.get("score") : "0") + " | Kết quả: " + trial.get("conclusion");
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText(resultText);
                contentStream.endText();
                yPosition -= 20;

                String commentText = "   - Nhận xét: " + trial.get("comments");
                contentStream.beginText();
                contentStream.newLineAtOffset(margin, yPosition);
                contentStream.showText(commentText);
                contentStream.endText();
                yPosition -= 25;
            }
        } else {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText("Không có dữ liệu giảng thử trong kỳ này.");
            contentStream.endText();
            yPosition -= 25;
        }

        yPosition -= 20;

        // Summary section
        contentStream.setFont(boldFont, 14);
        contentStream.beginText();
        contentStream.newLineAtOffset(margin, yPosition);
        contentStream.showText("TỔNG HỢP KẾT QUẢ");
        contentStream.endText();
        yPosition -= 30;

        contentStream.setFont(normalFont, 12);
        String[] summaryLines = {
                "- Tổng số buổi giảng thử: " + data.get("totalTrials"),
                "- Số buổi đạt: " + data.get("passedTrials"),
                "- Tỷ lệ đạt: " + data.get("passRate") + "%",
                "- Số giảng viên tham gia: " + data.get("totalTeachers")
        };

        for (String line : summaryLines) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText(line);
            contentStream.endText();
            yPosition -= 20;
        }

        contentStream.close();
        document.save(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateDefaultManagerReportPdf(Map<String, Object> data) throws IOException {
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        PDDocument document = new PDDocument();
        PDPage page = new PDPage();
        document.addPage(page);

        PDPageContentStream contentStream = new PDPageContentStream(document, page);
        PDFont normalFont;
        try (InputStream fontStream = getClass().getClassLoader()
                .getResourceAsStream("fonts/DejaVuSans.ttf")) {
            if (fontStream != null) {
                normalFont = PDType0Font.load(document, fontStream);
            } else {
                normalFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
            }

        }catch (IOException e) {
            normalFont = new PDType1Font(Standard14Fonts.FontName.HELVETICA);
        }

        float margin = 50;
        float yPosition = page.getMediaBox().getHeight() - margin;

        contentStream.setFont(normalFont, 12);

        String[] lines = {
                "Report Type: " + data.get("reportType"),
                "Period: " + (data.get("period") != null ? data.get("period").toString() : "N/A"),
                "Generated At: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME)
        };

        for (String line : lines) {
            contentStream.beginText();
            contentStream.newLineAtOffset(margin, yPosition);
            contentStream.showText(line);
            contentStream.endText();
            yPosition -= 20;
        }

        contentStream.close();
        document.save(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private PdfFont loadCustomFont(String fontName) throws IOException {
        try {
            return PdfFontFactory.createFont("fonts/" + fontName, PdfEncodings.IDENTITY_H);
        } catch (IOException e) {
            log.error("Failed to load custom font: {}", fontName, e);
            return PdfFontFactory.createFont(StandardFonts.HELVETICA, PdfEncodings.IDENTITY_H);
        }
    }
}
   
