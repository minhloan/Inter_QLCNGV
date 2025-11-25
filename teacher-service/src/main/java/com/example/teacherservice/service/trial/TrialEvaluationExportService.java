package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialAttendeeDto;
import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.dto.trial.TrialTeachingDto;
import com.example.teacherservice.enums.TrialAttendeeRole;
import com.example.teacherservice.enums.TrialConclusion;
import com.example.teacherservice.enums.TrialStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xwpf.usermodel.*;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrialEvaluationExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");

    /**
     * BM06.39 - Phân công đánh giá giáo viên giảng thử (Word)
     */
    public byte[] generateAssignmentDocument(TrialTeachingDto trial) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/BM06.39-template.docx");

        try (InputStream is = resource.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Map<String, String> data = new HashMap<>();
            data.put("${date}", trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "................");
            data.put("${time}", trial.getTeachingTime() != null ? trial.getTeachingTime() : "................");
            data.put("${location}", trial.getLocation() != null ? trial.getLocation() : "................");
            data.put("${teacherName}", trial.getTeacherName() != null ? trial.getTeacherName() : "");
            data.put("${subjectName}", trial.getSubjectName() != null ? trial.getSubjectName() : "");
            data.put("${teachingTime}", trial.getTeachingTime() != null ? trial.getTeachingTime() : "");

            replaceTextInParagraphs(document.getParagraphs(), data);

            List<XWPFTable> tables = document.getTables();

            XWPFTable attendeeTable = findTableByHeader(tables, "HỌ TÊN");
            if (attendeeTable != null) {
                fillAttendeeTable(attendeeTable, trial.getAttendees());
            }

            XWPFTable teacherTable = findTableByHeader(tables, "MÔN DẠY");
            if (teacherTable != null) {
                fillTeacherTable(teacherTable, trial);
            }

            replaceTextInTables(tables, data);

            document.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * BM06.41 - Biên bản đánh giá giảng thử (Word)
     */
    public byte[] generateMinutesDocument(TrialTeachingDto trial) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/BM06.41-template.docx");

        try (InputStream is = resource.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            Map<String, String> data = new HashMap<>();
            data.put("${date}", trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "................");
            data.put("${time}", trial.getTeachingTime() != null ? trial.getTeachingTime() : "................");
            data.put("${location}", trial.getLocation() != null ? trial.getLocation() : "................");
            data.put("${teacherName}", trial.getTeacherName() != null ? trial.getTeacherName() : "");
            data.put("${subjectName}", trial.getSubjectName() != null ? trial.getSubjectName() : "");

            String result = "................";
            if (trial.getFinalResult() != null) {
                result = trial.getFinalResult() == TrialConclusion.PASS ? "ĐẠT" : "KHÔNG ĐẠT";
            }
            data.put("${conclusion}", result);

            // Thay thế text ở đoạn văn thường (bao gồm cả phần III. Nội dung)
            replaceTextInParagraphs(document.getParagraphs(), data);

            XWPFTable attendeeTable = findTableByHeader(document.getTables(), "HỌ TÊN");
            if (attendeeTable != null) {
                fillAttendeeTable(attendeeTable, trial.getAttendees());
            }

            fillCommentsSection(document, trial.getEvaluations());

            replaceTextInTables(document.getTables(), data);

            document.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * - Phiếu đánh giá giảng thử (Excel)
     */
    public byte[] generateEvaluationForm(TrialTeachingDto trial, TrialEvaluationDto evaluation) throws IOException {
        Workbook workbook = WorkbookFactory.create(true);
        Sheet sheet = workbook.createSheet("Phiếu đánh giá");

        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle normalStyle = createNormalStyle(workbook);
        CellStyle boldStyle = createBoldStyle(workbook);

        int rowNum = 0;

        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("PHIẾU ĐÁNH GIÁ GIẢNG THỬ");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
        titleRow.setHeightInPoints(30);

        rowNum++;

        rowNum = addExcelInfoRow(sheet, rowNum, "Giảng viên:", trial.getTeacherName() + (trial.getTeacherCode() != null ? " (" + trial.getTeacherCode() + ")" : ""), normalStyle, boldStyle);
        rowNum = addExcelInfoRow(sheet, rowNum, "Môn học:", trial.getSubjectName(), normalStyle, boldStyle);
        rowNum = addExcelInfoRow(sheet, rowNum, "Ngày giảng:", trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "", normalStyle, boldStyle);
        rowNum = addExcelInfoRow(sheet, rowNum, "Giờ giảng:", trial.getTeachingTime() != null ? trial.getTeachingTime() : "", normalStyle, boldStyle);
        rowNum = addExcelInfoRow(sheet, rowNum, "Địa điểm:", trial.getLocation() != null ? trial.getLocation() : "", normalStyle, boldStyle);

        rowNum++;

        if (evaluation != null) {
            rowNum = addExcelInfoRow(sheet, rowNum, "Người đánh giá:", evaluation.getAttendeeName() != null ? evaluation.getAttendeeName() : "", normalStyle, boldStyle);
            rowNum = addExcelInfoRow(sheet, rowNum, "Vai trò:", getRoleName(evaluation.getAttendeeRole() != null ?
                    TrialAttendeeRole.valueOf(evaluation.getAttendeeRole()) : null), normalStyle, boldStyle);
            rowNum = addExcelInfoRow(sheet, rowNum, "Điểm số:", evaluation.getScore() != null ? String.valueOf(evaluation.getScore()) : "", normalStyle, boldStyle);
            rowNum = addExcelInfoRow(sheet, rowNum, "Kết luận:", evaluation.getConclusion() == TrialConclusion.PASS ? "ĐẠT" :
                    (evaluation.getConclusion() == TrialConclusion.FAIL ? "KHÔNG ĐẠT" : ""), normalStyle, boldStyle);

            if (evaluation.getComments() != null && !evaluation.getComments().isEmpty()) {
                rowNum++;
                Row commentLabelRow = sheet.createRow(rowNum++);
                Cell commentLabelCell = commentLabelRow.createCell(0);
                commentLabelCell.setCellValue("Nhận xét:");
                commentLabelCell.setCellStyle(boldStyle);

                Row commentRow = sheet.createRow(rowNum++);
                Cell commentCell = commentRow.createCell(0);
                commentCell.setCellValue(evaluation.getComments());
                commentCell.setCellStyle(normalStyle);
                sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 0, 5));
            }
        }

        for (int i = 0; i < 6; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    /**
     * - Thống kê đánh giá GV giảng thử (Excel)
     */
    public byte[] generateStatisticsReport(List<TrialTeachingDto> trials) throws IOException {
        Workbook workbook = WorkbookFactory.create(true);
        Sheet sheet = workbook.createSheet("Thống kê");

        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle normalStyle = createNormalStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);

        int rowNum = 0;
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("THỐNG KÊ ĐÁNH GIÁ GIÁO VIÊN GIẢNG THỬ");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));
        titleRow.setHeightInPoints(30);

        rowNum++;
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"STT", "Giảng viên", "Mã GV", "Môn học", "Ngày giảng", "Điểm TB", "Kết luận", "Trạng thái", "Ghi chú"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }

        int index = 1;
        for (TrialTeachingDto trial : trials) {
            Row row = sheet.createRow(rowNum++);
            row.createCell(0).setCellValue(index++);
            row.createCell(1).setCellValue(trial.getTeacherName() != null ? trial.getTeacherName() : "");
            row.createCell(2).setCellValue(trial.getTeacherCode() != null ? trial.getTeacherCode() : "");
            row.createCell(3).setCellValue(trial.getSubjectName() != null ? trial.getSubjectName() : "");
            row.createCell(4).setCellValue(trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "");

            if (trial.getEvaluations() != null && !trial.getEvaluations().isEmpty()) {
                double avgScore = trial.getEvaluations().stream()
                        .filter(e -> e.getScore() != null)
                        .mapToInt(TrialEvaluationDto::getScore)
                        .average().orElse(0.0);
                Cell scoreCell = row.createCell(5);
                scoreCell.setCellValue(avgScore);
                scoreCell.setCellStyle(numberStyle);
            } else {
                row.createCell(5).setCellValue("-");
            }

            row.createCell(6).setCellValue(trial.getFinalResult() == TrialConclusion.PASS ? "ĐẠT" :
                    (trial.getFinalResult() == TrialConclusion.FAIL ? "KHÔNG ĐẠT" : "Chưa có"));
            row.createCell(7).setCellValue(getStatusName(trial.getStatus()));
            row.createCell(8).setCellValue(trial.getNote() != null ? trial.getNote() : "");

            for (int i = 0; i < 9; i++) {
                if (i != 5) {
                    Cell cell = row.getCell(i);
                    if (cell != null) cell.setCellStyle(normalStyle);
                }
            }
        }

        rowNum++;
        Row summaryRow = sheet.createRow(rowNum++);
        Cell summaryLabelCell = summaryRow.createCell(0);
        summaryLabelCell.setCellValue("Tổng số:");
        summaryLabelCell.setCellStyle(headerStyle);
        Cell summaryValueCell = summaryRow.createCell(1);
        summaryValueCell.setCellValue(trials.size());
        summaryValueCell.setCellStyle(headerStyle);

        for (int i = 0; i < 9; i++) {
            sheet.autoSizeColumn(i);
        }

        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    // =================================================================================
    // CÁC HÀM HỖ TRỢ XỬ LÝ WORD (HELPER METHODS)
    // =================================================================================

    /**
     * FIX: Thay vì replace từng Run, hàm này lấy toàn bộ Text của Paragraph, replace xong ghi lại từ đầu.
     * Cách này xử lý được trường hợp Word tự tách biến ${variable} thành nhiều run lẻ (${ + variable + }).
     */
    private void replaceTextInParagraphs(List<XWPFParagraph> paragraphs, Map<String, String> data) {
        for (XWPFParagraph p : paragraphs) {
            String fullText = p.getText(); // Lấy toàn bộ text gộp

            // Kiểm tra nhanh xem có placeholder nào trong dòng này không
            boolean hasMatch = false;
            for (String key : data.keySet()) {
                if (fullText.contains(key)) {
                    hasMatch = true;
                    break;
                }
            }

            if (hasMatch) {
                // 1. Lưu lại style của run đầu tiên để áp dụng lại sau khi replace
                String fontFamily = "Times New Roman";
                int fontSize = 12;
                boolean isBold = false;
                boolean isItalic = false;

                if (!p.getRuns().isEmpty()) {
                    XWPFRun firstRun = p.getRuns().get(0);
                    if (firstRun.getFontFamily() != null) fontFamily = firstRun.getFontFamily();
                    if (firstRun.getFontSize() != -1) fontSize = firstRun.getFontSize();
                    isBold = firstRun.isBold();
                    isItalic = firstRun.isItalic();
                }

                // 2. Thực hiện replace trên chuỗi full
                for (Map.Entry<String, String> entry : data.entrySet()) {
                    if (fullText.contains(entry.getKey())) {
                        fullText = fullText.replace(entry.getKey(), entry.getValue());
                    }
                }

                // 3. Xóa toàn bộ run cũ (để tránh text cũ còn sót lại)
                while (p.getRuns().size() > 0) {
                    p.removeRun(0);
                }

                // 4. Tạo run mới với text đã replace và style cũ
                XWPFRun newRun = p.createRun();
                newRun.setText(fullText);
                newRun.setFontFamily(fontFamily);
                newRun.setFontSize(fontSize);
                newRun.setBold(isBold);
                newRun.setItalic(isItalic);
            }
        }
    }

    private void replaceTextInTables(List<XWPFTable> tables, Map<String, String> data) {
        for (XWPFTable table : tables) {
            for (XWPFTableRow row : table.getRows()) {
                for (XWPFTableCell cell : row.getTableCells()) {
                    replaceTextInParagraphs(cell.getParagraphs(), data);
                }
            }
        }
    }

    private XWPFTable findTableByHeader(List<XWPFTable> tables, String headerKeyword) {
        for (XWPFTable table : tables) {
            if (!table.getRows().isEmpty()) {
                XWPFTableRow header = table.getRow(0);
                for (XWPFTableCell cell : header.getTableCells()) {
                    if (cell.getText().toUpperCase().contains(headerKeyword.toUpperCase())) {
                        return table;
                    }
                }
            }
        }
        return null;
    }

    private void fillAttendeeTable(XWPFTable table, List<TrialAttendeeDto> attendees) {
        if (attendees == null || attendees.isEmpty()) return;

        attendees.sort(Comparator.comparing((TrialAttendeeDto a) -> {
            if (a.getAttendeeRole() == TrialAttendeeRole.CHU_TOA) return 1;
            if (a.getAttendeeRole() == TrialAttendeeRole.THU_KY) return 2;
            return 3;
        }));

        int startRowIndex = 1;
        while (table.getRows().size() < startRowIndex + attendees.size()) {
            table.createRow();
        }

        for (int i = 0; i < attendees.size(); i++) {
            TrialAttendeeDto att = attendees.get(i);
            XWPFTableRow row = table.getRow(i + startRowIndex);

            styleTableCell(row.getCell(0), String.valueOf(i + 1));
            styleTableCell(row.getCell(1), att.getAttendeeName());
            styleTableCell(row.getCell(2), getRoleName(att.getAttendeeRole()));
            styleTableCell(row.getCell(3), getWorkTask(att.getAttendeeRole()));
        }

        int totalDataRows = attendees.size() + startRowIndex;
        while (table.getRows().size() > totalDataRows) {
            table.removeRow(table.getRows().size() - 1);
        }
    }

    private void fillTeacherTable(XWPFTable table, TrialTeachingDto trial) {
        if (table.getRows().size() < 2) table.createRow();
        XWPFTableRow row = table.getRow(1);

        styleTableCell(row.getCell(0), "1");
        styleTableCell(row.getCell(1), trial.getTeacherName());
        styleTableCell(row.getCell(2), trial.getSubjectName());
        styleTableCell(row.getCell(3), trial.getTeachingTime());
    }

    private void styleTableCell(XWPFTableCell cell, String text) {
        if (cell == null) return;

        cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.CENTER);

        XWPFParagraph p;
        if (!cell.getParagraphs().isEmpty()) {
            p = cell.getParagraphs().get(0);
            while (!p.getRuns().isEmpty()) {
                p.removeRun(0);
            }
        } else {
            p = cell.addParagraph();
        }

        p.setAlignment(ParagraphAlignment.CENTER);
        p.setSpacingBefore(60);
        p.setSpacingAfter(60);

        XWPFRun run = p.createRun();
        run.setText(text != null ? text : "");
        run.setFontFamily("Times New Roman");
        run.setFontSize(12);
    }

    private void fillCommentsSection(XWPFDocument document, List<TrialEvaluationDto> evaluations) {
        if (evaluations == null || evaluations.isEmpty()) return;

        XWPFParagraph targetPara = null;
        for (XWPFParagraph p : document.getParagraphs()) {
            if (p.getText().contains("IV. Góp ý") || p.getText().contains("Góp ý:")) {
                targetPara = p;
                break;
            }
        }

        if (targetPara != null) {
            int index = document.getParagraphs().indexOf(targetPara);
            if (index + 1 < document.getParagraphs().size()) {
                XWPFParagraph commentPara = document.getParagraphs().get(index + 1);
                while (!commentPara.getRuns().isEmpty()) {
                    commentPara.removeRun(0);
                }

                for (TrialEvaluationDto eval : evaluations) {
                    if (eval.getComments() != null && !eval.getComments().isEmpty()) {
                        XWPFRun run = commentPara.createRun();
                        run.setText("- " + eval.getComments());
                        run.addBreak();
                        run.setFontFamily("Times New Roman");
                        run.setFontSize(12);
                    }
                }
            }
        }
    }

    private String getWorkTask(TrialAttendeeRole role) {
        if (role == null) return "";
        switch (role) {
            case CHU_TOA: return "Đánh giá giảng thử, Chủ tọa";
            case THU_KY: return "Đánh giá giảng thử, Thư ký";
            default: return "Đánh giá giảng thử";
        }
    }

    private String getRoleName(TrialAttendeeRole role) {
        if (role == null) return "";
        switch (role) {
            case CHU_TOA: return "Chủ tọa";
            case THU_KY: return "Thư ký";
            case THANH_VIEN: return "Thành viên";
            default: return "";
        }
    }

    private String getStatusName(TrialStatus status) {
        if (status == null) return "";
        switch (status) {
            case PENDING: return "Chờ chấm";
            case REVIEWED: return "Đang chấm";
            case PASSED: return "Đạt";
            case FAILED: return "Không đạt";
            default: return "";
        }
    }

    // =================================================================================
    // CÁC HÀM HỖ TRỢ EXCEL (HELPER METHODS)
    // =================================================================================

    private int addExcelInfoRow(Sheet sheet, int rowNum, String label, String value, CellStyle normalStyle, CellStyle boldStyle) {
        Row row = sheet.createRow(rowNum++);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(boldStyle);
        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(normalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum - 1, rowNum - 1, 1, 5));
        return rowNum;
    }

    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createHeaderStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 12);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        style.setFillForegroundColor(IndexedColors.GREY_25_PERCENT.getIndex());
        style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
        return style;
    }

    private CellStyle createNormalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }

    private CellStyle createBoldStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.LEFT);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createNumberStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        style.setDataFormat(workbook.createDataFormat().getFormat("0.00"));
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }
}