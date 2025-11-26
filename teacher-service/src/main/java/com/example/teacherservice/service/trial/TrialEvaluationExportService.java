package com.example.teacherservice.service.trial;

import com.example.teacherservice.dto.trial.TrialAttendeeDto;
import com.example.teacherservice.dto.trial.TrialEvaluationDto;
import com.example.teacherservice.dto.trial.TrialEvaluationItemDto;
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

import java.io.ByteArrayInputStream;
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
     *  BM06.40 - Phiếu đánh giá giảng thử (Excel)
     *  Sử dụng template BM06.40-template.xlsx trong resources/templates và thay thế các placeholder.
     *
     *  Các placeholder được hỗ trợ:
     *  - ${TEACHER_NAME}, ${TEACHER_CODE}
     *  - ${SUBJECT_NAME}
     *  - ${TEACHING_DATE}, ${TEACHING_TIME}, ${LOCATION}
     *  - ${EVALUATOR_NAME}, ${EVALUATOR_ROLE}
     *  - ${SCORE}, ${CONCLUSION}, ${COMMENTS}
     *  - ${SCORE_1_1}, ${SCORE_1_2}, ..., ${SCORE_1_22} (điểm từng tiêu chí)
     *  - ${TOTAL} (tổng điểm từ các tiêu chí)
     */
    public byte[] generateEvaluationForm(TrialTeachingDto trial, TrialEvaluationDto evaluation) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/BM06.40-template.xlsx");

        // Validate file exists
        if (!resource.exists()) {
            throw new IOException("Template file not found: templates/BM06.40-template.xlsx");
        }

        // Validate file is readable
        if (!resource.isReadable()) {
            throw new IOException("Template file is not readable: templates/BM06.40-template.xlsx");
        }

        log.info("Loading template: templates/BM06.40-template.xlsx, exists: {}, readable: {}", 
                resource.exists(), resource.isReadable());

        InputStream is = null;
        Workbook workbook = null;
        try {
            is = resource.getInputStream();
            
            // Validate input stream
            if (is == null) {
                throw new IOException("Cannot open input stream for template file");
            }

            // Read file into memory first to avoid ZIP issues
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] bufferArray = new byte[8192];
            int nRead;
            while ((nRead = is.read(bufferArray, 0, bufferArray.length)) != -1) {
                buffer.write(bufferArray, 0, nRead);
            }
            buffer.flush();
            byte[] fileBytes = buffer.toByteArray();
            
            if (fileBytes.length == 0) {
                throw new IOException("Template file is empty");
            }
            
            log.info("Loaded template file, size: {} bytes", fileBytes.length);

            // Try to read and validate the workbook from byte array
            try (ByteArrayInputStream bais = new ByteArrayInputStream(fileBytes)) {
                workbook = WorkbookFactory.create(bais);
                log.info("Successfully loaded workbook with {} sheets", workbook.getNumberOfSheets());
            } catch (Exception e) {
                log.error("Error creating workbook from template: {}", e.getMessage(), e);
                throw new IOException("Invalid Excel template file. Please check if the file is a valid Excel (.xlsx) file. " +
                        "The file might be corrupted. Error: " + e.getMessage(), e);
            }

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            // Chuẩn bị dữ liệu thay thế
            String teacherName = trial.getTeacherName() != null ? trial.getTeacherName() : "";
            String teacherCode = trial.getTeacherCode() != null ? trial.getTeacherCode() : "";
            String subjectName = trial.getSubjectName() != null ? trial.getSubjectName() : "";
            String teachingDate = trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "";
            String teachingTime = trial.getTeachingTime() != null ? trial.getTeachingTime() : "";
            String location = trial.getLocation() != null ? trial.getLocation() : "";

            String evaluatorName = evaluation != null && evaluation.getAttendeeName() != null
                    ? evaluation.getAttendeeName()
                    : "";
            String evaluatorRole = evaluation != null && evaluation.getAttendeeRole() != null
                    ? getRoleName(TrialAttendeeRole.valueOf(evaluation.getAttendeeRole()))
                    : "";
            String score = evaluation != null && evaluation.getScore() != null
                    ? String.valueOf(evaluation.getScore())
                    : "";
            String conclusion = "";
            if (evaluation != null && evaluation.getConclusion() != null) {
                conclusion = evaluation.getConclusion() == TrialConclusion.PASS
                        ? "PASS"
                        : (evaluation.getConclusion() == TrialConclusion.FAIL ? "FAIL" : "");
            }
            String comments = evaluation != null && evaluation.getComments() != null
                    ? evaluation.getComments()
                    : "";

            Map<String, String> data = new HashMap<>();
            data.put("${TEACHER_NAME}", teacherName);
            data.put("${TEACHER_CODE}", teacherCode);
            data.put("${SUBJECT_NAME}", subjectName);
            data.put("${TEACHING_DATE}", teachingDate);
            data.put("${TEACHING_TIME}", teachingTime);
            data.put("${LOCATION}", location);
            data.put("${EVALUATOR_NAME}", evaluatorName);
            data.put("${EVALUATOR_ROLE}", evaluatorRole);
            data.put("${SCORE}", score);
            data.put("${CONCLUSION}", conclusion);
            data.put("${COMMENTS}", comments);

            // Fill điểm từng tiêu chí (1-1 đến 1-17)
            if (evaluation != null && evaluation.getItems() != null) {
                for (TrialEvaluationItemDto item : evaluation.getItems()) {
                    if (item.getCriterionCode() != null && item.getScore() != null) {
                        // Map code "1-1" -> placeholder "${SCORE_1_1}"
                        String placeholder = "${SCORE_" + item.getCriterionCode().replace("-", "_") + "}";
                        data.put(placeholder, String.valueOf(item.getScore()));
                    }
                }
            }
            
            // Đảm bảo tất cả placeholder SCORE_1_1 đến SCORE_1_22 đều có giá trị (rỗng nếu chưa chấm)
            for (int i = 1; i <= 22; i++) {
                String placeholder = "${SCORE_1_" + i + "}";
                if (!data.containsKey(placeholder)) {
                    data.put(placeholder, "");
                }
            }
            
            // Tính tổng điểm từ các tiêu chí (nếu có)
            if (evaluation != null && evaluation.getItems() != null && !evaluation.getItems().isEmpty()) {
                int totalScore = evaluation.getItems().stream()
                        .filter(item -> item.getScore() != null)
                        .mapToInt(item -> item.getScore())
                        .sum();
                data.put("${TOTAL}", String.valueOf(totalScore));
            } else {
                data.put("${TOTAL}", "");
            }

            // Thay thế placeholder trong tất cả sheet / ô (cả string và numeric)
            for (int s = 0; s < workbook.getNumberOfSheets(); s++) {
                Sheet sheet = workbook.getSheetAt(s);
                if (sheet == null) continue;

                for (Row row : sheet) {
                    if (row == null) continue;
                    for (Cell cell : row) {
                        if (cell == null) continue;
                        
                        // Xử lý ô string
                        if (cell.getCellType() == CellType.STRING) {
                            String text = cell.getStringCellValue();
                            if (text == null || text.isEmpty()) continue;

                            String replaced = text;
                            for (Map.Entry<String, String> entry : data.entrySet()) {
                                if (replaced.contains(entry.getKey())) {
                                    replaced = replaced.replace(entry.getKey(), entry.getValue() != null ? entry.getValue() : "");
                                }
                            }

                            if (!replaced.equals(text)) {
                                cell.setCellValue(replaced);
                            }
                        }
                        // Xử lý ô formula - có thể chứa placeholder
                        else if (cell.getCellType() == CellType.FORMULA) {
                            String formula = cell.getCellFormula();
                            if (formula != null) {
                                String replaced = formula;
                                for (Map.Entry<String, String> entry : data.entrySet()) {
                                    if (replaced.contains(entry.getKey())) {
                                        // Thử parse số nếu có thể
                                        try {
                                            double numValue = Double.parseDouble(entry.getValue());
                                            replaced = replaced.replace(entry.getKey(), String.valueOf(numValue));
                                        } catch (NumberFormatException e) {
                                            replaced = replaced.replace(entry.getKey(), entry.getValue() != null ? entry.getValue() : "0");
                                        }
                                    }
                                }
                                if (!replaced.equals(formula)) {
                                    try {
                                        cell.setCellFormula(replaced);
                                    } catch (Exception e) {
                                        log.warn("Cannot set formula: {}", replaced);
                                    }
                                }
                            }
                        }
                    }
                }
            }

        workbook.write(outputStream);
            byte[] result = outputStream.toByteArray();
            log.info("Successfully generated evaluation form, size: {} bytes", result.length);
            return result;
        } catch (IOException e) {
            log.error("IO error while generating evaluation form: {}", e.getMessage(), e);
            throw e;
        } catch (Exception e) {
            log.error("Unexpected error while generating evaluation form: {}", e.getMessage(), e);
            throw new IOException("Error generating evaluation form: " + e.getMessage(), e);
        } finally {
            // Cleanup resources
            if (workbook != null) {
                try {
        workbook.close();
                } catch (IOException e) {
                    log.warn("Error closing workbook: {}", e.getMessage());
                }
            }
            if (is != null) {
                try {
                    is.close();
                } catch (IOException e) {
                    log.warn("Error closing input stream: {}", e.getMessage());
                }
            }
        }
    }

    /**
     * BM06.42 - Thống kê đánh giá GV giảng thử (Excel) 
     * Reads from template to preserve formatting
     */
    public byte[] generateStatisticsReport(List<TrialTeachingDto> trials) throws IOException {
        ClassPathResource resource = new ClassPathResource("templates/BM06.42-template.xlsx");
        
        try (InputStream is = resource.getInputStream();
             Workbook workbook = WorkbookFactory.create(is);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {
            
            Sheet sheet = workbook.getSheetAt(0);
            
            int headerRowIndex = -1;
            for (int i = 0; i <= 20; i++) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    Cell firstCell = row.getCell(0);
                    if (firstCell != null) {
                        String value = getCellValueAsString(firstCell).trim().toLowerCase();
                        if (value.equals("no") || value.contains("teacher")) {
                            headerRowIndex = i;
                            break;
                        }
                    }
                }
            }
            
            int dataStartRow = headerRowIndex > 0 ? headerRowIndex + 1 : 8;
            
            int lastRow = sheet.getLastRowNum();
            for (int i = lastRow; i >= dataStartRow; i--) {
                Row row = sheet.getRow(i);
                if (row != null) {
                    sheet.removeRow(row);
                }
            }
            
            int rowIndex = dataStartRow;
            int stt = 1;
            
            for (TrialTeachingDto trial : trials) {
                Row row = sheet.createRow(rowIndex++);
                
                // Column 0: No (STT)
                row.createCell(0).setCellValue(stt++);
                
                // Column 1: Teacher Name
                row.createCell(1).setCellValue(trial.getTeacherName() != null ? trial.getTeacherName() : "");
                
                // Column 2: Time (HH:mm dd/MM/yyyy)
                String timeStr = "";
                if (trial.getTeachingTime() != null && trial.getTeachingDate() != null) {
                    timeStr = trial.getTeachingTime() + " " + trial.getTeachingDate().format(DATE_FORMATTER);
                } else if (trial.getTeachingDate() != null) {
                    timeStr = trial.getTeachingDate().format(DATE_FORMATTER);
                }
                row.createCell(2).setCellValue(timeStr);
                
                // Column 3: Skill No (subjectCode)
                row.createCell(3).setCellValue(trial.getSubjectCode() != null ? trial.getSubjectCode() : "");
                
                // Column 4: Skill Name (description)
                row.createCell(4).setCellValue(trial.getSubjectDescription() != null ? trial.getSubjectDescription() : trial.getSubjectName());
                
                // Column 5: ITT/ACCP (systemName)
                row.createCell(5).setCellValue(trial.getSystemName() != null ? trial.getSystemName() : "");
                
                // Column 6: Evaluation (status)
                row.createCell(6).setCellValue(getStatusName(trial.getStatus()));
                
                // Column 7: Note
                row.createCell(7).setCellValue(trial.getNote() != null ? trial.getNote() : "");
            }
            
            workbook.write(outputStream);
            return outputStream.toByteArray();
        }
    }
    
    private String getCellValueAsString(Cell cell) {
        if (cell == null) return "";
        return switch (cell.getCellType()) {
            case STRING -> cell.getStringCellValue();
            case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
            case BOOLEAN -> String.valueOf(cell.getBooleanCellValue());
            default -> "";
        };
    }

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
        return switch (role) {
            case CHU_TOA -> "Đánh giá giảng thử, Chủ tọa";
            case THU_KY -> "Đánh giá giảng thử, Thư ký";
            default -> "Đánh giá giảng thử";
        };
    }

    private String getRoleName(TrialAttendeeRole role) {
        if (role == null) return "";
        return switch (role) {
            case CHU_TOA -> "Chủ tọa";
            case THU_KY -> "Thư ký";
            case THANH_VIEN -> "Thành viên";
        };
    }

    private String getStatusName(TrialStatus status) {
        if (status == null) return "";
        return switch (status) {
            case PENDING -> "Đang chờ";
            case FAILED -> "Đã thất bại";
            case REVIEWED -> "Đã đánh giá";
            case PASSED -> "Đã hoàn thành";
        };
    }

    // Excel styles
    private CellStyle createTitleStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 16);
        font.setFontName("Times New Roman");
        style.setFont(font);
        style.setAlignment(HorizontalAlignment.CENTER);
        style.setVerticalAlignment(VerticalAlignment.CENTER);
        return style;
    }

    private CellStyle createNormalStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setFontHeightInPoints((short) 11);
        font.setFontName("Times New Roman");
        style.setFont(font);
        style.setBorderTop(BorderStyle.THIN);
        style.setBorderBottom(BorderStyle.THIN);
        style.setBorderLeft(BorderStyle.THIN);
        style.setBorderRight(BorderStyle.THIN);
        return style;
    }


    private CellStyle createBoldStyle(Workbook workbook) {
        CellStyle style = workbook.createCellStyle();
        Font font = workbook.createFont();
        font.setBold(true);
        font.setFontHeightInPoints((short) 11);
        font.setFontName("Times New Roman");
        style.setFont(font);
        return style;
    }

    private int addExcelInfoRow(Sheet sheet, int rowNum, String label, String value, CellStyle normalStyle, CellStyle boldStyle) {
        Row row = sheet.createRow(rowNum);
        Cell labelCell = row.createCell(0);
        labelCell.setCellValue(label);
        labelCell.setCellStyle(boldStyle);

        Cell valueCell = row.createCell(1);
        valueCell.setCellValue(value);
        valueCell.setCellStyle(normalStyle);
        sheet.addMergedRegion(new CellRangeAddress(rowNum, rowNum, 1, 5));
        return rowNum + 1;
    }
}