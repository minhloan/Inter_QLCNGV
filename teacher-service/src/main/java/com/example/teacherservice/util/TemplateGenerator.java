package com.example.teacherservice.util;

import org.apache.poi.xwpf.usermodel.*;
import org.springframework.stereotype.Component;

import java.io.FileOutputStream;
import java.io.IOException;

/**
 * Utility class để generate template Word mẫu với placeholder Freemarker
 * Chạy main method này để tạo file template, sau đó mở trong Word để chỉnh sửa format
 */
@Component
public class TemplateGenerator {

    public static void main(String[] args) throws IOException {
        TemplateGenerator generator = new TemplateGenerator();
        
        // Generate BM06.39 template
        generator.generateBM0639Template("src/main/resources/templates/BM06.39-template.docx");

        // Generate BM06.41 template
        generator.generateBM0641Template("src/main/resources/templates/BM06.41-template.doc");
    }

    /**
     * Generate template BM06.39 - Phân công đánh giá giáo viên giảng thử
     */
    public void generateBM0639Template(String filePath) throws IOException {
        XWPFDocument document = new XWPFDocument();

        // Header - Thông tin trung tâm
        XWPFParagraph headerPara = document.createParagraph();
        XWPFRun headerRun = headerPara.createRun();
        headerRun.setText("TRUNG TÂM CÔNG NGHỆ PHẦN MỀM ĐẠI HỌC CẦN THƠ");
        headerRun.setFontSize(12);
        headerRun.setFontFamily("Times New Roman");
        headerRun.setBold(true);

        XWPFParagraph headerPara2 = document.createParagraph();
        XWPFRun headerRun2 = headerPara2.createRun();
        headerRun2.setText("CANTHO UNIVERSITY SOFTWARE CENTER");
        headerRun2.setFontSize(12);
        headerRun2.setFontFamily("Times New Roman");
        headerRun2.setBold(true);

        XWPFParagraph headerPara3 = document.createParagraph();
        XWPFRun headerRun3 = headerPara3.createRun();
        headerRun3.setText("Khu III, Đại học Cần Thơ, 01 Lý Tự Trọng, TP. Cần Thơ - Tel: 0292.3731072 & Fax: 0292.3731071 - Email: cusc@ctu.edu.vn");
        headerRun3.setFontSize(11);
        headerRun3.setFontFamily("Times New Roman");

        // Empty line
        document.createParagraph();

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

        // Empty line
        document.createParagraph();

        // Section 1: Thông tin chung
        XWPFParagraph section1 = document.createParagraph();
        XWPFRun section1Run = section1.createRun();
        section1Run.setText("1. Thông tin chung:");
        section1Run.setBold(true);
        section1Run.setFontSize(13);
        section1Run.setFontFamily("Times New Roman");

        // Date
        XWPFParagraph datePara = document.createParagraph();
        XWPFRun dateRun = datePara.createRun();
        dateRun.setText("Ngày: ${date}");
        dateRun.setFontSize(12);
        dateRun.setFontFamily("Times New Roman");

        // Time
        XWPFParagraph timePara = document.createParagraph();
        XWPFRun timeRun = timePara.createRun();
        timeRun.setText("Thời gian: ${time}");
        timeRun.setFontSize(12);
        timeRun.setFontFamily("Times New Roman");

        // Location
        XWPFParagraph locationPara = document.createParagraph();
        XWPFRun locationRun = locationPara.createRun();
        locationRun.setText("Địa điểm: ${location}");
        locationRun.setFontSize(12);
        locationRun.setFontFamily("Times New Roman");

        // Empty line
        document.createParagraph();

        // Section 2: Thành phần tham dự
        XWPFParagraph section2 = document.createParagraph();
        XWPFRun section2Run = section2.createRun();
        section2Run.setText("2. Thành phần tham dự:");
        section2Run.setBold(true);
        section2Run.setFontSize(13);
        section2Run.setFontFamily("Times New Roman");

        // Create table attendees
        XWPFTable attendeesTable = document.createTable(1, 4);
        attendeesTable.setWidth("100%");

        // Header row
        XWPFTableRow headerRow = attendeesTable.getRow(0);
        setCellText(headerRow.getCell(0), "STT", true);
        setCellText(headerRow.getCell(1), "HỌ TÊN", true);
        setCellText(headerRow.getCell(2), "CHỨC VỤ", true);
        setCellText(headerRow.getCell(3), "CÔNG VIỆC", true);

        // Data row với loop - XDocReport: đặt <#list> ở cell đầu, </#list> ở cell cuối
        // QUAN TRỌNG: Chỉ có 1 data row duy nhất, XDocReport sẽ tự động duplicate
        XWPFTableRow dataRow = attendeesTable.createRow();
        setCellText(dataRow.getCell(0), "<#list attendees as attendee>${attendee.stt}");
        setCellText(dataRow.getCell(1), "${attendee.name}");
        setCellText(dataRow.getCell(2), "${attendee.position}");
        setCellText(dataRow.getCell(3), "${attendee.workTask}</#list>");

        // Empty line
        document.createParagraph();

        // Section 3: Giáo viên giảng dạy
        XWPFParagraph section3 = document.createParagraph();
        XWPFRun section3Run = section3.createRun();
        section3Run.setText("3. Giáo viên giảng dạy:");
        section3Run.setBold(true);
        section3Run.setFontSize(13);
        section3Run.setFontFamily("Times New Roman");

        // Create table teachers - sử dụng loop cho nhiều giáo viên
        XWPFTable teachersTable = document.createTable(1, 4);
        teachersTable.setWidth("100%");

        // Header row
        XWPFTableRow teacherHeaderRow = teachersTable.getRow(0);
        setCellText(teacherHeaderRow.getCell(0), "STT", true);
        setCellText(teacherHeaderRow.getCell(1), "HỌ TÊN GIÁO VIÊN", true);
        setCellText(teacherHeaderRow.getCell(2), "MÔN DẠY", true);
        setCellText(teacherHeaderRow.getCell(3), "THỜI GIAN DẠY", true);

        // Data row với loop - nếu có nhiều giáo viên
        // Nếu chỉ có 1 giáo viên, có thể dùng simple fields
        XWPFTableRow teacherDataRow = teachersTable.createRow();
        setCellText(teacherDataRow.getCell(0), "<#list teachers as teacher>${teacher.stt}");
        setCellText(teacherDataRow.getCell(1), "${teacher.name}");
        setCellText(teacherDataRow.getCell(2), "${teacher.subject}");
        setCellText(teacherDataRow.getCell(3), "${teacher.time}</#list>");

        // Empty line
        document.createParagraph();

        // Section 4: Ghi chú
        XWPFParagraph section4 = document.createParagraph();
        XWPFRun section4Run = section4.createRun();
        section4Run.setText("Ghi chú:");
        section4Run.setBold(true);
        section4Run.setFontSize(13);
        section4Run.setFontFamily("Times New Roman");

        // Notes list
        XWPFParagraph notesPara = document.createParagraph();
        XWPFRun notesRun = notesPara.createRun();
        notesRun.setText("<#list notes as note>- ${note}\n</#list>");
        notesRun.setFontSize(12);
        notesRun.setFontFamily("Times New Roman");

        // Empty line
        document.createParagraph();
        document.createParagraph();

        // Footer với chữ ký - 2 cột
        XWPFTable footerTable = document.createTable(1, 2);
        footerTable.setWidth("100%");

        // Left column - Người lập
        XWPFTableRow footerRow = footerTable.getRow(0);
        XWPFTableCell leftCell = footerRow.getCell(0);
        leftCell.removeParagraph(0);
        XWPFParagraph leftPara1 = leftCell.addParagraph();
        leftPara1.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun1 = leftPara1.createRun();
        leftRun1.setText("Ngày .../.../20...");
        leftRun1.setFontSize(12);
        leftRun1.setFontFamily("Times New Roman");

        XWPFParagraph leftPara2 = leftCell.addParagraph();
        leftPara2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun2 = leftPara2.createRun();
        leftRun2.setText("NGƯỜI LẬP");
        leftRun2.setBold(true);
        leftRun2.setFontSize(12);
        leftRun2.setFontFamily("Times New Roman");

        XWPFParagraph leftPara3 = leftCell.addParagraph();
        leftPara3.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun leftRun3 = leftPara3.createRun();
        leftRun3.setText("(Ký, họ tên)");
        leftRun3.setFontSize(12);
        leftRun3.setFontFamily("Times New Roman");
        leftRun3.setItalic(true);

        // Right column - Trưởng bộ môn
        XWPFTableCell rightCell = footerRow.getCell(1);
        rightCell.removeParagraph(0);
        XWPFParagraph rightPara1 = rightCell.addParagraph();
        rightPara1.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun1 = rightPara1.createRun();
        rightRun1.setText("Ngày .../.../20...");
        rightRun1.setFontSize(12);
        rightRun1.setFontFamily("Times New Roman");

        XWPFParagraph rightPara2 = rightCell.addParagraph();
        rightPara2.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun2 = rightPara2.createRun();
        rightRun2.setText("TRƯỞNG BỘ MÔN");
        rightRun2.setBold(true);
        rightRun2.setFontSize(12);
        rightRun2.setFontFamily("Times New Roman");

        XWPFParagraph rightPara3 = rightCell.addParagraph();
        rightPara3.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun rightRun3 = rightPara3.createRun();
        rightRun3.setText("(Ký, họ tên)");
        rightRun3.setFontSize(12);
        rightRun3.setFontFamily("Times New Roman");
        rightRun3.setItalic(true);

        // Save
        try (FileOutputStream out = new FileOutputStream(filePath)) {
            document.write(out);
        }
        document.close();
    }

