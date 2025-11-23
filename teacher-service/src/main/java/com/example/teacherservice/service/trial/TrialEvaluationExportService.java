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
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class TrialEvaluationExportService {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");

    /**
     * BM06.39 - Phân công đánh giá giáo viên giảng thử (Word)
     * Format theo biểu mẫu BM06.39
     */
    public byte[] generateAssignmentDocument(TrialTeachingDto trial) throws IOException {
        XWPFDocument document = new XWPFDocument();
        
        // Header với thông tin đơn vị
        addHeader(document);
        
        // Title - 2 dòng
        XWPFParagraph titlePara1 = document.createParagraph();
        titlePara1.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun1 = titlePara1.createRun();
        titleRun1.setText("BẢNG PHÂN CÔNG");
        titleRun1.setBold(true);
        titleRun1.setFontSize(16);
        titleRun1.setFontFamily("Times New Roman");
        
        XWPFParagraph titlePara2 = document.createParagraph();
        titlePara2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun2 = titlePara2.createRun();
        titleRun2.setText("ĐÁNH GIÁ GIÁO VIÊN GIẢNG THỬ");
        titleRun2.setBold(true);
        titleRun2.setFontSize(16);
        titleRun2.setFontFamily("Times New Roman");
        
        document.createParagraph();
        
        // 1. Thông tin chung
        XWPFParagraph section1Para = document.createParagraph();
        XWPFRun section1Run = section1Para.createRun();
        section1Run.setText("1. Thông tin chung:");
        section1Run.setBold(true);
        section1Run.setFontSize(12);
        section1Run.setFontFamily("Times New Roman");
        
        addInfoRow(document, "Ngày:", trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "................");
        addInfoRow(document, "Thời gian:", trial.getTeachingTime() != null ? trial.getTeachingTime() : "................");
        addInfoRow(document, "Địa điểm:", trial.getLocation() != null ? trial.getLocation() : "................");
        
        document.createParagraph();
        
        // 2. Thành phần tham dự
        XWPFParagraph section2Para = document.createParagraph();
        XWPFRun section2Run = section2Para.createRun();
        section2Run.setText("2. Thành phần tham dự:");
        section2Run.setBold(true);
        section2Run.setFontSize(12);
        section2Run.setFontFamily("Times New Roman");
        
        document.createParagraph();
        
        // Create attendees table
        int attendeeCount = trial.getAttendees() != null ? trial.getAttendees().size() : 0;
        int tableRows = Math.max(4, attendeeCount + 1); // Ít nhất 4 dòng (1 header + 3 data)
        XWPFTable attendeeTable = document.createTable(tableRows, 4);
        attendeeTable.setWidth("100%");
        
        // Header row
        XWPFTableRow headerRow = attendeeTable.getRow(0);
        setCellText(headerRow.getCell(0), "STT", true);
        setCellText(headerRow.getCell(1), "HỌ TÊN", true);
        setCellText(headerRow.getCell(2), "CHỨC VỤ", true);
        setCellText(headerRow.getCell(3), "CÔNG VIỆC", true);
        
        // Data rows
        List<TrialAttendeeDto> sortedAttendees = trial.getAttendees() != null ? 
                trial.getAttendees().stream()
                        .sorted(Comparator.comparing((TrialAttendeeDto a) -> {
                            if (a.getAttendeeRole() == TrialAttendeeRole.CHU_TOA) return 1;
                            if (a.getAttendeeRole() == TrialAttendeeRole.THU_KY) return 2;
                            return 3;
                        }))
                        .collect(Collectors.toList()) : 
                new ArrayList<>();
        
        int index = 1;
        for (TrialAttendeeDto attendee : sortedAttendees) {
            if (index < tableRows) {
                XWPFTableRow row = attendeeTable.getRow(index);
                setCellText(row.getCell(0), String.valueOf(index), false);
                setCellText(row.getCell(1), attendee.getAttendeeName() != null ? attendee.getAttendeeName() : "", false);
                setCellText(row.getCell(2), "", false); // Chức vụ để trống
                setCellText(row.getCell(3), getWorkTask(attendee.getAttendeeRole()), false);
                index++;
            }
        }
        
        // Fill remaining rows with empty data
        for (int i = index; i < tableRows; i++) {
            XWPFTableRow row = attendeeTable.getRow(i);
            setCellText(row.getCell(0), String.valueOf(i), false);
            setCellText(row.getCell(1), "", false);
            setCellText(row.getCell(2), "", false);
            setCellText(row.getCell(3), "", false);
        }
        
        document.createParagraph();
        
        // 3. Giáo viên giảng dạy
        XWPFParagraph section3Para = document.createParagraph();
        XWPFRun section3Run = section3Para.createRun();
        section3Run.setText("3. Giáo viên giảng dạy:");
        section3Run.setBold(true);
        section3Run.setFontSize(12);
        section3Run.setFontFamily("Times New Roman");
        
        document.createParagraph();
        
        // Create teacher table (ít nhất 3 dòng: 1 header + 2 data)
        XWPFTable teacherTable = document.createTable(3, 4);
        teacherTable.setWidth("100%");
        
        // Header row
        XWPFTableRow teacherHeaderRow = teacherTable.getRow(0);
        setCellText(teacherHeaderRow.getCell(0), "STT", true);
        setCellText(teacherHeaderRow.getCell(1), "HỌ TÊN GIÁO VIÊN", true);
        setCellText(teacherHeaderRow.getCell(2), "MÔN DẠY", true);
        setCellText(teacherHeaderRow.getCell(3), "THỜI GIAN DẠY", true);
        
        // Data row 1
        XWPFTableRow teacherRow1 = teacherTable.getRow(1);
        setCellText(teacherRow1.getCell(0), "1", false);
        setCellText(teacherRow1.getCell(1), trial.getTeacherName() != null ? trial.getTeacherName() : "", false);
        setCellText(teacherRow1.getCell(2), trial.getSubjectName() != null ? trial.getSubjectName() : "", false);
        setCellText(teacherRow1.getCell(3), trial.getTeachingTime() != null ? trial.getTeachingTime() : "", false);
        
        // Data row 2 (empty)
        XWPFTableRow teacherRow2 = teacherTable.getRow(2);
        setCellText(teacherRow2.getCell(0), "2", false);
        setCellText(teacherRow2.getCell(1), "", false);
        setCellText(teacherRow2.getCell(2), "", false);
        setCellText(teacherRow2.getCell(3), "", false);
        
        document.createParagraph();
        
        // Ghi chú
        XWPFParagraph notePara = document.createParagraph();
        XWPFRun noteRun = notePara.createRun();
        noteRun.setText("Ghi chú:");
        noteRun.setBold(true);
        noteRun.setFontSize(12);
        noteRun.setFontFamily("Times New Roman");
        
        addBulletPoint(document, "Dạy thử 45 phút.");
        addBulletPoint(document, "Góp ý 15 phút.");
        
        document.createParagraph();
        document.createParagraph();
        
        // Signature blocks
        XWPFTable sigTable = document.createTable(1, 2);
        sigTable.setWidth("100%");
        XWPFTableRow sigRow = sigTable.getRow(0);
        
        // Left: Người lập
        XWPFTableCell leftCell = sigRow.getCell(0);
        leftCell.removeParagraph(0);
        XWPFParagraph leftPara = leftCell.addParagraph();
        leftPara.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun1 = leftPara.createRun();
        leftRun1.setText("Ngày ...../...../20....");
        leftRun1.setFontSize(11);
        leftRun1.setFontFamily("Times New Roman");
        
        XWPFParagraph leftPara2 = leftCell.addParagraph();
        leftPara2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun2 = leftPara2.createRun();
        leftRun2.setText("NGƯỜI LẬP");
        leftRun2.setBold(true);
        leftRun2.setFontSize(11);
        leftRun2.setFontFamily("Times New Roman");
        
        XWPFParagraph leftPara3 = leftCell.addParagraph();
        leftPara3.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun3 = leftPara3.createRun();
        leftRun3.setText("(Ký, họ tên)");
        leftRun3.setFontSize(11);
        leftRun3.setFontFamily("Times New Roman");
        
        // Right: Trưởng bộ môn
        XWPFTableCell rightCell = sigRow.getCell(1);
        rightCell.removeParagraph(0);
        XWPFParagraph rightPara = rightCell.addParagraph();
        rightPara.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun1 = rightPara.createRun();
        rightRun1.setText("Ngày ...../...../20....");
        rightRun1.setFontSize(11);
        rightRun1.setFontFamily("Times New Roman");
        
        XWPFParagraph rightPara2 = rightCell.addParagraph();
        rightPara2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun2 = rightPara2.createRun();
        rightRun2.setText("TRƯỞNG BỘ MÔN");
        rightRun2.setBold(true);
        rightRun2.setFontSize(11);
        rightRun2.setFontFamily("Times New Roman");
        
        XWPFParagraph rightPara3 = rightCell.addParagraph();
        rightPara3.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun3 = rightPara3.createRun();
        rightRun3.setText("(Ký, họ tên)");
        rightRun3.setFontSize(11);
        rightRun3.setFontFamily("Times New Roman");
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    /**
     * - Phiếu đánh giá giảng thử (Excel)
     */
    public byte[] generateEvaluationForm(TrialTeachingDto trial, TrialEvaluationDto evaluation) throws IOException {
        Workbook workbook = WorkbookFactory.create(true);
        Sheet sheet = workbook.createSheet("Phiếu đánh giá");
        
        // Styles
        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
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
        rowNum = addInfoRow(sheet, rowNum, "Giảng viên:", trial.getTeacherName() + (trial.getTeacherCode() != null ? " (" + trial.getTeacherCode() + ")" : ""), normalStyle, boldStyle);
        rowNum = addInfoRow(sheet, rowNum, "Môn học:", trial.getSubjectName(), normalStyle, boldStyle);
        rowNum = addInfoRow(sheet, rowNum, "Ngày giảng:", trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "", normalStyle, boldStyle);
        rowNum = addInfoRow(sheet, rowNum, "Giờ giảng:", trial.getTeachingTime() != null ? trial.getTeachingTime() : "", normalStyle, boldStyle);
        rowNum = addInfoRow(sheet, rowNum, "Địa điểm:", trial.getLocation() != null ? trial.getLocation() : "", normalStyle, boldStyle);
        
        rowNum++;
        
        // Evaluation information
        if (evaluation != null) {
            rowNum = addInfoRow(sheet, rowNum, "Người đánh giá:", evaluation.getAttendeeName() != null ? evaluation.getAttendeeName() : "", normalStyle, boldStyle);
            rowNum = addInfoRow(sheet, rowNum, "Vai trò:", getRoleName(evaluation.getAttendeeRole() != null ? 
                    TrialAttendeeRole.valueOf(evaluation.getAttendeeRole()) : null), normalStyle, boldStyle);
            rowNum = addInfoRow(sheet, rowNum, "Điểm số:", evaluation.getScore() != null ? String.valueOf(evaluation.getScore()) : "", normalStyle, boldStyle);
            rowNum = addInfoRow(sheet, rowNum, "Kết luận:", evaluation.getConclusion() == TrialConclusion.PASS ? "ĐẠT" : 
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
        
        // Auto-size columns
        for (int i = 0; i < 6; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    /**
     * BM06.41 - Biên bản đánh giá giảng thử (Word)
     * Format theo biểu mẫu BM06.41
     */
    public byte[] generateMinutesDocument(TrialTeachingDto trial) throws IOException {
        XWPFDocument document = new XWPFDocument();
        
        // Header với thông tin đơn vị - format đúng mẫu
        addMinutesHeader(document);
        
        // Title
        XWPFParagraph titlePara = document.createParagraph();
        titlePara.setAlignment(ParagraphAlignment.CENTER);
        titlePara.setSpacingAfter(240);
        XWPFRun titleRun = titlePara.createRun();
        titleRun.setText("BIÊN BẢN ĐÁNH GIÁ GIẢNG THỬ");
        titleRun.setBold(true);
        titleRun.setFontSize(16);
        titleRun.setFontFamily("Times New Roman");
        
        document.createParagraph();
        
        // I. Thông tin chung
        XWPFParagraph section1Para = document.createParagraph();
        XWPFRun section1Run = section1Para.createRun();
        section1Run.setText("I. Thông tin chung:");
        section1Run.setBold(true);
        section1Run.setFontSize(12);
        section1Run.setFontFamily("Times New Roman");
        
        addInfoRow(document, "Ngày:", trial.getTeachingDate() != null ? trial.getTeachingDate().format(DATE_FORMATTER) : "................");
        addInfoRow(document, "Thời gian:", trial.getTeachingTime() != null ? trial.getTeachingTime() : "................");
        addInfoRow(document, "Địa điểm:", trial.getLocation() != null ? trial.getLocation() : "................");
        
        document.createParagraph();
        
        // II. Thành phần tham dự
        XWPFParagraph section2Para = document.createParagraph();
        XWPFRun section2Run = section2Para.createRun();
        section2Run.setText("II. Thành phần tham dự:");
        section2Run.setBold(true);
        section2Run.setFontSize(12);
        section2Run.setFontFamily("Times New Roman");
        
        document.createParagraph();
        
        // Create attendees table
        int attendeeCount = trial.getAttendees() != null ? trial.getAttendees().size() : 0;
        int tableRows = Math.max(4, attendeeCount + 1); // Ít nhất 4 dòng (1 header + 3 data)
        XWPFTable attendeeTable = document.createTable(tableRows, 4);
        attendeeTable.setWidth("100%");
        
        // Header row
        XWPFTableRow headerRow = attendeeTable.getRow(0);
        setCellText(headerRow.getCell(0), "STT", true);
        setCellText(headerRow.getCell(1), "HỌ TÊN", true);
        setCellText(headerRow.getCell(2), "CHỨC VỤ", true);
        setCellText(headerRow.getCell(3), "CÔNG VIỆC", true);
        
        // Data rows
        List<TrialAttendeeDto> sortedAttendees = trial.getAttendees() != null ? 
                trial.getAttendees().stream()
                        .sorted(Comparator.comparing((TrialAttendeeDto a) -> {
                            if (a.getAttendeeRole() == TrialAttendeeRole.CHU_TOA) return 1;
                            if (a.getAttendeeRole() == TrialAttendeeRole.THU_KY) return 2;
                            return 3;
                        }))
                        .collect(Collectors.toList()) : 
                new ArrayList<>();
        
        int index = 1;
        for (TrialAttendeeDto attendee : sortedAttendees) {
            if (index < tableRows) {
                XWPFTableRow row = attendeeTable.getRow(index);
                setCellText(row.getCell(0), String.valueOf(index), false);
                setCellText(row.getCell(1), attendee.getAttendeeName() != null ? attendee.getAttendeeName() : "", false);
                setCellText(row.getCell(2), "", false);
                setCellText(row.getCell(3), getWorkTask(attendee.getAttendeeRole()), false);
                index++;
            }
        }
        
        // Fill remaining rows
        for (int i = index; i < tableRows; i++) {
            XWPFTableRow row = attendeeTable.getRow(i);
            setCellText(row.getCell(0), String.valueOf(i), false);
            setCellText(row.getCell(1), "", false);
            setCellText(row.getCell(2), "", false);
            setCellText(row.getCell(3), "", false);
        }
        
        document.createParagraph();
        
        // III. Nội dung
        XWPFParagraph section3Para = document.createParagraph();
        XWPFRun section3Run = section3Para.createRun();
        section3Run.setText("III. Nội dung:");
        section3Run.setBold(true);
        section3Run.setFontSize(12);
        section3Run.setFontFamily("Times New Roman");
        
        addInfoRow(document, "Giáo viên:", trial.getTeacherName() != null ? trial.getTeacherName() : "................");
        addInfoRow(document, "Giảng thử bài:", trial.getSubjectName() != null ? trial.getSubjectName() : "................");
        
        document.createParagraph();
        
        // IV. Góp ý
        XWPFParagraph section4Para = document.createParagraph();
        XWPFRun section4Run = section4Para.createRun();
        section4Run.setText("IV. Góp ý:");
        section4Run.setBold(true);
        section4Run.setFontSize(12);
        section4Run.setFontFamily("Times New Roman");
        
        // Lấy tất cả comments từ evaluations
        if (trial.getEvaluations() != null && !trial.getEvaluations().isEmpty()) {
            for (TrialEvaluationDto eval : trial.getEvaluations()) {
                if (eval.getComments() != null && !eval.getComments().trim().isEmpty()) {
                    addBulletPoint(document, eval.getComments());
                }
            }
        } else {
            // Nếu chưa có đánh giá, để 3 dòng trống
            for (int i = 0; i < 3; i++) {
                addBulletPoint(document, "");
            }
        }
        
        document.createParagraph();
        
        // V. Nhận xét Đạt/Không đạt
        XWPFParagraph section5Para = document.createParagraph();
        XWPFRun section5Run = section5Para.createRun();
        section5Run.setText("V. Nhận xét Đạt/ Không đạt:");
        section5Run.setBold(true);
        section5Run.setFontSize(12);
        section5Run.setFontFamily("Times New Roman");
        
        String conclusion = "";
        if (trial.getFinalResult() != null) {
            conclusion = trial.getFinalResult() == TrialConclusion.PASS ? "ĐẠT" : "KHÔNG ĐẠT";
        }
        addInfoRow(document, "", conclusion);
        
        document.createParagraph();
        document.createParagraph();
        
        // Signature blocks
        XWPFTable sigTable = document.createTable(1, 2);
        sigTable.setWidth("100%");
        XWPFTableRow sigRow = sigTable.getRow(0);
        
        // Left: Thư ký
        XWPFTableCell leftCell = sigRow.getCell(0);
        leftCell.removeParagraph(0);
        XWPFParagraph leftPara = leftCell.addParagraph();
        leftPara.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun1 = leftPara.createRun();
        leftRun1.setText("Ngày ...../...../20....");
        leftRun1.setFontSize(11);
        leftRun1.setFontFamily("Times New Roman");
        
        XWPFParagraph leftPara2 = leftCell.addParagraph();
        leftPara2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun2 = leftPara2.createRun();
        leftRun2.setText("THƯ KÝ");
        leftRun2.setBold(true);
        leftRun2.setFontSize(11);
        leftRun2.setFontFamily("Times New Roman");
        
        XWPFParagraph leftPara3 = leftCell.addParagraph();
        leftPara3.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun3 = leftPara3.createRun();
        leftRun3.setText("(Ký, họ tên)");
        leftRun3.setFontSize(11);
        leftRun3.setFontFamily("Times New Roman");
        
        // Right: Chủ tọa
        XWPFTableCell rightCell = sigRow.getCell(1);
        rightCell.removeParagraph(0);
        XWPFParagraph rightPara = rightCell.addParagraph();
        rightPara.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun1 = rightPara.createRun();
        rightRun1.setText("Ngày ...../...../20....");
        rightRun1.setFontSize(11);
        rightRun1.setFontFamily("Times New Roman");
        
        XWPFParagraph rightPara2 = rightCell.addParagraph();
        rightPara2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun2 = rightPara2.createRun();
        rightRun2.setText("CHỦ TỌA");
        rightRun2.setBold(true);
        rightRun2.setFontSize(11);
        rightRun2.setFontFamily("Times New Roman");
        
        XWPFParagraph rightPara3 = rightCell.addParagraph();
        rightPara3.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun3 = rightPara3.createRun();
        rightRun3.setText("(Ký, họ tên)");
        rightRun3.setFontSize(11);
        rightRun3.setFontFamily("Times New Roman");
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        document.write(outputStream);
        document.close();
        return outputStream.toByteArray();
    }

    /**
     * - Thống kê đánh giá GV giảng thử (Excel)
     */
    public byte[] generateStatisticsReport(List<TrialTeachingDto> trials) throws IOException {
        Workbook workbook = WorkbookFactory.create(true);
        Sheet sheet = workbook.createSheet("Thống kê");
        
        // Styles
        CellStyle titleStyle = createTitleStyle(workbook);
        CellStyle headerStyle = createHeaderStyle(workbook);
        CellStyle normalStyle = createNormalStyle(workbook);
        CellStyle numberStyle = createNumberStyle(workbook);
        
        int rowNum = 0;
        
        // Title
        Row titleRow = sheet.createRow(rowNum++);
        Cell titleCell = titleRow.createCell(0);
        titleCell.setCellValue("THỐNG KÊ ĐÁNH GIÁ GIÁO VIÊN GIẢNG THỬ");
        titleCell.setCellStyle(titleStyle);
        sheet.addMergedRegion(new CellRangeAddress(0, 0, 0, 8));
        titleRow.setHeightInPoints(30);
        
        rowNum++;
        
        // Header
        Row headerRow = sheet.createRow(rowNum++);
        String[] headers = {"STT", "Giảng viên", "Mã GV", "Môn học", "Ngày giảng", "Điểm TB", "Kết luận", "Trạng thái", "Ghi chú"};
        for (int i = 0; i < headers.length; i++) {
            Cell cell = headerRow.createCell(i);
            cell.setCellValue(headers[i]);
            cell.setCellStyle(headerStyle);
        }
        
        // Data rows
        int index = 1;
        for (TrialTeachingDto trial : trials) {
            Row row = sheet.createRow(rowNum++);
            
            row.createCell(0).setCellValue(index);
            row.createCell(1).setCellValue(trial.getTeacherName() != null ? trial.getTeacherName() : "");
            row.createCell(2).setCellValue(trial.getTeacherCode() != null ? trial.getTeacherCode() : "");
            row.createCell(3).setCellValue(trial.getSubjectName() != null ? trial.getSubjectName() : "");
            row.createCell(4).setCellValue(trial.getTeachingDate() != null ? 
                    trial.getTeachingDate().format(DATE_FORMATTER) : "");
            
            // Calculate average score
            if (trial.getEvaluations() != null && !trial.getEvaluations().isEmpty()) {
                double avgScore = trial.getEvaluations().stream()
                        .filter(e -> e.getScore() != null)
                        .mapToInt(TrialEvaluationDto::getScore)
                        .average()
                        .orElse(0.0);
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
            
            // Apply styles
            for (int i = 0; i < 9; i++) {
                Cell cell = row.getCell(i);
                if (cell != null && i != 5) {
                    cell.setCellStyle(normalStyle);
                }
            }
            
            index++;
        }
        
        // Summary row
        rowNum++;
        Row summaryRow = sheet.createRow(rowNum++);
        Cell summaryLabelCell = summaryRow.createCell(0);
        summaryLabelCell.setCellValue("Tổng số:");
        summaryLabelCell.setCellStyle(headerStyle);
        
        Cell summaryValueCell = summaryRow.createCell(1);
        summaryValueCell.setCellValue(trials.size());
        summaryValueCell.setCellStyle(headerStyle);
        
        // Auto-size columns
        for (int i = 0; i < 9; i++) {
            sheet.autoSizeColumn(i);
        }
        
        ByteArrayOutputStream outputStream = new ByteArrayOutputStream();
        workbook.write(outputStream);
        workbook.close();
        return outputStream.toByteArray();
    }

    // Helper methods
    private void addHeader(XWPFDocument document) {
        // Header với logo và thông tin đơn vị - format đúng mẫu BM06.39
        // Tất cả căn trái, dòng địa chỉ liên hệ có gạch chân
        
        XWPFParagraph headerPara = document.createParagraph();
        headerPara.setAlignment(ParagraphAlignment.LEFT);
        XWPFRun headerRun = headerPara.createRun();
        headerRun.setText("TRUNG TÂM CÔNG NGHỆ PHẦN MỀM ĐẠI HỌC CẦN THƠ");
        headerRun.setBold(true);
        headerRun.setFontSize(12);
        headerRun.setFontFamily("Times New Roman");
        
        XWPFParagraph headerPara2 = document.createParagraph();
        headerPara2.setAlignment(ParagraphAlignment.LEFT);
        XWPFRun headerRun2 = headerPara2.createRun();
        headerRun2.setText("CANTHO UNIVERSITY SOFTWARE CENTER");
        headerRun2.setBold(true);
        headerRun2.setFontSize(11);
        headerRun2.setFontFamily("Times New Roman");
        
        XWPFParagraph headerPara3 = document.createParagraph();
        headerPara3.setAlignment(ParagraphAlignment.LEFT);
        XWPFRun headerRun3 = headerPara3.createRun();
        headerRun3.setText("Khu III, Đại học Cần Thơ, 01 Lý Tự Trọng, TP. Cần Thơ - Tel: 0292.3731072 & Fax: 0292.3731071 - Email: cusc@ctu.edu.vn");
        headerRun3.setUnderline(org.apache.poi.xwpf.usermodel.UnderlinePatterns.SINGLE);
        headerRun3.setFontSize(10);
        headerRun3.setFontFamily("Times New Roman");
        
        document.createParagraph();
    }
    
    private void addMinutesHeader(XWPFDocument document) {
        // Header cho biên bản - format đúng mẫu với 2 cột
        XWPFTable headerTable = document.createTable(1, 2);
        headerTable.setWidth("100%");
        
        // Left column - Đơn vị
        XWPFTableCell leftCell = headerTable.getRow(0).getCell(0);
        leftCell.removeParagraph(0);
        XWPFParagraph leftPara1 = leftCell.addParagraph();
        XWPFRun leftRun1 = leftPara1.createRun();
        leftRun1.setText("TRUNG TÂM CÔNG NGHỆ PHẦN MỀM");
        leftRun1.setBold(true);
        leftRun1.setFontSize(12);
        leftRun1.setFontFamily("Times New Roman");
        
        XWPFParagraph leftPara2 = leftCell.addParagraph();
        XWPFRun leftRun2 = leftPara2.createRun();
        leftRun2.setText("BỘ PHẬN ĐÀO TẠO");
        leftRun2.setBold(true);
        leftRun2.setFontSize(12);
        leftRun2.setFontFamily("Times New Roman");
        
        // Right column - Quốc hiệu
        XWPFTableCell rightCell = headerTable.getRow(0).getCell(1);
        rightCell.removeParagraph(0);
        XWPFParagraph rightPara1 = rightCell.addParagraph();
        rightPara1.setAlignment(ParagraphAlignment.RIGHT);
        XWPFRun rightRun1 = rightPara1.createRun();
        rightRun1.setText("CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM");
        rightRun1.setFontSize(12);
        rightRun1.setFontFamily("Times New Roman");
        
        XWPFParagraph rightPara2 = rightCell.addParagraph();
        rightPara2.setAlignment(ParagraphAlignment.RIGHT);
        XWPFRun rightRun2 = rightPara2.createRun();
        rightRun2.setText("Độc lập - Tự do - Hạnh phúc");
        rightRun2.setUnderline(org.apache.poi.xwpf.usermodel.UnderlinePatterns.SINGLE);
        rightRun2.setFontSize(12);
        rightRun2.setFontFamily("Times New Roman");
        
        document.createParagraph();
    }
    
    private void addInfoRow(XWPFDocument document, String label, String value) {
        XWPFParagraph para = document.createParagraph();
        XWPFRun run = para.createRun();
        if (label != null && !label.isEmpty()) {
            run.setText(label + " " + value);
        } else {
            run.setText(value);
        }
        run.setFontSize(11);
        run.setFontFamily("Times New Roman");
    }
    
    private void addInfoRowCompact(XWPFDocument document, String label, String value) {
        XWPFParagraph para = document.createParagraph();
        para.setSpacingAfter(0); // Không có spacing sau
        XWPFRun run = para.createRun();
        if (label != null && !label.isEmpty()) {
            run.setText(label + " " + value);
        } else {
            run.setText(value);
        }
        run.setFontSize(10); // Giảm font size
        run.setFontFamily("Times New Roman");
    }
    
    private void addBulletPoint(XWPFDocument document, String text) {
        XWPFParagraph para = document.createParagraph();
        XWPFRun run = para.createRun();
        run.setText("- " + text);
        run.setFontSize(11);
        run.setFontFamily("Times New Roman");
    }
    
    private void addBulletPointCompact(XWPFDocument document, String text) {
        XWPFParagraph para = document.createParagraph();
        para.setSpacingAfter(0); // Không có spacing sau
        XWPFRun run = para.createRun();
        if (text == null || text.isEmpty()) {
            run.setText("- ");
        } else {
            run.setText("- " + text);
        }
        run.setFontSize(10); // Giảm font size
        run.setFontFamily("Times New Roman");
    }
    
    private String getWorkTask(TrialAttendeeRole role) {
        if (role == null) return "";
        switch (role) {
            case CHU_TOA:
                return "Đánh giá giảng thử, Chủ tọa";
            case THU_KY:
                return "Đánh giá giảng thử, Thư ký";
            case THANH_VIEN:
                return "Đánh giá giảng thử";
            default:
                return "";
        }
    }

    private int addInfoRow(Sheet sheet, int rowNum, String label, String value, CellStyle normalStyle, CellStyle boldStyle) {
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

    private void setCellText(XWPFTableCell cell, String text, boolean bold) {
        cell.removeParagraph(0);
        XWPFParagraph para = cell.addParagraph();
        para.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun run = para.createRun();
        run.setText(text);
        run.setBold(bold);
        run.setFontSize(11);
        run.setFontFamily("Times New Roman");
    }
    
    private void setCellTextCompact(XWPFTableCell cell, String text, boolean bold) {
        cell.removeParagraph(0);
        XWPFParagraph para = cell.addParagraph();
        para.setAlignment(ParagraphAlignment.CENTER);
        para.setSpacingAfter(0); // Không có spacing
        para.setSpacingBefore(0);
        XWPFRun run = para.createRun();
        run.setText(text);
        run.setBold(bold);
        run.setFontSize(10); // Giảm font size
        run.setFontFamily("Times New Roman");
    }
    
    private void setTableSpacing(XWPFTable table) {
        // Giảm spacing trong bảng
        for (XWPFTableRow row : table.getRows()) {
            row.setHeight(200); // Giảm chiều cao dòng
            for (XWPFTableCell cell : row.getTableCells()) {
                cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.CENTER);
            }
        }
    }

    private String getRoleName(TrialAttendeeRole role) {
        if (role == null) return "";
        switch (role) {
            case CHU_TOA:
                return "Chủ tọa";
            case THU_KY:
                return "Thư ký";
            case THANH_VIEN:
                return "Thành viên";
            default:
                return "";
        }
    }

    private String getStatusName(TrialStatus status) {
        if (status == null) return "";
        switch (status) {
            case PENDING:
                return "Chờ chấm";
            case REVIEWED:
                return "Đang chấm";
            case PASSED:
                return "Đạt";
            case FAILED:
                return "Không đạt";
            default:
                return "";
        }
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

