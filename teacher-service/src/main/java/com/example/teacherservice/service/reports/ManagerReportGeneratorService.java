package com.example.teacherservice.service.reports;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xwpf.usermodel.*;
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
public class ManagerReportGeneratorService {

    public byte[] generateExcelReport(Map<String, Object> data) throws IOException, InvalidFormatException {
        String reportType = (String) data.get("reportType");
        String templateName = "templates/baocao-template.xlsx";
        InputStream templateStream = getClass().getClassLoader().getResourceAsStream(templateName);
        if (templateStream == null) {
            throw new IOException("Template file " + templateName + " not found");
        }
        Workbook workbook = WorkbookFactory.create(templateStream);
        templateStream.close();
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
                return generateDefaultReportExcel(workbook, data);
        }
    }
    private byte[] generateQuarterReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.getSheetAt(0);
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setWrapText(true);

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        CellStyle boldLabelStyle = workbook.createCellStyle();
        Font boldLabelFont = workbook.createFont();
        boldLabelFont.setBold(true);
        boldLabelStyle.setFont(boldLabelFont);
        boldLabelStyle.setWrapText(true);
        
        CellStyle boldLabelSummaryStyle = workbook.createCellStyle();
        Font boldLabelSummaryFont = workbook.createFont();
        boldLabelSummaryFont.setBold(true);
        boldLabelSummaryStyle.setFont(boldLabelSummaryFont);
        boldLabelSummaryStyle.setWrapText(true);
        boldLabelSummaryStyle.setBorderTop(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderBottom(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderLeft(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderRight(BorderStyle.THIN);

        CellStyle wrapStyle = workbook.createCellStyle();
        wrapStyle.setWrapText(true);
        wrapStyle.setBorderTop(BorderStyle.THIN);
        wrapStyle.setBorderBottom(BorderStyle.THIN);
        wrapStyle.setBorderLeft(BorderStyle.THIN);
        wrapStyle.setBorderRight(BorderStyle.THIN);

        CellStyle mergedSummaryStyle = workbook.createCellStyle();
        mergedSummaryStyle.setWrapText(true);
        // No borders for merged cells to avoid divided borders

        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);
        // Title at row 6
        Row titleRow = sheet.createRow(6);
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY QUÝ " + data.get("quarter") + " NĂM " + data.get("year"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(6, 6, 0, 7));
        // Period info at row 8
        Row periodRow = sheet.createRow(8);
        periodRow.setHeight((short)-1);
        periodRow.createCell(0).setCellValue("Quý:");
        periodRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell quarterValue = periodRow.createCell(1);
        quarterValue.setCellValue("Q" + data.get("quarter"));
        periodRow.createCell(2).setCellValue("Năm:");
        periodRow.getCell(2).setCellStyle(boldLabelStyle);
        Cell yearValue = periodRow.createCell(3);
        yearValue.setCellValue(data.get("year").toString());

        // Table headers at row 11
        String[] headers = {"STT", "Mã GV", "Họ tên", "Số môn", "Hoàn thành", "Tỷ lệ", "Ghi chú"};
        Row headerRow = sheet.createRow(11);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows start at row 12
        List<Map<String, Object>> teacherQuarterStats = (List<Map<String, Object>>) data.get("teacherQuarterStats");
        int dataSize = teacherQuarterStats != null ? teacherQuarterStats.size() : 0;
        for (int i = 0; i < dataSize; i++) {
            Map<String, Object> teacherStat = teacherQuarterStats.get(i);
            Row dataRow = sheet.createRow(12 + i);
            dataRow.setHeight((short)-1);
            Cell cell0 = dataRow.createCell(0);
            cell0.setCellValue(String.valueOf(i + 1));
            cell0.setCellStyle(dataStyle);
            Cell cell1 = dataRow.createCell(1);
            cell1.setCellValue(safeToString(teacherStat.get("teacherCode")));
            cell1.setCellStyle(dataStyle);
            Cell nameCell = dataRow.createCell(2);
            nameCell.setCellValue(safeToString(teacherStat.get("teacherName")));
            nameCell.setCellStyle(wrapStyle);
            Cell cell3 = dataRow.createCell(3);
            cell3.setCellValue(safeToString(teacherStat.get("totalSubjects")));
            cell3.setCellStyle(dataStyle);
            Cell cell4 = dataRow.createCell(4);
            cell4.setCellValue(safeToString(teacherStat.get("completedSubjects")));
            cell4.setCellStyle(dataStyle);
            Cell cell5 = dataRow.createCell(5);
            cell5.setCellValue(safeToString(teacherStat.get("completionRate")) + "%");
            cell5.setCellStyle(dataStyle);
            Cell notesCell = dataRow.createCell(6);
            notesCell.setCellValue(safeToString(teacherStat.get("notes")));
            notesCell.setCellStyle(wrapStyle);
        }
        // Set column widths for wrapping columns
        sheet.setColumnWidth(0, 25 * 256); 
        sheet.setColumnWidth(2, 30 * 256); // Họ tên
        sheet.setColumnWidth(6, 40 * 256); // Ghi chú
        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 0 && i != 2 && i != 6) {
                sheet.autoSizeColumn(i);
            }
        }

        // Summary section start row after data + 2 rows
        int summaryStartRow = 12 + dataSize + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG KẾT QUÝ");
        summaryTitleCell.setCellStyle(headerStyle);
        Cell summaryTitleCell2 = summaryTitleRow.createCell(1);
        summaryTitleCell2.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(summaryStartRow, summaryStartRow, 0, 1));

        Row totalTeachersRow = sheet.createRow(summaryStartRow + 1);
        totalTeachersRow.setHeight((short)-1);
        totalTeachersRow.createCell(0).setCellValue("Tổng số giảng viên:");
        totalTeachersRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalTeachersValue = totalTeachersRow.createCell(1);
        totalTeachersValue.setCellValue(String.valueOf(dataSize));
        totalTeachersValue.setCellStyle(wrapStyle);
        Row totalSubjectsRow = sheet.createRow(summaryStartRow + 2);
        totalSubjectsRow.setHeight((short)-1);
        totalSubjectsRow.createCell(0).setCellValue("Tổng số môn học:");
        totalSubjectsRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalSubjectsValue = totalSubjectsRow.createCell(1);
        totalSubjectsValue.setCellValue(safeToString(data.get("totalSubjects")));
        totalSubjectsValue.setCellStyle(wrapStyle);
        Row totalCompletedRow = sheet.createRow(summaryStartRow + 3);
        totalCompletedRow.setHeight((short)-1);
        totalCompletedRow.createCell(0).setCellValue("Tổng môn hoàn thành:");
        totalCompletedRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalCompletedValue = totalCompletedRow.createCell(1);
        totalCompletedValue.setCellValue(safeToString(data.get("totalCompleted")));
        totalCompletedValue.setCellStyle(wrapStyle);
        Row avgCompletionRateRow = sheet.createRow(summaryStartRow + 4);
        avgCompletionRateRow.setHeight((short)-1);
        avgCompletionRateRow.createCell(0).setCellValue("Tỷ lệ hoàn thành trung bình:");
        avgCompletionRateRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell avgCompletionRateValue = avgCompletionRateRow.createCell(1);
        avgCompletionRateValue.setCellValue(safeToString(data.get("avgCompletionRate")) + "%");
        avgCompletionRateValue.setCellStyle(wrapStyle);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateYearReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.getSheetAt(0);
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setWrapText(true);
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);
        CellStyle boldLabelStyle = workbook.createCellStyle();
        Font boldLabelFont = workbook.createFont();
        boldLabelFont.setBold(true);
        boldLabelStyle.setFont(boldLabelFont);
        boldLabelStyle.setWrapText(true);
        CellStyle boldLabelSummaryStyle = workbook.createCellStyle();
        Font boldLabelSummaryFont = workbook.createFont();
        boldLabelSummaryFont.setBold(true);
        boldLabelSummaryStyle.setFont(boldLabelSummaryFont);
        boldLabelSummaryStyle.setWrapText(true);
        boldLabelSummaryStyle.setBorderTop(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderBottom(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderLeft(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderRight(BorderStyle.THIN);
        CellStyle wrapStyle = workbook.createCellStyle();
        wrapStyle.setWrapText(true);
        wrapStyle.setBorderTop(BorderStyle.THIN);
        wrapStyle.setBorderBottom(BorderStyle.THIN);
        wrapStyle.setBorderLeft(BorderStyle.THIN);
        wrapStyle.setBorderRight(BorderStyle.THIN);
        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);
        // Title at row 6
        Row titleRow = sheet.createRow(6);
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY NĂM " + data.get("year"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(6, 6, 0, 8));
        // Period info at row 8
        Row periodRow = sheet.createRow(8);
        periodRow.setHeight((short)-1);
        periodRow.createCell(0).setCellValue("Năm:");
        periodRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell yearValue = periodRow.createCell(1);
        yearValue.setCellValue(safeToString(data.get("year")));
        // Table headers at row 11
        String[] headers = {"STT", "Mã GV", "Họ tên", "Tổng môn", "Hoàn thành", "Tỷ lệ", "Số thi", "Thi đạt", "Giảng thử"};
        Row headerRow = sheet.createRow(11);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        // Data rows start at row 12
        List<Map<String, Object>> teacherYearStats = (List<Map<String, Object>>) data.get("teacherYearStats");
        int dataSize = teacherYearStats != null ? teacherYearStats.size() : 0;
        for (int i = 0; i < dataSize; i++) {
            Map<String, Object> teacherStat = teacherYearStats.get(i);
            Row dataRow = sheet.createRow(12 + i);
            dataRow.setHeight((short)-1);
            Cell cell0 = dataRow.createCell(0);
            cell0.setCellValue(String.valueOf(i + 1));
            cell0.setCellStyle(dataStyle);
            Cell cell1 = dataRow.createCell(1);
            cell1.setCellValue(safeToString(teacherStat.get("teacherCode")));
            cell1.setCellStyle(dataStyle);
            Cell nameCell = dataRow.createCell(2);
            nameCell.setCellValue(safeToString(teacherStat.get("teacherName")));
            nameCell.setCellStyle(wrapStyle);
            Cell cell3 = dataRow.createCell(3);
            cell3.setCellValue(safeToString(teacherStat.get("totalSubjects")));
            cell3.setCellStyle(dataStyle);
            Cell cell4 = dataRow.createCell(4);
            cell4.setCellValue(safeToString(teacherStat.get("completedSubjects")));
            cell4.setCellStyle(dataStyle);
            Cell cell5 = dataRow.createCell(5);
            cell5.setCellValue(safeToString(teacherStat.get("completionRate")));
            cell5.setCellStyle(dataStyle);
            Cell cell6 = dataRow.createCell(6);
            cell6.setCellValue(safeToString(teacherStat.get("totalExams")));
            cell6.setCellStyle(dataStyle);
            Cell cell7 = dataRow.createCell(7);
            cell7.setCellValue(safeToString(teacherStat.get("passedExams")));
            cell7.setCellStyle(dataStyle);
            Cell cell8 = dataRow.createCell(8);
            cell8.setCellValue(safeToString(teacherStat.get("totalTrials")));
            cell8.setCellStyle(dataStyle);
        }
        // Set column widths for wrapping columns
        sheet.setColumnWidth(0, 25 * 256);
        sheet.setColumnWidth(2, 20 * 256); // Họ tên
        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 0 && i != 2) {
                sheet.autoSizeColumn(i);
            }
        }
        // Summary section start row after data + 2 rows
        int summaryStartRow = 12 + dataSize + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG KẾT NĂM");
        summaryTitleCell.setCellStyle(headerStyle);
        Cell summaryTitleCell2 = summaryTitleRow.createCell(1);
        summaryTitleCell2.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(summaryStartRow, summaryStartRow, 0, 1));

        Row totalTeachersRow = sheet.createRow(summaryStartRow + 1);
        totalTeachersRow.setHeight((short)-1);
        totalTeachersRow.createCell(0).setCellValue("Tổng số giảng viên:");
        totalTeachersRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalTeachersValue = totalTeachersRow.createCell(1);
        totalTeachersValue.setCellValue(safeToString(data.get("totalTeachers")));
        totalTeachersValue.setCellStyle(wrapStyle);
        Row totalSubjectsRow = sheet.createRow(summaryStartRow + 2);
        totalSubjectsRow.setHeight((short)-1);
        totalSubjectsRow.createCell(0).setCellValue("Tổng số môn học:");
        totalSubjectsRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalSubjectsValue = totalSubjectsRow.createCell(1);
        totalSubjectsValue.setCellValue(safeToString(data.get("totalSubjects")));
        totalSubjectsValue.setCellStyle(wrapStyle);
        Row totalCompletedRow = sheet.createRow(summaryStartRow + 3);
        totalCompletedRow.setHeight((short)-1);
        totalCompletedRow.createCell(0).setCellValue("Tổng môn hoàn thành:");
        totalCompletedRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalCompletedValue = totalCompletedRow.createCell(1);
        totalCompletedValue.setCellValue(safeToString(data.get("totalCompleted")));
        totalCompletedValue.setCellStyle(wrapStyle);
        Row avgCompletionRateRow = sheet.createRow(summaryStartRow + 4);
        avgCompletionRateRow.setHeight((short)-1);
        avgCompletionRateRow.createCell(0).setCellValue("Tỷ lệ hoàn thành trung bình:");
        avgCompletionRateRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell avgCompletionRateValue = avgCompletionRateRow.createCell(1);
        avgCompletionRateValue.setCellValue(safeToString(data.get("avgCompletionRate")) + "%");
        avgCompletionRateValue.setCellStyle(wrapStyle);
        Row totalExamsRow = sheet.createRow(summaryStartRow + 5);
        totalExamsRow.setHeight((short)-1);
        totalExamsRow.createCell(0).setCellValue("Tổng số kỳ thi:");
        totalExamsRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalExamsValue = totalExamsRow.createCell(1);
        totalExamsValue.setCellValue(safeToString(data.get("totalExams")));
        totalExamsValue.setCellStyle(wrapStyle);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateAptechReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.getSheetAt(0);
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setWrapText(true);

        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        CellStyle boldLabelStyle = workbook.createCellStyle();
        Font boldLabelFont = workbook.createFont();
        boldLabelFont.setBold(true);
        boldLabelStyle.setFont(boldLabelFont);
        boldLabelStyle.setWrapText(true);

        CellStyle boldLabelSummaryStyle = workbook.createCellStyle();
        Font boldLabelSummaryFont = workbook.createFont();
        boldLabelSummaryFont.setBold(true);
        boldLabelSummaryStyle.setFont(boldLabelSummaryFont);
        boldLabelSummaryStyle.setWrapText(true);
        boldLabelSummaryStyle.setBorderTop(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderBottom(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderLeft(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderRight(BorderStyle.THIN);

        CellStyle wrapStyle = workbook.createCellStyle();
        wrapStyle.setWrapText(true);
        wrapStyle.setBorderTop(BorderStyle.THIN);
        wrapStyle.setBorderBottom(BorderStyle.THIN);
        wrapStyle.setBorderLeft(BorderStyle.THIN);
        wrapStyle.setBorderRight(BorderStyle.THIN);

        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);

        // Title at row 6
        Row titleRow = sheet.createRow(6);
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO KẾT QUẢ TỔNG HỢP THI CHỨNG NHẬN APTECH");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(6, 6, 0, 8));

        // Period info at row 8
        Row periodRow = sheet.createRow(8);
        periodRow.setHeight((short)-1);
        periodRow.createCell(0).setCellValue("Năm:");
        periodRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell yearValue = periodRow.createCell(1);
        yearValue.setCellValue(data.get("year").toString());
        if (data.get("quarter") != null) {
            periodRow.createCell(2).setCellValue("Quý:");
            periodRow.getCell(2).setCellStyle(boldLabelStyle);
            Cell quarterValue = periodRow.createCell(3);
            quarterValue.setCellValue("Q" + data.get("quarter"));
        }

        // Table headers at row 11
        String[] headers = {"STT", "Mã GV", "Họ tên", "Môn thi", "Ngày thi", "Giờ thi", "Điểm", "Kết quả", "Lần thi"};
        Row headerRow = sheet.createRow(11);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows start at row 12
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allExams = (List<Map<String, Object>>) data.get("allExams");
        int dataSize = allExams != null ? allExams.size() : 0;
        for (int i = 0; i < dataSize; i++) {
            Map<String, Object> exam = allExams.get(i);
            if (exam == null) continue;

            Row dataRow = sheet.createRow(12 + i);
            dataRow.setHeight((short)-1);
            dataRow.createCell(0).setCellValue(String.valueOf(i + 1));
            dataRow.getCell(0).setCellStyle(dataStyle);
            dataRow.createCell(1).setCellValue(safeToString(exam.get("teacherCode")));
            dataRow.getCell(1).setCellStyle(dataStyle);
            Cell nameCell = dataRow.createCell(2);
            nameCell.setCellValue(safeToString(exam.get("teacherName")));
            nameCell.setCellStyle(wrapStyle);
            Cell subjectCell = dataRow.createCell(3);
            subjectCell.setCellValue(safeToString(exam.get("subjectName")));
            subjectCell.setCellStyle(wrapStyle);
            dataRow.createCell(4).setCellValue(safeToString(exam.get("examDate")));
            dataRow.getCell(4).setCellStyle(dataStyle);
            dataRow.createCell(5).setCellValue(safeToString(exam.get("examTime")));
            dataRow.getCell(5).setCellStyle(dataStyle);
            dataRow.createCell(6).setCellValue(safeToString(exam.get("score")));
            dataRow.getCell(6).setCellStyle(dataStyle);
            dataRow.createCell(7).setCellValue(safeToString(exam.get("result")));
            dataRow.getCell(7).setCellStyle(dataStyle);
            dataRow.createCell(8).setCellValue(safeToString(exam.get("attempt")));
            dataRow.getCell(8).setCellStyle(dataStyle);
        }

        // Set column widths for wrapping columns
        sheet.setColumnWidth(0, 25 * 256); // Summary labels
        sheet.setColumnWidth(2, 30 * 256); // Họ tên
        sheet.setColumnWidth(3, 40 * 256); // Môn thi
        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 0 && i != 2 && i != 3) {
                sheet.autoSizeColumn(i);
            }
        }

        // Summary section start row after data + 2 rows
        int summaryStartRow = 12 + dataSize + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG HỢP");
        summaryTitleCell.setCellStyle(headerStyle);
        Cell summaryTitleCell2 = summaryTitleRow.createCell(1);
        summaryTitleCell2.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(summaryStartRow, summaryStartRow, 0, 1));

        Row totalExamsRow = sheet.createRow(summaryStartRow + 1);
        totalExamsRow.setHeight((short)-1);
        totalExamsRow.createCell(0).setCellValue("Tổng số kỳ thi:");
        totalExamsRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalExamsValue = totalExamsRow.createCell(1);
        totalExamsValue.setCellValue(safeToString(data.get("totalExams")));
        totalExamsValue.setCellStyle(wrapStyle);

        Row passedExamsRow = sheet.createRow(summaryStartRow + 2);
        passedExamsRow.setHeight((short)-1);
        passedExamsRow.createCell(0).setCellValue("Số môn đạt:");
        passedExamsRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell passedExamsValue = passedExamsRow.createCell(1);
        passedExamsValue.setCellValue(safeToString(data.get("passedExams")));
        passedExamsValue.setCellStyle(wrapStyle);

        Row failedExamsRow = sheet.createRow(summaryStartRow + 3);
        failedExamsRow.setHeight((short)-1);
        failedExamsRow.createCell(0).setCellValue("Số môn không đạt:");
        failedExamsRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell failedExamsValue = failedExamsRow.createCell(1);
        long totalExams = safeLongValue(data.get("totalExams"));
        long passedExams = safeLongValue(data.get("passedExams"));
        failedExamsValue.setCellValue(String.valueOf(totalExams - passedExams));
        failedExamsValue.setCellStyle(wrapStyle);

        Row passRateRow = sheet.createRow(summaryStartRow + 4);
        passRateRow.setHeight((short)-1);
        passRateRow.createCell(0).setCellValue("Tỷ lệ đạt:");
        passRateRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell passRateValue = passRateRow.createCell(1);
        passRateValue.setCellValue(safeToString(data.get("passRate")) + "%");
        passRateValue.setCellStyle(wrapStyle);

        Row participatedTeachersRow = sheet.createRow(summaryStartRow + 5);
        participatedTeachersRow.setHeight((short)-1);
        participatedTeachersRow.createCell(0).setCellValue("Số giảng viên tham gia:");
        participatedTeachersRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell participatedTeachersValue = participatedTeachersRow.createCell(1);
        participatedTeachersValue.setCellValue(safeToString(data.get("participatedTeachers")));
        participatedTeachersValue.setCellStyle(wrapStyle);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.getSheetAt(0);
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setWrapText(true);
        CellStyle headerStyle = workbook.createCellStyle();
        Font headerFont = workbook.createFont();
        headerFont.setBold(true);
        headerFont.setFontHeightInPoints((short) 12);
        headerStyle.setFont(headerFont);
        headerStyle.setBorderTop(BorderStyle.THIN);
        headerStyle.setBorderBottom(BorderStyle.THIN);
        headerStyle.setBorderLeft(BorderStyle.THIN);
        headerStyle.setBorderRight(BorderStyle.THIN);

        CellStyle boldLabelStyle = workbook.createCellStyle();
        Font boldLabelFont = workbook.createFont();
        boldLabelFont.setBold(true);
        boldLabelStyle.setFont(boldLabelFont);
        boldLabelStyle.setWrapText(true);

        CellStyle boldLabelSummaryStyle = workbook.createCellStyle();
        Font boldLabelSummaryFont = workbook.createFont();
        boldLabelSummaryFont.setBold(true);
        boldLabelSummaryStyle.setFont(boldLabelSummaryFont);
        boldLabelSummaryStyle.setWrapText(true);
        boldLabelSummaryStyle.setBorderTop(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderBottom(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderLeft(BorderStyle.THIN);
        boldLabelSummaryStyle.setBorderRight(BorderStyle.THIN);

        CellStyle wrapStyle = workbook.createCellStyle();
        wrapStyle.setWrapText(true);
        wrapStyle.setBorderTop(BorderStyle.THIN);
        wrapStyle.setBorderBottom(BorderStyle.THIN);
        wrapStyle.setBorderLeft(BorderStyle.THIN);
        wrapStyle.setBorderRight(BorderStyle.THIN);

        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);

        // Title at row 6
        Row titleRow = sheet.createRow(6);
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO GIẢNG THỬ TỔNG HỢP");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(6, 6, 0, 7));
        // Period info at row 8
        Row periodRow = sheet.createRow(8);
        periodRow.setHeight((short)-1);
        periodRow.createCell(0).setCellValue("Năm:");
        periodRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell yearValue = periodRow.createCell(1);
        yearValue.setCellValue(safeToString(data.get("year")));
        if (data.get("quarter") != null) {
            periodRow.createCell(2).setCellValue("Quý:");
            periodRow.getCell(2).setCellStyle(boldLabelStyle);
            Cell quarterValue = periodRow.createCell(3);
            quarterValue.setCellValue("Q" + data.get("quarter"));
        }
        // Table headers at row 11
        String[] headers = {"STT", "Mã GV", "Họ tên", "Môn học", "Ngày giảng thử", "Điểm", "Kết quả", "Nhận xét"};
        Row headerRow = sheet.createRow(11);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        // Data rows start at row 12
        List<Map<String, Object>> allTrials = (List<Map<String, Object>>) data.get("allTrials");
        int dataSize = allTrials != null ? allTrials.size() : 0;
        for (int i = 0; i < dataSize; i++) {
            Map<String, Object> trial = allTrials.get(i);
            Row dataRow = sheet.createRow(12 + i);
            dataRow.setHeight((short)-1);
            dataRow.createCell(0).setCellValue(String.valueOf(i + 1));
            dataRow.getCell(0).setCellStyle(dataStyle);
            dataRow.createCell(1).setCellValue(safeToString(trial.get("teacherCode")));
            dataRow.getCell(1).setCellStyle(dataStyle);
            Cell nameCell = dataRow.createCell(2);
            nameCell.setCellValue(safeToString(trial.get("teacherName")));
            nameCell.setCellStyle(wrapStyle);
            Cell subjectCell = dataRow.createCell(3);
            subjectCell.setCellValue(safeToString(trial.get("subjectName")));
            subjectCell.setCellStyle(wrapStyle);
            dataRow.createCell(4).setCellValue(safeToString(trial.get("teachingDate")));
            dataRow.getCell(4).setCellStyle(dataStyle);
            dataRow.createCell(5).setCellValue(safeToString(trial.get("score")));
            dataRow.getCell(5).setCellStyle(dataStyle);
            dataRow.createCell(6).setCellValue(safeToString(trial.get("conclusion")));
            dataRow.getCell(6).setCellStyle(dataStyle);
            Cell commentsCell = dataRow.createCell(7);
            commentsCell.setCellValue(safeToString(trial.get("comments")));
            commentsCell.setCellStyle(wrapStyle);
        }
        // Set column widths for wrapping columns
        sheet.setColumnWidth(0, 25 * 256); // Summary labels
        sheet.setColumnWidth(2, 30 * 256); // Họ tên
        sheet.setColumnWidth(3, 40 * 256); // Môn học
        sheet.setColumnWidth(7, 50 * 256); // Nhận xét
        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 0 && i != 2 && i != 3 && i != 7) {
                sheet.autoSizeColumn(i);
            }
        }
        // Summary section start row after data + 2 rows

        int summaryStartRow = 11 + dataSize + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        summaryTitleRow.setHeight((short)-1);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG HỢP KẾT QUẢ");
        summaryTitleCell.setCellStyle(headerStyle);
        Cell summaryTitleCell2 = summaryTitleRow.createCell(1);
        summaryTitleCell2.setCellStyle(headerStyle);
        sheet.addMergedRegion(new CellRangeAddress(summaryStartRow, summaryStartRow, 0, 1));
        
        Row totalRow = sheet.createRow(summaryStartRow + 1);
        totalRow.setHeight((short)-1);
        totalRow.createCell(0).setCellValue("Tổng số buổi giảng thử:");
        totalRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalValue = totalRow.createCell(1);
        totalValue.setCellValue(safeToString(data.get("totalTrials")));
        totalValue.setCellStyle(wrapStyle);
        Row passedRow = sheet.createRow(summaryStartRow + 2);
        passedRow.setHeight((short)-1);
        passedRow.createCell(0).setCellValue("Số buổi đạt:");
        passedRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell passedValue = passedRow.createCell(1);
        passedValue.setCellValue(safeToString(data.get("passedTrials")));
        passedValue.setCellStyle(wrapStyle);
        Row passRateRow = sheet.createRow(summaryStartRow + 3);
        passRateRow.setHeight((short)-1);
        passRateRow.createCell(0).setCellValue("Tỷ lệ đạt:");
        passRateRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell passRateValue = passRateRow.createCell(1);
        passRateValue.setCellValue(safeToString(data.get("passRate")) + "%");
        passRateValue.setCellStyle(wrapStyle);
        Row participatedTeachersRow = sheet.createRow(summaryStartRow + 4);
        participatedTeachersRow.setHeight((short)-1);
        participatedTeachersRow.createCell(0).setCellValue("Số giảng viên tham gia:");
        participatedTeachersRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell participatedTeachersValue = participatedTeachersRow.createCell(1);
        participatedTeachersValue.setCellValue(safeToString(data.get("participatedTeachers")));
        participatedTeachersValue.setCellStyle(wrapStyle);
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }
    private byte[] generateDefaultReportExcel(Workbook workbook, Map<String, Object> data) throws IOException {
        Sheet sheet = workbook.getSheetAt(0);
        CellStyle titleStyle = workbook.createCellStyle();
        Font titleFont = workbook.createFont();
        titleFont.setBold(true);
        titleFont.setFontHeightInPoints((short) 16);
        titleStyle.setFont(titleFont);
        titleStyle.setAlignment(HorizontalAlignment.CENTER);
        titleStyle.setWrapText(true);
        titleStyle.setBorderTop(BorderStyle.THIN);
        titleStyle.setBorderBottom(BorderStyle.THIN);
        titleStyle.setBorderLeft(BorderStyle.THIN);
        titleStyle.setBorderRight(BorderStyle.THIN);
        CellStyle wrapStyle = workbook.createCellStyle();
        wrapStyle.setWrapText(true);
        wrapStyle.setBorderTop(BorderStyle.THIN);
        wrapStyle.setBorderBottom(BorderStyle.THIN);
        wrapStyle.setBorderLeft(BorderStyle.THIN);
        wrapStyle.setBorderRight(BorderStyle.THIN);
        // Title at row 6
        Row titleRow = sheet.createRow(6);
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("Manager Report");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(6, 6, 0, 4));
        // Report Type at row 8
        Row infoRow1 = sheet.createRow(8);
        infoRow1.setHeight((short)-1);
        infoRow1.createCell(0).setCellValue("Report Type:");
        Cell typeValue = infoRow1.createCell(1);
        typeValue.setCellValue(safeToString(data.get("reportType")));
        typeValue.setCellStyle(wrapStyle);
        // Period at row 9
        Row infoRow2 = sheet.createRow(9);
        infoRow2.setHeight((short)-1);
        infoRow2.createCell(0).setCellValue("Period:");
        Cell periodValue = infoRow2.createCell(1);
        periodValue.setCellValue(safeToString(data.get("period")));
        periodValue.setCellStyle(wrapStyle);
        // Generated At at row 10
        Row infoRow3 = sheet.createRow(10);
        infoRow3.setHeight((short)-1);
        infoRow3.createCell(0).setCellValue("Generated At:");
        Cell generatedValue = infoRow3.createCell(1);
        generatedValue.setCellValue(safeDateTimeFormat(data.get("generatedAt")));
        generatedValue.setCellStyle(wrapStyle);
        // Set reasonable column widths and auto-size where appropriate
        for (int i = 0; i < 5; i++) {
            sheet.autoSizeColumn(i);
        }
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }
    private String safeToString(Object obj) {
        return obj != null ? obj.toString() : "";
    }
    private long safeLongValue(Object obj) {
        if (obj instanceof Number) {
            return ((Number) obj).longValue();
        }
        return 0;
    }
    private List<Map<String, Object>> getSafeList(Map<String, Object> data, String key) {
        Object obj = data.get(key);
        if (obj instanceof List) {
            return (List<Map<String, Object>>) obj;
        }
        return null;
    }
    private String safeDateTimeFormat(Object obj) {
        if (obj instanceof LocalDateTime) {
            return ((LocalDateTime) obj).format(DateTimeFormatter.ISO_LOCAL_DATE_TIME);
        }
        return "";
    }

    public byte[] generateWordReport(Map<String, Object> data) throws IOException, InvalidFormatException {
        InputStream templateStream = getClass().getClassLoader().getResourceAsStream("templates/baocao-template.docx");
        if (templateStream == null) {
            throw new IOException("Template file baocao-template.docx not found");
        }
        XWPFDocument document = new XWPFDocument(templateStream);
        templateStream.close();

        String reportType = (String) data.get("reportType");
        byte[] result;

        switch (reportType) {
            case "QUARTER":
                result = generateQuarterReportWord(document, data);
                break;
            case "YEAR":
                result = generateYearReportWord(document, data);
                break;
            case "APTECH":
                result = generateAptechReportWord(document, data);
                break;
            case "TRIAL":
                result = generateTrialReportWord(document, data);
                break;
            default:
                result = generateDefaultManagerReportWord(document, data);
                break;
        }

        return result;
    }

    private byte[] generateQuarterReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY QUÝ " + data.get("quarter") + " NĂM " + data.get("year"));
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Thời gian: Quý " + data.get("quarter") + " năm " + data.get("year"));
        periodRun.addBreak();
        periodRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("THỐNG KÊ HOẠT ĐỘNG THEO GIẢNG VIÊN");
        contentRun.setBold(true);
        contentRun.addBreak();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherQuarterStats = (List<Map<String, Object>>) data.get("teacherQuarterStats");
        if (teacherQuarterStats != null && !teacherQuarterStats.isEmpty()) {
            // Create table with 7 columns
            XWPFTable table = document.createTable();
            XWPFTableRow headerRow = table.getRow(0);

            // Set header cells
            String[] headers = {"STT", "Mã GV", "Họ tên", "Số môn", "Hoàn thành", "Tỷ lệ", "Ghi chú"};
            for (int i = 0; i < headers.length; i++) {
                if (i == 0) {
                    headerRow.getCell(i).setText(headers[i]);
                } else {
                    headerRow.addNewTableCell().setText(headers[i]);
                }
                // Make header bold
                XWPFParagraph headerPara = headerRow.getCell(i).getParagraphs().get(0);
                XWPFRun headerRun = headerPara.getRuns().get(0);
                headerRun.setBold(true);
            }

            // Add data rows
            for (int i = 0; i < teacherQuarterStats.size(); i++) {
                Map<String, Object> teacher = teacherQuarterStats.get(i);
                if (teacher == null) continue;

                XWPFTableRow dataRow = table.createRow();
                dataRow.getCell(0).setText(String.valueOf(i + 1));
                dataRow.getCell(1).setText(teacher.get("teacherCode") != null ? (String) teacher.get("teacherCode") : "");
                dataRow.getCell(2).setText(teacher.get("teacherName") != null ? (String) teacher.get("teacherName") : "");
                dataRow.getCell(3).setText(teacher.get("totalSubjects") != null ? teacher.get("totalSubjects").toString() : "0");
                dataRow.getCell(4).setText(teacher.get("completedSubjects") != null ? teacher.get("completedSubjects").toString() : "0");
                dataRow.getCell(5).setText(teacher.get("completionRate") != null ? teacher.get("completionRate").toString() + "%" : "0%");
                dataRow.getCell(6).setText(teacher.get("notes") != null ? (String) teacher.get("notes") : "");
            }
        } else {
            contentRun.setText("Không có dữ liệu giảng viên trong quý này.");
            contentRun.addBreak();
        }

        XWPFParagraph summaryParagraph = document.createParagraph();
        XWPFRun summaryRun = summaryParagraph.createRun();
        summaryRun.setText("TỔNG KẾT QUÝ");
        summaryRun.setBold(true);
        summaryRun.addBreak();
        summaryRun.setText("- Tổng số giảng viên: " + data.get("totalTeachers"));
        summaryRun.addBreak();
        summaryRun.setText("- Tỷ lệ hoàn thành trung bình: " + data.get("avgCompletionRate") + "%");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateYearReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY NĂM " + data.get("year"));
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Năm: " + data.get("year"));
        periodRun.addBreak();
        periodRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("THỐNG KÊ HOẠT ĐỘNG THEO GIẢNG VIÊN");
        contentRun.setBold(true);
        contentRun.addBreak();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> teacherYearStats = (List<Map<String, Object>>) data.get("teacherYearStats");
        if (teacherYearStats != null && !teacherYearStats.isEmpty()) {
            // Create table with 9 columns
            XWPFTable table = document.createTable();
            XWPFTableRow headerRow = table.getRow(0);

            // Set header cells
            String[] headers = {"STT", "Mã GV", "Họ tên", "Tổng môn", "Hoàn thành", "Tỷ lệ", "Số thi", "Thi đạt", "Giảng thử"};
            for (int i = 0; i < headers.length; i++) {
                if (i == 0) {
                    headerRow.getCell(i).setText(headers[i]);
                } else {
                    headerRow.addNewTableCell().setText(headers[i]);
                }
                // Make header bold
                XWPFParagraph headerPara = headerRow.getCell(i).getParagraphs().get(0);
                XWPFRun headerRun = headerPara.getRuns().get(0);
                headerRun.setBold(true);
            }

            // Add data rows
            for (int i = 0; i < teacherYearStats.size(); i++) {
                Map<String, Object> teacher = teacherYearStats.get(i);
                if (teacher == null) continue;

                XWPFTableRow dataRow = table.createRow();
                dataRow.getCell(0).setText(String.valueOf(i + 1));
                dataRow.getCell(1).setText(teacher.get("teacherCode") != null ? (String) teacher.get("teacherCode") : "");
                dataRow.getCell(2).setText(teacher.get("teacherName") != null ? (String) teacher.get("teacherName") : "");
                dataRow.getCell(3).setText(teacher.get("totalSubjects") != null ? teacher.get("totalSubjects").toString() : "0");
                dataRow.getCell(4).setText(teacher.get("completedSubjects") != null ? teacher.get("completedSubjects").toString() : "0");
                dataRow.getCell(5).setText(teacher.get("completionRate") != null ? teacher.get("completionRate").toString() + "%" : "0%");
                dataRow.getCell(6).setText(teacher.get("totalExams") != null ? teacher.get("totalExams").toString() : "0");
                dataRow.getCell(7).setText(teacher.get("passedExams") != null ? teacher.get("passedExams").toString() : "0");
                dataRow.getCell(8).setText(teacher.get("totalTrials") != null ? teacher.get("totalTrials").toString() : "0");
            }
        } else {
            contentRun.setText("Không có dữ liệu giảng viên trong năm này.");
            contentRun.addBreak();
        }

        XWPFParagraph summaryParagraph = document.createParagraph();
        XWPFRun summaryRun = summaryParagraph.createRun();
        summaryRun.setText("TỔNG KẾT NĂM");
        summaryRun.setBold(true);
        summaryRun.addBreak();
        summaryRun.setText("- Tổng số giảng viên: " + data.get("totalTeachers"));
        summaryRun.addBreak();
        summaryRun.setText("- Tỷ lệ hoàn thành trung bình: " + data.get("avgCompletionRate") + "%");
        summaryRun.addBreak();
        summaryRun.setText("- Tỷ lệ thi đạt trung bình: " + data.get("avgExamPassRate") + "%");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateAptechReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO TỔNG HỢP KẾT QUẢ THI CHỨNG NHẬN APTECH");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Năm: " + data.get("year"));
        if (data.get("quarter") != null) {
            periodRun.setText(" | Quý: Q" + data.get("quarter"));
        }
        periodRun.addBreak();
        periodRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("DANH SÁCH KẾT QUẢ THI");
        contentRun.setBold(true);
        contentRun.addBreak();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allExams = (List<Map<String, Object>>) data.get("allExams");
        if (allExams != null && !allExams.isEmpty()) {
            // Create table with 9 columns
            XWPFTable table = document.createTable();
            XWPFTableRow headerRow = table.getRow(0);

            // Set header cells
            String[] headers = {"STT", "Mã GV", "Họ tên", "Môn thi", "Ngày thi", "Giờ thi", "Điểm", "Kết quả", "Lần thi"};
            for (int i = 0; i < headers.length; i++) {
                if (i == 0) {
                    headerRow.getCell(i).setText(headers[i]);
                } else {
                    headerRow.addNewTableCell().setText(headers[i]);
                }
                // Make header bold
                XWPFParagraph headerPara = headerRow.getCell(i).getParagraphs().get(0);
                XWPFRun headerRun = headerPara.getRuns().get(0);
                headerRun.setBold(true);
            }

            // Add data rows
            for (int i = 0; i < allExams.size(); i++) {
                Map<String, Object> exam = allExams.get(i);
                if (exam == null) continue;

                XWPFTableRow dataRow = table.createRow();
                dataRow.getCell(0).setText(String.valueOf(i + 1));
                dataRow.getCell(1).setText(exam.get("teacherCode") != null ? (String) exam.get("teacherCode") : "");
                dataRow.getCell(2).setText(exam.get("teacherName") != null ? (String) exam.get("teacherName") : "");
                dataRow.getCell(3).setText(exam.get("subjectName") != null ? (String) exam.get("subjectName") : "");
                dataRow.getCell(4).setText(exam.get("examDate") != null ? exam.get("examDate").toString() : "N/A");
                dataRow.getCell(5).setText(exam.get("examTime") != null ? exam.get("examTime").toString() : "N/A");
                dataRow.getCell(6).setText(exam.get("score") != null ? exam.get("score").toString() : "0");
                dataRow.getCell(7).setText(exam.get("result") != null ? (String) exam.get("result") : "");
                dataRow.getCell(8).setText(exam.get("attempt") != null ? exam.get("attempt").toString() : "1");
            }
        } else {
            String periodText = data.get("quarter") != null ?
                "quý " + data.get("quarter") + " năm " + data.get("year") :
                "năm " + data.get("year");
            contentRun.setText("Không có dữ liệu thi trong " + periodText + ".");
            contentRun.addBreak();
        }

        XWPFParagraph summaryParagraph = document.createParagraph();
        XWPFRun summaryRun = summaryParagraph.createRun();
        summaryRun.setText("TỔNG HỢP KẾT QUẢ");
        summaryRun.setBold(true);
        summaryRun.addBreak();
        summaryRun.setText("- Tổng số kỳ thi: " + data.get("totalExams"));
        summaryRun.addBreak();
        summaryRun.setText("- Số môn đạt: " + data.get("passedExams"));
        summaryRun.addBreak();
        summaryRun.setText("- Tỷ lệ đạt: " + data.get("passRate") + "%");
        summaryRun.addBreak();
        summaryRun.setText("- Số giảng viên tham gia: " + data.get("participatedTeachers"));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        XWPFParagraph titleParagraph = document.createParagraph();
        titleParagraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO GIẢNG THỬ TỔNG HỢP");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Năm: " + data.get("year"));
        if (data.get("quarter") != null) {
            periodRun.setText(" | Quý: Q" + data.get("quarter"));
        }
        periodRun.addBreak();
        periodRun.setText("Ngày tạo báo cáo: " + ((LocalDateTime) data.get("generatedAt")).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")));

        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("DANH SÁCH KẾT QUẢ GIẢNG THỬ");
        contentRun.setBold(true);
        contentRun.addBreak();

        @SuppressWarnings("unchecked")
        List<Map<String, Object>> allTrials = (List<Map<String, Object>>) data.get("allTrials");
        if (allTrials != null && !allTrials.isEmpty()) {
            // Create table with 8 columns
            XWPFTable table = document.createTable();
            XWPFTableRow headerRow = table.getRow(0);

            // Set header cells
            String[] headers = {"STT", "Mã GV", "Họ tên", "Môn học", "Ngày giảng thử", "Điểm", "Kết quả", "Nhận xét"};
            for (int i = 0; i < headers.length; i++) {
                if (i == 0) {
                    headerRow.getCell(i).setText(headers[i]);
                } else {
                    headerRow.addNewTableCell().setText(headers[i]);
                }
                // Make header bold
                XWPFParagraph headerPara = headerRow.getCell(i).getParagraphs().get(0);
                XWPFRun headerRun = headerPara.getRuns().get(0);
                headerRun.setBold(true);
            }

            // Add data rows
            for (int i = 0; i < allTrials.size(); i++) {
                Map<String, Object> trial = allTrials.get(i);
                if (trial == null) continue;

                XWPFTableRow dataRow = table.createRow();
                dataRow.getCell(0).setText(String.valueOf(i + 1));
                dataRow.getCell(1).setText(trial.get("teacherCode") != null ? (String) trial.get("teacherCode") : "");
                dataRow.getCell(2).setText(trial.get("teacherName") != null ? (String) trial.get("teacherName") : "");
                dataRow.getCell(3).setText(trial.get("subjectName") != null ? (String) trial.get("subjectName") : "");
                dataRow.getCell(4).setText(trial.get("teachingDate") != null ? trial.get("teachingDate").toString() : "N/A");
                dataRow.getCell(5).setText(trial.get("score") != null ? trial.get("score").toString() : "0");
                dataRow.getCell(6).setText(trial.get("conclusion") != null ? (String) trial.get("conclusion") : "");
                dataRow.getCell(7).setText(trial.get("comments") != null ? (String) trial.get("comments") : "");
            }
        } else {
            contentRun.setText("Không có dữ liệu giảng thử trong kỳ này.");
            contentRun.addBreak();
        }

        XWPFParagraph summaryParagraph = document.createParagraph();
        XWPFRun summaryRun = summaryParagraph.createRun();
        summaryRun.setText("TỔNG HỢP KẾT QUẢ");
        summaryRun.setBold(true);
        summaryRun.addBreak();
        summaryRun.setText("- Tổng số buổi giảng thử: " + data.get("totalTrials"));
        summaryRun.addBreak();
        summaryRun.setText("- Số buổi đạt: " + data.get("passedTrials"));
        summaryRun.addBreak();
        summaryRun.setText("- Tỷ lệ đạt: " + data.get("passRate") + "%");
        summaryRun.addBreak();
        summaryRun.setText("- Số giảng viên tham gia: " + data.get("participatedTeachers"));

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateDefaultManagerReportWord(XWPFDocument document, Map<String, Object> data) throws IOException {
        XWPFParagraph titleParagraph = document.createParagraph();
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("Manager Report");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

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
}