package com.example.teacherservice.service.reports;

import com.example.teacherservice.model.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.openxml4j.exceptions.InvalidFormatException;
import org.apache.poi.ss.usermodel.*;
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
public class TeacherReportGeneratorService {

    public byte[] generateExcelReport(Map<String, Object> data, User teacher) throws IOException, InvalidFormatException {
        InputStream templateStream = getClass().getClassLoader().getResourceAsStream("templates/baocao-template.xlsx");
        if (templateStream == null) {
            throw new IOException("Template file baocao-template.xlsx not found");
        }
        Workbook workbook = WorkbookFactory.create(templateStream);
        templateStream.close();
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

    private byte[] generateYearReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.getSheetAt(0);
        // Insert refactored header (overwrites template header to standardize)

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


        CellStyle wrapStyle = workbook.createCellStyle();
        wrapStyle.setWrapText(true);
        wrapStyle.setBorderTop(BorderStyle.THIN);
        wrapStyle.setBorderBottom(BorderStyle.THIN);
        wrapStyle.setBorderLeft(BorderStyle.THIN);
        wrapStyle.setBorderRight(BorderStyle.THIN);

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

        CellStyle dataStyle = workbook.createCellStyle();
        dataStyle.setBorderTop(BorderStyle.THIN);
        dataStyle.setBorderBottom(BorderStyle.THIN);
        dataStyle.setBorderLeft(BorderStyle.THIN);
        dataStyle.setBorderRight(BorderStyle.THIN);

        // Title at row 6 (after header)
        Row titleRow = sheet.createRow(6);
        titleRow.setHeight((short)-1); // Auto height
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY NĂM " + data.get("year"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(6, 6, 0, 7));

        // Period info at row 8
        Row periodRow = sheet.createRow(8);
        periodRow.setHeight((short)-1);
        Cell periodLabel = periodRow.createCell(0);
        periodLabel.setCellValue("Năm:");
        periodLabel.setCellStyle(boldLabelStyle);
        Cell periodValue = periodRow.createCell(1);
        periodValue.setCellValue(data.get("year").toString());

        // Teacher info at row 9
        Row teacherRow = sheet.createRow(9);
        teacherRow.setHeight((short)-1);
        teacherRow.createCell(0).setCellValue("Mã giảng viên:");
        teacherRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell codeValue = teacherRow.createCell(1);
        codeValue.setCellValue(safeTeacherCode(teacher));
        teacherRow.createCell(2).setCellValue("Họ tên giảng viên:");
        teacherRow.getCell(2).setCellStyle(boldLabelStyle);
        Cell nameValue = teacherRow.createCell(3);
        nameValue.setCellValue(safeTeacherName(teacher));
    

        // Table headers at row 11 (shifted up since teacher info in header)
        String[] headers = {"STT", "Quý", "Tổng môn", "Hoàn thành", "Tỷ lệ", "Ghi chú"};
        Row headerRow = sheet.createRow(11);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows start at row 12
        List<Map<String, Object>> quarterlyStats = getSafeList(data, "quarterlyStats");
        int dataSize = quarterlyStats != null ? quarterlyStats.size() : 0;
        for (int i = 0; i < dataSize; i++) {
            Map<String, Object> quarter = quarterlyStats.get(i);
            Row dataRow = sheet.createRow(12 + i);
            dataRow.setHeight((short)-1);
            Cell sttCell = dataRow.createCell(0);
            sttCell.setCellValue(String.valueOf(i + 1));
            sttCell.setCellStyle(wrapStyle);
            Cell quarterCell = dataRow.createCell(1);
            quarterCell.setCellValue("Q" + safeToString(quarter.get("quarter")));
            quarterCell.setCellStyle(wrapStyle);
            Cell totalCell = dataRow.createCell(2);
            totalCell.setCellValue(safeToString(quarter.get("totalSubjects")));
            totalCell.setCellStyle(wrapStyle);
            Cell completedCell = dataRow.createCell(3);
            completedCell.setCellValue(safeToString(quarter.get("completedSubjects")));
            completedCell.setCellStyle(wrapStyle);
            long total = safeLongValue(quarter.get("totalSubjects"));
            
            long completed = safeLongValue(quarter.get("completedSubjects"));
            double rate = total > 0 ? Math.round((double) completed / total * 10000.0) / 100.0 : 0.0;
            Cell rateCell = dataRow.createCell(4);
            rateCell.setCellValue(rate + "%");
            rateCell.setCellStyle(wrapStyle);
            Cell notesCell = dataRow.createCell(5);
            notesCell.setCellValue(safeToString(quarter.get("notes")));
            notesCell.setCellStyle(wrapStyle);
        }



        // Set column widths for wrapping columns
        sheet.setColumnWidth(5, 40 * 256); // Ghi chú

        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 5) {
                sheet.autoSizeColumn(i);
            }
        }

        // Summary section start row after data + 2 rows
        int summaryStartRow = 12 + dataSize + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        summaryTitleRow.setHeight((short)-1);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG KẾT NĂM");
        summaryTitleCell.setCellStyle(headerStyle);
        Cell summaryTitleCell2 = summaryTitleRow.createCell(1);
        summaryTitleCell2.setCellStyle(headerStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(summaryStartRow, summaryStartRow, 0, 1));

        Row totalRow = sheet.createRow(summaryStartRow + 1);
        totalRow.setHeight((short)-1);
        totalRow.createCell(0).setCellValue("Tổng số môn:");
        totalRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalValue = totalRow.createCell(1);
        totalValue.setCellValue(safeToString(data.get("totalRegistrations")));
        totalValue.setCellStyle(wrapStyle);

        Row completedRow = sheet.createRow(summaryStartRow + 2);
        completedRow.setHeight((short)-1);
        completedRow.createCell(0).setCellValue("Số môn hoàn thành:");
        completedRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell completedValue = completedRow.createCell(1);
        completedValue.setCellValue(safeToString(data.get("completedRegistrations")));
        completedValue.setCellStyle(wrapStyle);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateQuarterReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
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
        titleCell.setCellValue("BÁO CÁO TỔNG HỢP HOẠT ĐỘNG GIẢNG DẠY QUÝ " + data.get("quarter") + " NĂM " + data.get("year"));
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(6, 6, 0, 7));

        // Period info at row 8
        Row periodRow = sheet.createRow(8);
        periodRow.setHeight((short)-1);
        periodRow.createCell(0).setCellValue("Thời gian:");
        periodRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell periodValue = periodRow.createCell(1);
        periodValue.setCellValue("Quý " + data.get("quarter") + " năm " + data.get("year"));

        // Teacher info at row 9
        Row teacherRow = sheet.createRow(9);
        teacherRow.setHeight((short)-1);
        teacherRow.createCell(0).setCellValue("Mã giảng viên:");
        teacherRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell codeValue = teacherRow.createCell(1);
        codeValue.setCellValue(safeTeacherCode(teacher));
        teacherRow.createCell(2).setCellValue("Họ tên giảng viên:");
        teacherRow.getCell(2).setCellStyle(boldLabelStyle);
        Cell nameValue = teacherRow.createCell(3);
        nameValue.setCellValue(safeTeacherName(teacher));
     

        // Table headers at row 11
        String[] headers = {"STT", "Mã GV", "Môn học", "Chương Trình", "Trạng thái", "Ghi chú"};
        Row headerRow = sheet.createRow(11);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows start at row 12
        List<Map<String, Object>> subjects = getSafeList(data, "subjects");
        int dataSize = subjects != null ? subjects.size() : 0;
        for (int i = 0; i < dataSize; i++) {
            Map<String, Object> subject = subjects.get(i);
            Row dataRow = sheet.createRow(12 + i);
            dataRow.setHeight((short)-1);
            Cell sttCell = dataRow.createCell(0);
            sttCell.setCellValue(String.valueOf(i + 1));
            sttCell.setCellStyle(wrapStyle);
            Cell codeCell = dataRow.createCell(1);
            codeCell.setCellValue(teacher.getTeacherCode());
            codeCell.setCellStyle(wrapStyle);
            Cell subjectCell = dataRow.createCell(2);
            subjectCell.setCellValue(safeToString(subject.get("subjectName")));
            subjectCell.setCellStyle(wrapStyle);
            Cell programCell = dataRow.createCell(3);
            programCell.setCellValue(safeToString(subject.get("programName")));
            programCell.setCellStyle(wrapStyle);
            Cell statusCell = dataRow.createCell(4);
            statusCell.setCellValue(safeToString(subject.get("status")));
            statusCell.setCellStyle(wrapStyle);
            Cell notesCell = dataRow.createCell(5);
            notesCell.setCellValue(safeToString(subject.get("notes")));
            notesCell.setCellStyle(wrapStyle);
        }



        // Set column widths for wrapping columns
        sheet.setColumnWidth(2, 30 * 256); // Môn học
        sheet.setColumnWidth(3, 20 * 256);  // Chương Trình
        sheet.setColumnWidth(4, 18 * 256); // Trạng thái
        sheet.setColumnWidth(6, 40 * 256); // Ghi chú

        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 2 && i != 3 && i != 4 && i != 6) {
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
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(summaryStartRow, summaryStartRow, 0, 1));

        Row totalRow = sheet.createRow(summaryStartRow + 1);
        totalRow.setHeight((short)-1);
        totalRow.createCell(0).setCellValue("Tổng số môn:");
        totalRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalValue = totalRow.createCell(1);
        totalValue.setCellValue(safeToString(data.get("totalSubjects")));
        totalValue.setCellStyle(wrapStyle);

        Row completedRow = sheet.createRow(summaryStartRow + 2);
        completedRow.setHeight((short)-1);
        completedRow.createCell(0).setCellValue("Số môn hoàn thành:");
        completedRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell completedValue = completedRow.createCell(1);
        completedValue.setCellValue(safeToString(data.get("completedSubjects")));
        completedValue.setCellStyle(wrapStyle);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateAptechReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.getSheetAt(0);
        // Insert refactored header

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

        // Title at row 6
        Row titleRow = sheet.createRow(6);
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO KẾT QUẢ THI CHỨNG NHẬN APTECH CÁ NHÂN");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(6, 6, 0, 7));

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

        // Teacher info at row 9
        Row teacherRow = sheet.createRow(9);
        teacherRow.setHeight((short)-1);
        teacherRow.createCell(0).setCellValue("Mã giảng viên:");
        teacherRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell codeValue = teacherRow.createCell(1);
        codeValue.setCellValue(safeTeacherCode(teacher));
       
        teacherRow.createCell(2).setCellValue("Họ tên giảng viên:");
        teacherRow.getCell(2).setCellStyle(boldLabelStyle);
        Cell nameValue = teacherRow.createCell(3);
        nameValue.setCellValue(safeTeacherName(teacher));
       

        // Table headers at row 11
        String[] headers = {"STT", "Họ tên", "Mã GV", "Môn thi", "Ngày thi", "Điểm", "Kết quả", "Lần thi"};
        Row headerRow = sheet.createRow(11);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows start at row 12
        List<Map<String, Object>> exams = getSafeList(data, "exams");
        int dataSize = exams != null ? exams.size() : 0;
        String teacherName = safeTeacherName(teacher);
        for (int i = 0; i < dataSize; i++) {
            Map<String, Object> exam = exams.get(i);
            Row row = sheet.createRow(12 + i);
            row.setHeight((short)-1);
            Cell sttCell = row.createCell(0);
            sttCell.setCellValue(String.valueOf(i + 1));
            sttCell.setCellStyle(wrapStyle);
            Cell nameCell = row.createCell(1);
            nameCell.setCellValue(teacherName);
            nameCell.setCellStyle(wrapStyle);
            Cell codeCell = row.createCell(2);
            codeCell.setCellValue(teacher.getTeacherCode());
            codeCell.setCellStyle(wrapStyle);
            Cell subjectCell = row.createCell(3);
            subjectCell.setCellValue(safeToString(exam.get("subjectName")));
            subjectCell.setCellStyle(wrapStyle);
            Cell dateCell = row.createCell(4);
            dateCell.setCellValue(safeToString(exam.get("examDate")));
            dateCell.setCellStyle(wrapStyle);
            Cell scoreCell = row.createCell(5);
            scoreCell.setCellValue(safeToString(exam.get("score")));
            scoreCell.setCellStyle(wrapStyle);
            Cell resultCell = row.createCell(6);
            resultCell.setCellValue(safeToString(exam.get("result")));
            resultCell.setCellStyle(wrapStyle);
            Cell attemptCell = row.createCell(7);
            attemptCell.setCellValue(safeToString(exam.get("attempt")));
            attemptCell.setCellStyle(wrapStyle);
        }



        // Set column widths for wrapping columns
        sheet.setColumnWidth(1, 25 * 256); // Họ tên
        sheet.setColumnWidth(3, 30 * 256); // Môn thi

        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 1 && i != 3) {
                sheet.autoSizeColumn(i);
            }
        }

        // Summary section start row after data + 2 rows
        int summaryStartRow = 12 + dataSize + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG HỢP KẾT QUẢ");
         summaryTitleCell.setCellStyle(headerStyle);
        Cell summaryTitleCell2 = summaryTitleRow.createCell(1);
        summaryTitleCell2.setCellStyle(headerStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(summaryStartRow, summaryStartRow, 0, 1));

        Row totalExamsRow = sheet.createRow(summaryStartRow + 1);
        totalExamsRow.setHeight((short)-1);
        totalExamsRow.createCell(0).setCellValue("Tổng số môn thi:");
        totalExamsRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell totalExamsValue = totalExamsRow.createCell(1);
        totalExamsValue.setCellValue(safeToString(data.get("totalExams")));
        totalExamsValue.setCellStyle(wrapStyle);

        Row passedRow = sheet.createRow(summaryStartRow + 2);
        passedRow.setHeight((short)-1);
        passedRow.createCell(0).setCellValue("Số môn đạt:");
        passedRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell passedValue = passedRow.createCell(1);
        passedValue.setCellValue(safeToString(data.get("passedExams")));
        passedValue.setCellStyle(wrapStyle);

        Row failedRow = sheet.createRow(summaryStartRow + 3);
        failedRow.setHeight((short)-1);
        failedRow.createCell(0).setCellValue("Số môn không đạt:");
        failedRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell failedValue = failedRow.createCell(1);
        failedValue.setCellValue(String.valueOf(safeLongValue(data.get("totalExams")) - safeLongValue(data.get("passedExams"))));
        failedValue.setCellStyle(wrapStyle);

        Row rateRow = sheet.createRow(summaryStartRow + 4);
        rateRow.setHeight((short)-1);
        rateRow.createCell(0).setCellValue("Tỷ lệ đạt:");
        rateRow.getCell(0).setCellStyle(boldLabelSummaryStyle);   
        Cell rateValue = rateRow.createCell(1);
        rateValue.setCellValue(safeToString(data.get("passRate")) + "%");
        rateValue.setCellStyle(wrapStyle);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.getSheetAt(0);
        // Insert refactored header

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

       
        // Title at row 6
        Row titleRow = sheet.createRow(6);
        titleRow.setHeight((short)-1);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("BÁO CÁO KẾT QUẢ GIẢNG THỬ CÁ NHÂN");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(6, 6, 0, 6));

        // Period info at row 8
        Row periodRow = sheet.createRow(8);
        periodRow.setHeight((short)-1);
        periodRow.createCell(0).setCellValue("Năm:");
        periodRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell yearValue = periodRow.createCell(1);
        yearValue.setCellValue(safeToString(data.get("year")));

        // Teacher info at row 9
        Row teacherRow = sheet.createRow(9);
        teacherRow.setHeight((short)-1);
        teacherRow.createCell(0).setCellValue("Mã giảng viên:");
        teacherRow.getCell(0).setCellStyle(boldLabelStyle);
        Cell codeValue = teacherRow.createCell(1);
        codeValue.setCellValue(safeTeacherCode(teacher));

        teacherRow.createCell(2).setCellValue("Họ tên giảng viên:");
        teacherRow.getCell(2).setCellStyle(boldLabelStyle);
        Cell nameValue = teacherRow.createCell(3);
        nameValue.setCellValue(safeTeacherName(teacher));


        // Table headers at row 11
        String[] headers = {"STT", "Môn học", "Ngày giảng thử", "Địa điểm", "Điểm", "Kết quả", "Nhận xét"};
        Row headerRow = sheet.createRow(11);
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        // Data rows start at row 12
        List<Map<String, Object>> trials = getSafeList(data, "trials");
        int dataSize = trials != null ? trials.size() : 0;
        for (int i = 0; i < dataSize; i++) {
            Map<String, Object> trial = trials.get(i);
            Row row = sheet.createRow(12 + i);
            row.setHeight((short)-1);
            Cell sttCell = row.createCell(0);
            sttCell.setCellValue(String.valueOf(i + 1));
            sttCell.setCellStyle(wrapStyle);
            Cell subjectCell = row.createCell(1);
            subjectCell.setCellValue(safeToString(trial.get("subjectName")));
            subjectCell.setCellStyle(wrapStyle);
            Cell dateCell = row.createCell(2);
            dateCell.setCellValue(safeToString(trial.get("teachingDate")));
            dateCell.setCellStyle(wrapStyle);
            Cell locationCell = row.createCell(3);
            locationCell.setCellValue(safeToString(trial.get("location")));
            locationCell.setCellStyle(wrapStyle);
            Cell scoreCell = row.createCell(4);
            scoreCell.setCellValue(safeToString(trial.get("score")));
            scoreCell.setCellStyle(wrapStyle);
            Cell conclusionCell = row.createCell(5);
            conclusionCell.setCellValue(safeToString(trial.get("conclusion")));
            conclusionCell.setCellStyle(wrapStyle);
            Cell commentsCell = row.createCell(6);
            commentsCell.setCellValue(safeToString(trial.get("comments")));
            commentsCell.setCellStyle(wrapStyle);
        }



        // Set column widths for wrapping columns
        sheet.setColumnWidth(1, 30 * 256); // Môn học
        sheet.setColumnWidth(3, 20 * 256); // Địa điểm
        sheet.setColumnWidth(6, 50 * 256); // Nhận xét

        // Auto-size other columns
        for (int i = 0; i < headers.length; i++) {
            if (i != 1 && i != 3 && i != 6) {
                sheet.autoSizeColumn(i);
            }
        }

        // Summary section start row after data + 2 rows
        int summaryStartRow = 12 + dataSize + 2;
        Row summaryTitleRow = sheet.createRow(summaryStartRow);
        summaryTitleRow.setHeight((short)-1);
        Cell summaryTitleCell = summaryTitleRow.createCell(0);
        summaryTitleCell.setCellValue("TỔNG HỢP KẾT QUẢ");
         summaryTitleCell.setCellStyle(headerStyle);
        Cell summaryTitleCell2 = summaryTitleRow.createCell(1);
        summaryTitleCell2.setCellStyle(headerStyle);
        sheet.addMergedRegion(new org.apache.poi.ss.util.CellRangeAddress(summaryStartRow, summaryStartRow, 0, 1));

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

        Row failedRow = sheet.createRow(summaryStartRow + 3);
        failedRow.setHeight((short)-1);
        failedRow.createCell(0).setCellValue("Số buổi không đạt:");
        failedRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell failedValue = failedRow.createCell(1);
        failedValue.setCellValue(String.valueOf(safeLongValue(data.get("totalTrials")) - safeLongValue(data.get("passedTrials"))));
        failedValue.setCellStyle(wrapStyle);

        Row rateRow = sheet.createRow(summaryStartRow + 4);
        rateRow.setHeight((short)-1);
        rateRow.createCell(0).setCellValue("Tỷ lệ đạt:");
        rateRow.getCell(0).setCellStyle(boldLabelSummaryStyle);
        Cell rateValue = rateRow.createCell(1);
        rateValue.setCellValue(safeToString(data.get("passRate")) + "%");
        rateValue.setCellStyle(wrapStyle);

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    private byte[] generateDefaultReportExcel(Workbook workbook, Map<String, Object> data, User teacher) throws IOException {
        Sheet sheet = workbook.createSheet("Report");
        // Insert header if needed, but for default, keep simple

        CellStyle wrapStyle = workbook.createCellStyle();
        wrapStyle.setWrapText(true);
        wrapStyle.setBorderTop(BorderStyle.THIN);
        wrapStyle.setBorderBottom(BorderStyle.THIN);
        wrapStyle.setBorderLeft(BorderStyle.THIN);
        wrapStyle.setBorderRight(BorderStyle.THIN);

        // Create header row
        Row headerRow = sheet.createRow(0);
        headerRow.setHeight((short)-1);
        headerRow.createCell(0).setCellValue("Report Type");
        headerRow.createCell(1).setCellValue("Teacher");
        headerRow.createCell(2).setCellValue("Year");
        headerRow.createCell(3).setCellValue("Quarter");
        headerRow.createCell(4).setCellValue("Generated At");

        // Create data row
        Row dataRow = sheet.createRow(1);
        dataRow.setHeight((short)-1);
        Cell typeCell = dataRow.createCell(0);
        typeCell.setCellValue(safeToString(data.get("reportType")));
        typeCell.setCellStyle(wrapStyle);
        Cell teacherCell = dataRow.createCell(1);
        teacherCell.setCellValue(safeTeacherName(teacher));
        teacherCell.setCellStyle(wrapStyle);
        Cell yearCell = dataRow.createCell(2);
        yearCell.setCellValue(safeToString(data.get("year")));
        yearCell.setCellStyle(wrapStyle);
        Cell quarterCell = dataRow.createCell(3);
        quarterCell.setCellValue(safeToString(data.get("quarter")));
        quarterCell.setCellStyle(wrapStyle);
        Cell generatedCell = dataRow.createCell(4);
        generatedCell.setCellValue(safeDateTimeFormat(data.get("generatedAt")));
        generatedCell.setCellStyle(wrapStyle);

        // Set reasonable column widths and auto-size where appropriate
        for (int i = 0; i < 5; i++) {
            sheet.setColumnWidth(i, 30 * 256);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    public byte[] generateWordReport(Map<String, Object> data, User teacher) throws IOException, InvalidFormatException {
        InputStream templateStream = getClass().getClassLoader().getResourceAsStream("templates/baocao-template.docx");
        if (templateStream == null) {
            throw new IOException("Template file baocao-template.docx not found");
        }
        XWPFDocument document = new XWPFDocument(templateStream);
        templateStream.close();

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
        teacherRun.setText("Giảng viên: " + teacher.getUsername());
        teacherRun.addBreak();
        teacherRun.setText("Mã giảng viên: " + teacher.getTeacherCode());
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

        // Create table for subjects
        XWPFTable table = document.createTable();
        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        headerRow.getCell(0).setText("STT");
        headerRow.addNewTableCell().setText("Môn học");
        headerRow.addNewTableCell().setText("Chương Trình");

        // Get actual subjects data from database
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> subjects = (List<Map<String, Object>>) data.get("subjects");
        if (subjects != null && !subjects.isEmpty()) {
            for (int i = 0; i < subjects.size(); i++) {
                Map<String, Object> subject = subjects.get(i);
                XWPFTableRow row = table.createRow();
                row.getCell(0).setText(String.valueOf(i + 1));
                row.getCell(1).setText(safeToString(subject.get("subjectName")));
                row.getCell(2).setText(safeToString(subject.get("programName")));
            }
        } else {
            // Fallback if no data
            XWPFTableRow row = table.createRow();
            row.getCell(0).setText("1");
            row.getCell(1).setText("Không có dữ liệu môn học trong quý này.");
            row.getCell(2).setText("");
        }

        // Summary section in a new paragraph after the table
        XWPFParagraph summaryParagraph = document.createParagraph();
        XWPFRun summaryRun = summaryParagraph.createRun();
        summaryRun.setText("II. KẾT QUẢ ĐẠT ĐƯỢC");
        summaryRun.setBold(true);
        summaryRun.addBreak();

        summaryRun.setText("- Tổng số môn học: " + data.get("totalSubjects") + " môn");
        summaryRun.addBreak();
        summaryRun.setText("- Số môn hoàn thành: " + data.get("completedSubjects") + " môn");
        summaryRun.addBreak();
        summaryRun.setText("- Số môn đang thực hiện: " + (((Number) data.get("totalSubjects")).longValue() - ((Number) data.get("completedSubjects")).longValue()) + " môn");
        summaryRun.addBreak();
        long total = ((Number) data.get("totalSubjects")).longValue();
        long completed = ((Number) data.get("completedSubjects")).longValue();
        double rate = total > 0 ? Math.round((double) completed / total * 10000.0) / 100.0 : 0.0;
        summaryRun.setText("- Tỷ lệ hoàn thành: " + rate + "%");

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
        teacherRun.setText("Giảng viên: " + teacher.getUsername());
        teacherRun.addBreak();
        teacherRun.setText("Mã giảng viên: " + teacher.getTeacherCode());
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
        titleRun.setText("BÁO CÁO KẾT QUẢ THI CHỨNG NHẬN APTECH CÁ NHÂN");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        XWPFParagraph periodParagraph = document.createParagraph();
        XWPFRun periodRun = periodParagraph.createRun();
        periodRun.setText("Năm " + data.get("year") + (data.get("quarter") != null ? " - Quý " + data.get("quarter") : ""));
        periodRun.setBold(true);

        // Teacher info
        XWPFParagraph teacherParagraph = document.createParagraph();
        XWPFRun teacherRun = teacherParagraph.createRun();
        teacherRun.setText("Giảng viên: " + teacher.getUsername());
        teacherRun.addBreak();
        teacherRun.setText("Mã giảng viên: " + teacher.getTeacherCode());

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("DANH SÁCH CÁC MÔN ĐÃ THI:");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Create table for exams
        XWPFTable table = document.createTable();
        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        headerRow.getCell(0).setText("STT");
        headerRow.addNewTableCell().setText("Môn thi");
        headerRow.addNewTableCell().setText("Ngày thi");
        headerRow.addNewTableCell().setText("Điểm");
        headerRow.addNewTableCell().setText("Kết quả");
        headerRow.addNewTableCell().setText("Lần thi");

        // Get actual exam data from database
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> exams = (List<Map<String, Object>>) data.get("exams");
        if (exams != null && !exams.isEmpty()) {
            for (int i = 0; i < exams.size(); i++) {
                Map<String, Object> exam = exams.get(i);
                XWPFTableRow row = table.createRow();
                row.getCell(0).setText(String.valueOf(i + 1));
                row.getCell(1).setText(safeToString(exam.get("subjectName")));
                row.getCell(2).setText(exam.get("examDate") != null ? exam.get("examDate").toString() : "N/A");
                row.getCell(3).setText(exam.get("score") != null ? exam.get("score").toString() : "0");
                row.getCell(4).setText(safeToString(exam.get("result")));
                row.getCell(5).setText(exam.get("attempt") != null ? exam.get("attempt").toString() : "1");
            }
        } else {
            // Fallback if no exam data
            XWPFTableRow row = table.createRow();
            row.getCell(0).setText("1");
            row.getCell(1).setText("Không có dữ liệu kỳ thi Aptech.");
            row.getCell(2).setText("");
            row.getCell(3).setText("");
            row.getCell(4).setText("");
            row.getCell(5).setText("");
        }

        // Summary section in a new paragraph after the table
        XWPFParagraph summaryParagraph = document.createParagraph();
        XWPFRun summaryRun = summaryParagraph.createRun();
        summaryRun.setText("TỔNG HỢP KẾT QUẢ");
        summaryRun.setBold(true);
        summaryRun.addBreak();

        summaryRun.setText("Tổng số môn thi: " + data.get("totalExams") + " môn");
        summaryRun.addBreak();
        summaryRun.setText("Số môn đạt: " + data.get("passedExams") + " môn");
        summaryRun.addBreak();
        summaryRun.setText("Số môn không đạt: " + (String.valueOf((Long) data.get("totalExams") - (Long) data.get("passedExams"))) + " môn");
        summaryRun.addBreak();
        summaryRun.setText("Tỷ lệ đạt: " + data.get("passRate") + "%");

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    private byte[] generateTrialReportWord(XWPFDocument document, Map<String, Object> data, User teacher) throws IOException {
        // Title
        XWPFParagraph titleParagraph = document.createParagraph();
        titleParagraph.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun = titleParagraph.createRun();
        titleRun.setText("BÁO CÁO KẾT QUẢ GIẢNG THỬ CÁ NHÂN");
        titleRun.setBold(true);
        titleRun.setFontSize(16);

        // Teacher info
        XWPFParagraph teacherParagraph = document.createParagraph();
        XWPFRun teacherRun = teacherParagraph.createRun();
        teacherRun.setText("Giảng viên: " + teacher.getUsername());
        teacherRun.addBreak();
        teacherRun.setText("Mã giảng viên: " + teacher.getTeacherCode());

        // Content
        XWPFParagraph contentParagraph = document.createParagraph();
        XWPFRun contentRun = contentParagraph.createRun();
        contentRun.setText("DANH SÁCH CÁC BUỔI GIẢNG THỬ:");
        contentRun.setBold(true);
        contentRun.addBreak();

        // Create table for trials
        XWPFTable table = document.createTable();
        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        headerRow.getCell(0).setText("STT");
        headerRow.addNewTableCell().setText("Môn học");
        headerRow.addNewTableCell().setText("Ngày giảng thử");
        headerRow.addNewTableCell().setText("Địa điểm");
        headerRow.addNewTableCell().setText("Điểm");
        headerRow.addNewTableCell().setText("Kết quả");
        headerRow.addNewTableCell().setText("Nhận xét");

        // Get actual trial data from database
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> trials = (List<Map<String, Object>>) data.get("trials");
        if (trials != null && !trials.isEmpty()) {
            for (int i = 0; i < trials.size(); i++) {
                Map<String, Object> trial = trials.get(i);
                XWPFTableRow row = table.createRow();
                row.getCell(0).setText(String.valueOf(i + 1));
                row.getCell(1).setText(safeToString(trial.get("subjectName")));
                row.getCell(2).setText(trial.get("teachingDate") != null ? trial.get("teachingDate").toString() : "N/A");
                row.getCell(3).setText(safeToString(trial.get("location")));
                row.getCell(4).setText(trial.get("score") != null ? trial.get("score").toString() : "0");
                row.getCell(5).setText(safeToString(trial.get("conclusion")));
                row.getCell(6).setText(safeToString(trial.get("comments")));
            }
        } else {
            // Fallback if no trial data
            XWPFTableRow row = table.createRow();
            row.getCell(0).setText("1");
            row.getCell(1).setText("Không có dữ liệu buổi giảng thử.");
            row.getCell(2).setText("");
            row.getCell(3).setText("");
            row.getCell(4).setText("");
            row.getCell(5).setText("");
            row.getCell(6).setText("");
        }

        // Summary section in a new paragraph after the table
        XWPFParagraph summaryParagraph = document.createParagraph();
        XWPFRun summaryRun = summaryParagraph.createRun();
        summaryRun.setText("TỔNG HỢP");
        summaryRun.setBold(true);
        summaryRun.addBreak();

        summaryRun.setText("Tổng số buổi giảng thử: " + data.get("totalTrials") + " buổi");
        summaryRun.addBreak();
        summaryRun.setText("Số buổi đạt: " + data.get("passedTrials") + " buổi");
        summaryRun.addBreak();
        summaryRun.setText("Tỷ lệ đạt: " + data.get("passRate") + "%");

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


    private String safeToString(Object obj) {
        return obj != null ? obj.toString() : "";
    }

    private long safeLongValue(Object obj) {
        if (obj instanceof Number) {
            return ((Number) obj).longValue();
        }
        try {
            return Long.parseLong(safeToString(obj));
        } catch (Exception e) {
            return 0L;
        }
    }

    @SuppressWarnings("unchecked")
    private List<Map<String, Object>> getSafeList(Map<String, Object> map, String key) {
        if (map == null) return null;
        Object value = map.get(key);
        if (value instanceof List<?>) {
            return (List<Map<String, Object>>) value;
        }
        return null;
    }

    private String safeTeacherName(User teacher) {
        if (teacher == null) return "";
        return teacher.getUsername() != null ? teacher.getUsername() : (teacher.getId() != null ? teacher.getId() : "");
    }

    private String safeTeacherCode(User teacher) {
        if (teacher == null) return "";
        if (teacher.getUserDetails() != null && teacher.getUserDetails().getTeacherCode() != null) {
            return teacher.getUserDetails().getTeacherCode();
        }
        return teacher.getId() != null ? teacher.getTeacherCode() : "";
    }

    private String safeDateTimeFormat(Object obj) {
        if (obj instanceof LocalDateTime) {
            return ((LocalDateTime) obj).format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm"));
        }
        return "";
    }

    private float sum(float[] array) {
        float total = 0;
        for (float value : array) {
            total += value;
        }
        return total;
    }
}