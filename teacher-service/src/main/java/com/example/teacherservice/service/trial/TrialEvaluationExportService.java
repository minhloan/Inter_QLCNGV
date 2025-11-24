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
     * Load từ Template: templates/BM06.39-template.docx
     */
    public byte[] generateAssignmentDocument(TrialTeachingDto trial) throws IOException {
        // 1. Load file mẫu
        ClassPathResource resource = new ClassPathResource("templates/BM06.39-template.docx");

        try (InputStream is = resource.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            // 2. Chuẩn bị dữ liệu thay thế các biến đơn (${date}, ${time}...)
            Map<String, String> data = new HashMap<>();
            data.put("${date}", trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "................");
            data.put("${time}", trial.getTeachingTime() != null ? trial.getTeachingTime() : "................");
            data.put("${location}", trial.getLocation() != null ? trial.getLocation() : "................");
            data.put("${teacherName}", trial.getTeacherName() != null ? trial.getTeacherName() : "");
            data.put("${subjectName}", trial.getSubjectName() != null ? trial.getSubjectName() : "");
            data.put("${teachingTime}", trial.getTeachingTime() != null ? trial.getTeachingTime() : "");

            // 3. Thay thế text trong các đoạn văn (Paragraphs)
            replaceTextInParagraphs(document.getParagraphs(), data);

            // 4. Xử lý các bảng (Tables)
            List<XWPFTable> tables = document.getTables();

            // Tìm bảng "Thành phần tham dự" (có header chứa chữ HỌ TÊN)
            XWPFTable attendeeTable = findTableByHeader(tables, "HỌ TÊN");
            if (attendeeTable != null) {
                fillAttendeeTable(attendeeTable, trial.getAttendees());
            }

            // Tìm bảng "Giáo viên giảng dạy" (có header chứa chữ MÔN DẠY)
            XWPFTable teacherTable = findTableByHeader(tables, "MÔN DẠY");
            if (teacherTable != null) {
                fillTeacherTable(teacherTable, trial);
            }

            // Thay thế text còn sót lại trong các ô bảng (ví dụ ngày tháng ở footer)
            replaceTextInTables(tables, data);

            document.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * BM06.41 - Biên bản đánh giá giảng thử (Word)
     * Load từ Template: templates/BM06.41-template.doc
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
            data.put("${conclusion}", result); // Cần đảm bảo template có placeholder ${conclusion} hoặc code tự điền

            // Thay thế text cơ bản
            replaceTextInParagraphs(document.getParagraphs(), data);

            // Xử lý bảng thành phần tham dự
            XWPFTable attendeeTable = findTableByHeader(document.getTables(), "HỌ TÊN");
            if (attendeeTable != null) {
                fillAttendeeTable(attendeeTable, trial.getAttendees());
            }

            // Xử lý phần Góp ý (Tìm và điền comments)
            fillCommentsSection(document, trial.getEvaluations());

            // Thay thế text trong bảng (footer ngày tháng...)
            replaceTextInTables(document.getTables(), data);

            document.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    /**
     * - Phiếu đánh giá giảng thử (Excel) - Giữ nguyên logic cũ vì Excel tạo mới dễ hơn
     */
    public byte[] generateEvaluationForm(TrialTeachingDto trial, TrialEvaluationDto evaluation) throws IOException {
        Workbook workbook = WorkbookFactory.create(true);
        Sheet sheet = workbook.createSheet("Phiếu đánh giá");

        // Styles
        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle normalStyle = createNormalStyle(workbook);
        CellStyle boldStyle = createBoldStyle(workbook);

        int rowNum = 0;

        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("PHIẾU ĐÁNH GIÁ GIẢNG THỬ");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 5));
        titleRow.setHeightInPoints(30);

        rowNum++;

        // Trial information
        rowNum = addExcelInfoRow(sheet, rowNum, "Giảng viên:", trial.getTeacherName() + (trial.getTeacherCode() != null ? " (" + trial.getTeacherCode() + ")" : ""), normalStyle, boldStyle);
        rowNum = addExcelInfoRow(sheet, rowNum, "Môn học:", trial.getSubjectName(), normalStyle, boldStyle);
        rowNum = addExcelInfoRow(sheet, rowNum, "Ngày giảng:", trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "", normalStyle, boldStyle);
        rowNum = addExcelInfoRow(sheet, rowNum, "Giờ giảng:", trial.getTeachingTime() != null ? trial.getTeachingTime() : "", normalStyle, boldStyle);
        rowNum = addExcelInfoRow(sheet, rowNum, "Địa điểm:", trial.getLocation() != null ? trial.getLocation() : "", normalStyle, boldStyle);

        rowNum++;

        // Evaluation information
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

    private void replaceTextInParagraphs(List<XWPFParagraph> paragraphs, Map<String, String> data) {
        for (XWPFParagraph p : paragraphs) {
            replaceTextInRuns(p.getRuns(), data);
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

    private void replaceTextInRuns(List<XWPFRun> runs, Map<String, String> data) {
        if (runs == null || runs.isEmpty()) return;
        for (XWPFRun run : runs) {
            String text = run.getText(0);
            if (text != null && !text.isEmpty()) {
                for (Map.Entry<String, String> entry : data.entrySet()) {
                    if (text.contains(entry.getKey())) {
                        text = text.replace(entry.getKey(), entry.getValue());
                        run.setText(text, 0);
                    }
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

        // Sắp xếp: Chủ tọa -> Thư ký -> Thành viên
        attendees.sort(Comparator.comparing((TrialAttendeeDto a) -> {
            if (a.getAttendeeRole() == TrialAttendeeRole.CHU_TOA) return 1;
            if (a.getAttendeeRole() == TrialAttendeeRole.THU_KY) return 2;
            return 3;
        }));

        // Giả sử dòng template là dòng thứ 2 (index 1)
        int startRowIndex = 1;

        // Nếu bảng chỉ có 1 dòng header, ta phải tạo dòng mới từ đầu
        if (table.getRows().size() < 2) {
            table.createRow();
        }

        for (int i = 0; i < attendees.size(); i++) {
            TrialAttendeeDto att = attendees.get(i);
            XWPFTableRow row;

            // Nếu dòng đã tồn tại (dòng mẫu hoặc dòng cũ), dùng nó. Nếu không, tạo mới.
            if (i + startRowIndex < table.getRows().size()) {
                row = table.getRow(i + startRowIndex);
            } else {
                row = table.createRow();
            }

            // Điền dữ liệu
            setCellTextPreserveStyle(row.getCell(0), String.valueOf(i + 1));
            setCellTextPreserveStyle(row.getCell(1), att.getAttendeeName() != null ? att.getAttendeeName() : "");
            // CHỨC VỤ: Lấy từ attendeeRole (Chủ tọa, Thư ký, Thành viên)
            setCellTextPreserveStyle(row.getCell(2), getRoleName(att.getAttendeeRole()));
            // CÔNG VIỆC: Giữ nguyên "Đánh giá giảng thử" + attendeeRole
            setCellTextPreserveStyle(row.getCell(3), getWorkTask(att.getAttendeeRole()));
        }

        // Xóa các dòng thừa (nếu template có nhiều dòng trống sẵn)
        int totalDataRows = attendees.size() + startRowIndex;
        while (table.getRows().size() > totalDataRows) {
            table.removeRow(table.getRows().size() - 1);
        }
    }

    private void fillTeacherTable(XWPFTable table, TrialTeachingDto trial) {
        // Đảm bảo có dòng dữ liệu (index 1)
        if (table.getRows().size() < 2) table.createRow();
        XWPFTableRow row = table.getRow(1);

        setCellTextPreserveStyle(row.getCell(0), "1");
        setCellTextPreserveStyle(row.getCell(1), trial.getTeacherName());
        setCellTextPreserveStyle(row.getCell(2), trial.getSubjectName());
        setCellTextPreserveStyle(row.getCell(3), trial.getTeachingTime());
    }

    private void setCellTextPreserveStyle(XWPFTableCell cell, String text) {
        if (cell == null) return;

        // Nếu ô đã có paragraph/run (do copy từ template), hãy dùng lại style đó
        if (!cell.getParagraphs().isEmpty()) {
            XWPFParagraph p = cell.getParagraphs().get(0);
            if (!p.getRuns().isEmpty()) {
                // Set text cho run đầu tiên, xóa các run sau để tránh text bị đè
                XWPFRun r = p.getRuns().get(0);
                r.setText(text, 0);
                for (int i = p.getRuns().size() - 1; i > 0; i--) {
                    p.removeRun(i);
                }
            } else {
                p.createRun().setText(text);
            }
        } else {
            cell.addParagraph().createRun().setText(text);
        }
    }

    private void fillCommentsSection(XWPFDocument document, List<TrialEvaluationDto> evaluations) {
        if (evaluations == null || evaluations.isEmpty()) return;

        // Tìm dòng "IV. Góp ý" hoặc "Góp ý:"
        XWPFParagraph targetPara = null;
        for (XWPFParagraph p : document.getParagraphs()) {
            if (p.getText().contains("IV. Góp ý") || p.getText().contains("Góp ý:")) {
                targetPara = p;
                break;
            }
        }

        if (targetPara != null) {
            // Append comments vào ngay sau dòng title này (đây là cách đơn giản nhất với POI basic)
            // Hoặc nếu template đã có sẵn dòng trống bên dưới, ta tìm và điền vào

            // Cách an toàn: Tạo các dòng mới ngay dưới document (POI không hỗ trợ insert after paragraph tốt)
            // Nhưng vì ta load template, ta có thể dùng XmlCursor nếu muốn chính xác (phức tạp).
            // Cách đơn giản chấp nhận được: Tìm các dòng trống ngay sau Title và điền vào.

            int index = document.getParagraphs().indexOf(targetPara);

            // Xóa các dòng trống giữ chỗ cũ nếu có (ví dụ 3 dòng ...)
            // Logic đơn giản: Cộng dồn chuỗi comments và replace vào 1 placeholder nếu có,
            // hoặc chèn text vào các dòng tiếp theo.

            // Ở đây tôi chọn giải pháp: Gom comments thành 1 chuỗi xuống dòng và add vào paragraph tiếp theo
            if (index + 1 < document.getParagraphs().size()) {
                XWPFParagraph commentPara = document.getParagraphs().get(index + 1);
                // Xóa nội dung cũ
                while (!commentPara.getRuns().isEmpty()) {
                    commentPara.removeRun(0);
                }

                for (TrialEvaluationDto eval : evaluations) {
                    if (eval.getComments() != null && !eval.getComments().isEmpty()) {
                        XWPFRun run = commentPara.createRun();
                        run.setText("- " + eval.getComments());
                        run.addBreak(); // Xuống dòng
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