    /**
     * Generate template BM06.41 - Biên bản đánh giá giảng thử
     */
    public void generateBM0641Template(String filePath) throws IOException {
        XWPFDocument document = new XWPFDocument();

        // Title
        XWPFParagraph titlePara = document.createParagraph();
        titlePara.setAlignment(ParagraphAlignment.CENTER);
        XWPFRun titleRun = titlePara.createRun();
        titleRun.setText("BIÊN BẢN ĐÁNH GIÁ GIẢNG THỬ");
        titleRun.setBold(true);
        titleRun.setFontSize(16);
        titleRun.setFontFamily("Times New Roman");

        // Empty line
        document.createParagraph();

        // Section 1: Thông tin chung
        XWPFParagraph section1 = document.createParagraph();
        XWPFRun section1Run = section1.createRun();
        section1Run.setText("1. Thông tin chung:");
        section1Run.setBold(true);
        section1Run.setFontSize(13);
        section1Run.setFontFamily("Times New Roman");

        // Date
        XWPFParagraph datePara = document.createParagraph();
        XWPFRun dateRun = datePara.createRun();
        dateRun.setText("Ngày: ${date}");
        dateRun.setFontSize(12);
        dateRun.setFontFamily("Times New Roman");

        // Time
        XWPFParagraph timePara = document.createParagraph();
        XWPFRun timeRun = timePara.createRun();
        timeRun.setText("Thời gian: ${time}");
        timeRun.setFontSize(12);
        timeRun.setFontFamily("Times New Roman");

        // Location
        XWPFParagraph locationPara = document.createParagraph();
        XWPFRun locationRun = locationPara.createRun();
        locationRun.setText("Địa điểm: ${location}");
        locationRun.setFontSize(12);
        locationRun.setFontFamily("Times New Roman");

        // Empty line
        document.createParagraph();

        // Section 2: Thông tin giáo viên
        XWPFParagraph section2 = document.createParagraph();
        XWPFRun section2Run = section2.createRun();
        section2Run.setText("2. Thông tin giáo viên:");
        section2Run.setBold(true);
        section2Run.setFontSize(13);
        section2Run.setFontFamily("Times New Roman");

        // Teacher name
        XWPFParagraph teacherPara = document.createParagraph();
        XWPFRun teacherRun = teacherPara.createRun();
        teacherRun.setText("Họ và tên: ${teacherName}");
        teacherRun.setFontSize(12);
        teacherRun.setFontFamily("Times New Roman");

        // Subject
        XWPFParagraph subjectPara = document.createParagraph();
        XWPFRun subjectRun = subjectPara.createRun();
        subjectRun.setText("Môn học: ${subjectName}");
        subjectRun.setFontSize(12);
        subjectRun.setFontFamily("Times New Roman");

        // Empty line
        document.createParagraph();

        // Section 3: Thành phần tham dự
        XWPFParagraph section3 = document.createParagraph();
        XWPFRun section3Run = section3.createRun();
        section3Run.setText("3. Thành phần tham dự:");
        section3Run.setBold(true);
        section3Run.setFontSize(13);
        section3Run.setFontFamily("Times New Roman");

        // Create table
        XWPFTable table = document.createTable(1, 4);
        table.setWidth("100%");

        // Header row
        XWPFTableRow headerRow = table.getRow(0);
        setCellText(headerRow.getCell(0), "STT", true);
        setCellText(headerRow.getCell(1), "HỌ TÊN", true);
        setCellText(headerRow.getCell(2), "CHỨC VỤ", true);
        setCellText(headerRow.getCell(3), "CÔNG VIỆC", true);

        // Data row với loop - XDocReport: đặt <#list> ở cell đầu, </#list> ở cell cuối
        XWPFTableRow dataRow = table.createRow();
        setCellText(dataRow.getCell(0), "<#list attendees as attendee>${attendee.stt}");
        setCellText(dataRow.getCell(1), "${attendee.name}");
        setCellText(dataRow.getCell(2), "${attendee.position}");
        setCellText(dataRow.getCell(3), "${attendee.workTask}</#list>");

        // Empty line
        document.createParagraph();

        // Section 4: Nhận xét
        XWPFParagraph section4 = document.createParagraph();
        XWPFRun section4Run = section4.createRun();
        section4Run.setText("4. Nhận xét:");
        section4Run.setBold(true);
        section4Run.setFontSize(13);
        section4Run.setFontFamily("Times New Roman");

        // Comments list - XDocReport: đặt loop directive trong cùng paragraph
        XWPFParagraph commentPara = document.createParagraph();
        XWPFRun commentRun = commentPara.createRun();
        commentRun.setText("<#list comments as comment>${comment}\n</#list>");
        commentRun.setFontSize(12);
        commentRun.setFontFamily("Times New Roman");

        // Empty line
        document.createParagraph();

        // Section 5: Kết luận
        XWPFParagraph section5 = document.createParagraph();
        XWPFRun section5Run = section5.createRun();
        section5Run.setText("5. Kết luận:");
        section5Run.setBold(true);
        section5Run.setFontSize(13);
        section5Run.setFontFamily("Times New Roman");

        XWPFParagraph conclusionPara = document.createParagraph();
        XWPFRun conclusionRun = conclusionPara.createRun();
        conclusionRun.setText("<#if conclusion??>${conclusion}<#else>................</#if>");
        conclusionRun.setFontSize(12);
        conclusionRun.setFontFamily("Times New Roman");

        // Empty line
        document.createParagraph();

        // Footer
        XWPFParagraph footer = document.createParagraph();
        footer.setAlignment(ParagraphAlignment.RIGHT);
        XWPFRun footerRun = footer.createRun();
        footerRun.setText("Ngày ... tháng ... năm ...");
        footerRun.setFontSize(12);
        footerRun.setFontFamily("Times New Roman");

        // Save
        try (FileOutputStream out = new FileOutputStream(filePath)) {
            document.write(out);
        }
        document.close();
    }

    private void setCellText(XWPFTableCell cell, String text, boolean bold) {
        cell.removeParagraph(0);
        XWPFParagraph para = cell.addParagraph();
        XWPFRun run = para.createRun();
        run.setText(text);
        run.setFontSize(11);
        run.setFontFamily("Times New Roman");
        if (bold) {
            run.setBold(true);
        }
        para.setAlignment(ParagraphAlignment.CENTER);
    }

    private void setCellText(XWPFTableCell cell, String text) {
        setCellText(cell, text, false);
    }
}

