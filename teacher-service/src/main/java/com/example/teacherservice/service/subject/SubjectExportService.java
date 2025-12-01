package com.example.teacherservice.service.subject;

import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.Skill;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.model.SubjectSystemAssignment;
import com.example.teacherservice.repository.SkillRepository;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.SubjectSystemAssignmentRepository;
import com.example.teacherservice.repository.SubjectSystemRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.util.WorkbookUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectExportService {
    private final SubjectSystemRepository systemRepo;
    private final SubjectSystemAssignmentRepository assignmentRepo;
    private final SkillRepository skillRepo;
    private static final DateTimeFormatter MONTH_FORMATTER = DateTimeFormatter.ofPattern("MM/yyyy");

    private static final String TITLE_LINE_1 = "KHUNG CHƯƠNG TRÌNH ĐÀO TẠO LẬP TRÌNH VIÊN QUỐC TẾ";
    private static final String TITLE_LINE_2 = "CHƯƠNG TRÌNH ĐANG TRIỂN KHAI TẠI CUSC";
    private static final String TITLE_LINE_3 = "(Hiện đang triển khai)";

    public void exportExcel(HttpServletResponse response) {
        try (Workbook workbook = new XSSFWorkbook()) {

            List<SubjectSystem> systems = systemRepo.findAll();

            for (SubjectSystem system : systems) {

                List<SubjectSystemAssignment> assignments =
                        assignmentRepo.findBySystemAndIsActive(system, true);
                if (assignments == null || assignments.isEmpty()) continue;

                String safeSheet = WorkbookUtil.createSafeSheetName(
                        system.getSystemName().length() > 31
                                ? system.getSystemName().substring(0, 31)
                                : system.getSystemName()
                );

                Sheet sheet = workbook.createSheet(safeSheet);

                createSystemSheet(sheet, assignments, workbook);
            }

            response.setContentType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition",
                    "attachment; filename=subjects_export.xlsx");

            workbook.write(response.getOutputStream());

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Export Excel thất bại: " + e.getMessage(), e);
        }
    }

    public void exportSystemTemplate(String systemId, HttpServletResponse response) {
        SubjectSystem system = systemRepo.findById(systemId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hệ đào tạo"));

        List<SubjectSystemAssignment> assignments =
                assignmentRepo.findBySystemAndIsActive(system, true);

        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("Khung chương trình");
            configureColumns(sheet);

            ExportStyles styles = new ExportStyles(workbook);

            int rowIndex = 0;
            rowIndex = writeTitleBlock(sheet, rowIndex, system, styles);

            Map<Semester, List<SubjectSystemAssignment>> groups = assignments.stream()
                    .filter(sub -> resolveSemester(sub) != null)
                    .collect(Collectors.groupingBy(this::resolveSemester));

            for (Semester semester : Semester.values()) {
                List<SubjectSystemAssignment> list = new ArrayList<>(groups.getOrDefault(semester, List.of()));
                list.sort(Comparator.comparing(
                                (SubjectSystemAssignment a) -> nullSafe(a.getSubject().getSkillCode()),
                                Comparator.nullsLast(String::compareTo))
                        .thenComparing(a -> nullSafe(a.getSubject().getSubjectName()),
                                Comparator.nullsLast(String::compareTo)));
                rowIndex = writeSemesterBlock(sheet, rowIndex, semester, list, styles);
                rowIndex++; // blank line between blocks
            }

            List<SubjectSystemAssignment> noSemester = assignments.stream()
                    .filter(sub -> resolveSemester(sub) == null)
                    .sorted(Comparator.comparing(
                            a -> nullSafe(a.getSubject().getSubjectName()),
                            Comparator.nullsLast(String::compareTo)))
                    .toList();

            if (!noSemester.isEmpty()) {
                rowIndex = writeCustomBlock(sheet, rowIndex, "Chưa phân học kỳ", noSemester, styles);
            }

            response.setContentType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition",
                    "attachment; filename=khung_" + system.getSystemCode() + ".xlsx");
            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            throw new RuntimeException("Không thể xuất file khung chương trình", e);
        }
    }

    public void exportAllSkills(HttpServletResponse response) {
        try (Workbook workbook = new XSSFWorkbook()) {
            Sheet sheet = workbook.createSheet("All Skills");
            configureAllSkillColumns(sheet);
            ExportStyles styles = new ExportStyles(workbook);

            int rowIndex = 0;
            rowIndex = writeMergedRow(sheet, rowIndex,
                    "All Skills in Aptech Portal", styles.title);
            rowIndex++;

            Row header = sheet.createRow(rowIndex++);
            createCell(header, 0, "Skill No", styles.tableHeader);
            createCell(header, 1, "Skill Name", styles.tableHeader);
            createCell(header, 2, "", styles.tableHeader); // Note column

            List<Skill> skills = skillRepo.findAllByOrderBySkillCodeAsc();
            
            // Sort by numeric value of skill code
            skills.sort((s1, s2) -> {
                String code1 = s1.getSkillCode();
                String code2 = s2.getSkillCode();
                
                if (code1 == null && code2 == null) return 0;
                if (code1 == null) return 1;
                if (code2 == null) return -1;
                
                try {
                    Integer num1 = Integer.parseInt(code1);
                    Integer num2 = Integer.parseInt(code2);
                    return num1.compareTo(num2);
                } catch (NumberFormatException e) {
                    return code1.compareTo(code2);
                }
            });

            DateTimeFormatter monthYearFormatter = DateTimeFormatter.ofPattern("MM/yyyy");

            for (Skill skill : skills) {
                Row row = sheet.createRow(rowIndex++);
                
                // Determine style based on isNew and Date
                CellStyle leftStyle = styles.dataLeft;
                CellStyle centerStyle = styles.dataCenter;
                
                String note = "";
                if (Boolean.TRUE.equals(skill.getIsNew())) {
                    String dateStr = "";
                    if (skill.getUpdateTimestamp() != null) {
                        dateStr = skill.getUpdateTimestamp().format(monthYearFormatter);
                    } else if (skill.getCreationTimestamp() != null) {
                        dateStr = skill.getCreationTimestamp().format(monthYearFormatter);
                    }
                    note = "New " + dateStr;

                    // Apply colors based on year/date to match Image 1 style
                    if (dateStr.endsWith("2024")) {
                        if (dateStr.startsWith("06") || dateStr.startsWith("05") || dateStr.startsWith("04")) {
                            leftStyle = styles.styleOrangeLeft;
                            centerStyle = styles.styleOrangeCenter;
                        } else {
                            leftStyle = styles.styleYellowLeft;
                            centerStyle = styles.styleYellowCenter;
                        }
                    } else if (dateStr.endsWith("2025")) {
                        if (dateStr.startsWith("03") || dateStr.startsWith("01") || dateStr.startsWith("02")) {
                            leftStyle = styles.styleGreenLeft;
                            centerStyle = styles.styleGreenCenter;
                        } else {
                            leftStyle = styles.styleBlueLeft;
                            centerStyle = styles.styleBlueCenter;
                        }
                    } else if (dateStr.endsWith("2026")) {
                        leftStyle = styles.stylePinkLeft;
                        centerStyle = styles.stylePinkCenter;
                    } else {
                        // Default for other new items
                        leftStyle = styles.styleGreenLeft;
                        centerStyle = styles.styleGreenCenter;
                    }
                }

                // Skill No
                createCell(row, 0, nullSafe(skill.getSkillCode()), centerStyle);
                
                // Skill Name
                createCell(row, 1, nullSafe(skill.getSkillName()), leftStyle);
                
                // Note (New MM/yyyy)
                createCell(row, 2, note, leftStyle);
            }

            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=all_skill_in_aptech.xlsx");
            workbook.write(response.getOutputStream());
        } catch (IOException e) {
            throw new RuntimeException("Không thể xuất danh sách All Skill", e);
        }
    }

    private void createSystemSheet(Sheet sheet, List<SubjectSystemAssignment> assignments, Workbook wb) {

        CellStyle headerStyle = wb.createCellStyle();
        Font font = wb.createFont();
        font.setBold(true);
        headerStyle.setFont(font);

        sheet.setDefaultColumnWidth(25);
        int rowIndex = 0;

        // Title
        Row title = sheet.createRow(rowIndex++);
        title.createCell(0).setCellValue("DANH SÁCH MÔN HỌC");
        title.getCell(0).setCellStyle(headerStyle);

        rowIndex++;

        // --- Separate null semester ---
        List<SubjectSystemAssignment> noSemester = assignments.stream()
                .filter(s -> resolveSemester(s) == null)
                .collect(Collectors.toList());

        Map<Semester, List<SubjectSystemAssignment>> groups =
                assignments.stream()
                        .filter(s -> resolveSemester(s) != null)
                        .collect(Collectors.groupingBy(this::resolveSemester));


        // ============================================
        // CASE 1: ALL SKILL → TẤT CẢ MÔN ĐỀU NULL SEMESTER
        // ============================================
        if (groups.isEmpty() && !noSemester.isEmpty()) {
            writeAllSkillHeader(sheet, rowIndex++, headerStyle);
            writeAllSkillRows(sheet, noSemester, rowIndex);
            return;
        }

        // ============================================
        // CASE 2: GHÉP NULL SEMESTER → HK1
        // ============================================
        if (!noSemester.isEmpty()) {
            List<SubjectSystemAssignment> sem1 = groups.getOrDefault(Semester.SEMESTER_1, new ArrayList<>());
            sem1.addAll(noSemester);
            sem1.sort(Comparator.comparing(a -> nullSafe(a.getSubject().getSubjectName())));
            groups.put(Semester.SEMESTER_1, sem1);
        }

        // ============================================
        // CASE 3: EXPORT THEO TỪNG HỌC KỲ BÌNH THƯỜNG
        // ============================================
        for (Semester sem : Semester.values()) {
            List<SubjectSystemAssignment> list = groups.get(sem);
            if (list == null || list.isEmpty()) continue;

            Row semRow = sheet.createRow(rowIndex++);
            semRow.createCell(0)
                    .setCellValue("Học kỳ " + sem.name().replace("SEMESTER_", ""));
            semRow.getCell(0).setCellStyle(headerStyle);

            writeNormalHeader(sheet, rowIndex++, headerStyle);
            rowIndex = writeNormalRows(sheet, list, rowIndex);

            rowIndex++;
        }
    }

    // ----------------------------------------
    // HEADER CHO ALL SKILL
    // ----------------------------------------
    private void writeAllSkillHeader(Sheet sheet, int rowIndex, CellStyle headerStyle) {
        String[] cols = {"Skill Name", "Skill No", "NEW?"};

        Row h = sheet.createRow(rowIndex);
        for (int i = 0; i < cols.length; i++) {
            Cell c = h.createCell(i);
            c.setCellValue(cols[i]);
            c.setCellStyle(headerStyle);
        }
    }

    // ----------------------------------------
    // ROW CHO ALL SKILL
    // ----------------------------------------
    private int writeAllSkillRows(Sheet sheet, List<SubjectSystemAssignment> list, int rowIndex) {
        list.sort(Comparator.comparing(a -> nullSafe(a.getSubject().getSubjectName())));

        for (SubjectSystemAssignment assignment : list) {
            Subject s = assignment.getSubject();
            Row r = sheet.createRow(rowIndex++);

            r.createCell(0).setCellValue(s.getSubjectName());
            r.createCell(1).setCellValue(s.getSkillCode() == null ? "" : s.getSkillCode());

            // Cột NEW?
            r.createCell(2).setCellValue(
                    s.getIsNewSubject() != null && s.getIsNewSubject() ? "YES" : ""
            );
        }

        return rowIndex;
    }

    // ----------------------------------------
    // HEADER NORMAL (HK1, HK2, HK3...)
    // ----------------------------------------
    private void writeNormalHeader(Sheet sheet, int rowIndex, CellStyle headerStyle) {
        String[] cols = {"Tên môn học", "Skill No", "Giờ (Hours)", "Ghi chú / Description"};

        Row h = sheet.createRow(rowIndex);
        for (int i = 0; i < cols.length; i++) {
            Cell c = h.createCell(i);
            c.setCellValue(cols[i]);
            c.setCellStyle(headerStyle);
        }
    }

    // ----------------------------------------
    // ROW NORMAL
    // ----------------------------------------
    private int writeNormalRows(Sheet sheet, List<SubjectSystemAssignment> list, int rowIndex) {
        list.sort(Comparator.comparing(a -> nullSafe(a.getSubject().getSubjectName())));

        for (SubjectSystemAssignment assignment : list) {
            Subject s = assignment.getSubject();
            Row r = sheet.createRow(rowIndex++);

            r.createCell(0).setCellValue(s.getSubjectName());
            r.createCell(1).setCellValue(s.getSkillCode() == null ? "" : s.getSkillCode());

            Cell hourCell = r.createCell(2);
            Integer hours = assignment.getHours() != null ? assignment.getHours() : s.getHours();
            if (hours != null) hourCell.setCellValue(hours);
            else hourCell.setCellValue("");

            r.createCell(3).setCellValue(
                    s.getSkillName() == null ? "" : s.getSkillName()
            );
        }

        return rowIndex;
    }

    private void configureColumns(Sheet sheet) {
        sheet.setColumnWidth(0, 256 * 6);   // STT
        sheet.setColumnWidth(1, 256 * 45);  // Tên môn học
        sheet.setColumnWidth(2, 256 * 20);  // Skill No
        sheet.setColumnWidth(3, 256 * 50);  // Ghi chú - expanded width
    }

    private void configureAllSkillColumns(Sheet sheet) {
        sheet.setColumnWidth(0, 256 * 12);  // Skill No
        sheet.setColumnWidth(1, 256 * 85);  // Skill Name
        sheet.setColumnWidth(2, 256 * 20);  // Note (New MM/yyyy)
    }
    
    private int writeTitleBlock(Sheet sheet, int rowIndex, SubjectSystem system, ExportStyles styles) {
        rowIndex = writeMergedRow(sheet, rowIndex, TITLE_LINE_1, styles.title);
        rowIndex = writeMergedRow(sheet, rowIndex, TITLE_LINE_2, styles.subtitle);
        rowIndex = writeMergedRow(sheet, rowIndex, TITLE_LINE_3, styles.status);

        rowIndex++; // blank row

        Row programLine = sheet.createRow(rowIndex++);
        createCell(programLine, 0, "Mã hệ đào tạo: " + nullSafe(system.getSystemCode()), styles.meta);
        createCell(programLine, 1, "Tên hệ đào tạo: " + nullSafe(system.getSystemName()), styles.meta);
        sheet.addMergedRegion(new CellRangeAddress(programLine.getRowNum(), programLine.getRowNum(), 0, 3));

        rowIndex++; // blank row
        return rowIndex;
    }

    private int writeSemesterBlock(
            Sheet sheet,
            int rowIndex,
            Semester semester,
            List<SubjectSystemAssignment> assignments,
            ExportStyles styles
    ) {
        String label = "Học kỳ " + semester.name().replace("SEMESTER_", "");
        CellStyle headerStyle = styles.semesterHeader(semester);

        rowIndex = writeMergedRow(sheet, rowIndex, label, headerStyle);

        Row header = sheet.createRow(rowIndex++);
        createCell(header, 0, "STT", styles.tableHeader);
        createCell(header, 1, "Tên môn học", styles.tableHeader);
        createCell(header, 2, "Skill No", styles.tableHeader);
        createCell(header, 3, "Ghi chú", styles.tableHeader);

        if (assignments.isEmpty()) {
            Row emptyRow = sheet.createRow(rowIndex++);
            createCell(emptyRow, 1, "Hiện chưa có môn học cho học kỳ này", styles.emptyRow);
            sheet.addMergedRegion(new CellRangeAddress(emptyRow.getRowNum(), emptyRow.getRowNum(), 1, 3));
            return rowIndex;
        }

        int order = 1;
        for (SubjectSystemAssignment assignment : assignments) {
            Subject subject = assignment.getSubject();
            Row row = sheet.createRow(rowIndex++);
            createCell(row, 0, String.valueOf(order++), styles.dataCenter);
            createCell(row, 1, nullSafe(subject.getSubjectName()), styles.dataLeft);
            createCell(row, 2, nullSafe(subject.getSkillCode()), styles.dataCenter);
            createCell(row, 3, nullSafe(subject.getSkillName()), styles.dataLeftWrap);
        }

        return rowIndex;
    }

    private int writeCustomBlock(
            Sheet sheet,
            int rowIndex,
            String title,
            List<SubjectSystemAssignment> assignments,
            ExportStyles styles
    ) {
        rowIndex = writeMergedRow(sheet, rowIndex, title, styles.customHeader);

        Row header = sheet.createRow(rowIndex++);
        createCell(header, 0, "STT", styles.tableHeader);
        createCell(header, 1, "Tên môn học", styles.tableHeader);
        createCell(header, 2, "Skill No", styles.tableHeader);
        createCell(header, 3, "Ghi chú", styles.tableHeader);

        int order = 1;
        for (SubjectSystemAssignment assignment : assignments) {
            Subject subject = assignment.getSubject();
            Row row = sheet.createRow(rowIndex++);
            createCell(row, 0, String.valueOf(order++), styles.dataCenter);
            createCell(row, 1, nullSafe(subject.getSubjectName()), styles.dataLeft);
            createCell(row, 2, nullSafe(subject.getSkillCode()), styles.dataCenter);
            createCell(row, 3, nullSafe(subject.getSkillName()), styles.dataLeftWrap);
        }
        return rowIndex;
    }

    private int writeMergedRow(Sheet sheet, int rowIndex, String text, CellStyle style) {
        Row row = sheet.createRow(rowIndex++);
        createCell(row, 0, text, style);
        sheet.addMergedRegion(new CellRangeAddress(row.getRowNum(), row.getRowNum(), 0, 3));
        return rowIndex;
    }

    private void createCell(Row row, int column, String value, CellStyle style) {
        Cell cell = row.createCell(column);
        cell.setCellValue(value == null ? "" : value);
        cell.setCellStyle(style);
    }

    private String nullSafe(String value) {
        return value == null ? "" : value;
    }

    private Semester resolveSemester(SubjectSystemAssignment assignment) {
        if (assignment.getSemester() != null) {
            return assignment.getSemester();
        }
        Subject subject = assignment.getSubject();
        return subject != null ? subject.getSemester() : null;
    }

    private static class ExportStyles {
        private final CellStyle title;
        private final CellStyle subtitle;
        private final CellStyle status;
        private final CellStyle meta;
        private final CellStyle tableHeader;
        private final CellStyle dataLeft;
        private final CellStyle dataLeftWrap;
        private final CellStyle dataCenter;
        private final CellStyle emptyRow;
        private final CellStyle customHeader;
        private final CellStyle newBadge;
        
        // Dynamic Color Styles
        private final CellStyle styleOrangeLeft;
        private final CellStyle styleOrangeCenter;
        private final CellStyle styleYellowLeft;
        private final CellStyle styleYellowCenter;
        private final CellStyle styleGreenLeft;
        private final CellStyle styleGreenCenter;
        private final CellStyle styleBlueLeft;
        private final CellStyle styleBlueCenter;
        private final CellStyle stylePinkLeft;
        private final CellStyle stylePinkCenter;

        private final Map<Semester, CellStyle> semesterHeaderStyles = new EnumMap<>(Semester.class);

        private ExportStyles(Workbook workbook) {
            this.title = createTitleStyle(workbook, (short) 20, true);
            this.subtitle = createTitleStyle(workbook, (short) 12, true);
            this.status = createStatusStyle(workbook);
            this.meta = createMetaStyle(workbook);
            this.tableHeader = createTableHeaderStyle(workbook);
            this.dataLeft = createDataStyle(workbook, HorizontalAlignment.LEFT, false);
            this.dataLeftWrap = createDataStyle(workbook, HorizontalAlignment.LEFT, true);
            this.dataCenter = createDataStyle(workbook, HorizontalAlignment.CENTER, false);
            this.emptyRow = createEmptyRowStyle(workbook);
            this.customHeader = createBlockHeaderStyle(workbook, IndexedColors.GREY_50_PERCENT.getIndex());
            this.newBadge = createNewBadgeStyle(workbook);
            
            // Initialize Dynamic Styles
            this.styleOrangeLeft = createColoredStyle(workbook, HorizontalAlignment.LEFT, IndexedColors.LIGHT_ORANGE.getIndex());
            this.styleOrangeCenter = createColoredStyle(workbook, HorizontalAlignment.CENTER, IndexedColors.LIGHT_ORANGE.getIndex());
            
            this.styleYellowLeft = createColoredStyle(workbook, HorizontalAlignment.LEFT, IndexedColors.LEMON_CHIFFON.getIndex());
            this.styleYellowCenter = createColoredStyle(workbook, HorizontalAlignment.CENTER, IndexedColors.LEMON_CHIFFON.getIndex());
            
            this.styleGreenLeft = createColoredStyle(workbook, HorizontalAlignment.LEFT, IndexedColors.LIGHT_GREEN.getIndex());
            this.styleGreenCenter = createColoredStyle(workbook, HorizontalAlignment.CENTER, IndexedColors.LIGHT_GREEN.getIndex());
            
            this.styleBlueLeft = createColoredStyle(workbook, HorizontalAlignment.LEFT, IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            this.styleBlueCenter = createColoredStyle(workbook, HorizontalAlignment.CENTER, IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex());
            
            this.stylePinkLeft = createColoredStyle(workbook, HorizontalAlignment.LEFT, IndexedColors.ROSE.getIndex());
            this.stylePinkCenter = createColoredStyle(workbook, HorizontalAlignment.CENTER, IndexedColors.ROSE.getIndex());

            semesterHeaderStyles.put(Semester.SEMESTER_1,
                    createBlockHeaderStyle(workbook, IndexedColors.LIGHT_GREEN.getIndex()));
            semesterHeaderStyles.put(Semester.SEMESTER_2,
                    createBlockHeaderStyle(workbook, IndexedColors.LIGHT_CORNFLOWER_BLUE.getIndex()));
            semesterHeaderStyles.put(Semester.SEMESTER_3,
                    createBlockHeaderStyle(workbook, IndexedColors.LIGHT_ORANGE.getIndex()));
            semesterHeaderStyles.put(Semester.SEMESTER_4,
                    createBlockHeaderStyle(workbook, IndexedColors.GREY_25_PERCENT.getIndex()));
        }
        
        private CellStyle createColoredStyle(Workbook wb, HorizontalAlignment align, short colorIndex) {
            CellStyle style = createDataStyle(wb, align, false);
            style.setFillForegroundColor(colorIndex);
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            return style;
        }

        private CellStyle semesterHeader(Semester semester) {
            return semesterHeaderStyles.getOrDefault(semester, customHeader);
        }

        private CellStyle createTitleStyle(Workbook wb, short fontSize, boolean bold) {
            CellStyle style = wb.createCellStyle();
            style.setAlignment(HorizontalAlignment.CENTER);
            style.setVerticalAlignment(VerticalAlignment.CENTER);
            Font font = wb.createFont();
            font.setBold(bold);
            font.setFontHeightInPoints(fontSize);
            style.setFont(font);
            return style;
        }

        private CellStyle createStatusStyle(Workbook wb) {
            CellStyle style = createTitleStyle(wb, (short) 11, false);
            Font font = wb.createFont();
            font.setItalic(true);
            font.setColor(IndexedColors.RED.getIndex());
            style.setFont(font);
            return style;
        }

        private CellStyle createMetaStyle(Workbook wb) {
            CellStyle style = wb.createCellStyle();
            style.setAlignment(HorizontalAlignment.LEFT);
            style.setVerticalAlignment(VerticalAlignment.CENTER);
            Font font = wb.createFont();
            font.setBold(true);
            style.setFont(font);
            return style;
        }

        private CellStyle createTableHeaderStyle(Workbook wb) {
            CellStyle style = createBlockHeaderStyle(wb, IndexedColors.GREY_40_PERCENT.getIndex());
            style.setAlignment(HorizontalAlignment.CENTER);
            return style;
        }

        private CellStyle createBlockHeaderStyle(Workbook wb, short bg) {
            CellStyle style = wb.createCellStyle();
            style.setFillForegroundColor(bg);
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            style.setAlignment(HorizontalAlignment.LEFT);
            style.setVerticalAlignment(VerticalAlignment.CENTER);
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            Font font = wb.createFont();
            font.setBold(true);
            style.setFont(font);
            return style;
        }

        private CellStyle createDataStyle(Workbook wb,
                                         HorizontalAlignment alignment,
                                         boolean wrap) {
            CellStyle style = wb.createCellStyle();
            style.setAlignment(alignment);
            style.setVerticalAlignment(VerticalAlignment.TOP);
            style.setWrapText(wrap);
            style.setBorderTop(BorderStyle.THIN);
            style.setBorderBottom(BorderStyle.THIN);
            style.setBorderLeft(BorderStyle.THIN);
            style.setBorderRight(BorderStyle.THIN);
            return style;
        }

        private CellStyle createEmptyRowStyle(Workbook wb) {
            CellStyle style = createDataStyle(wb, HorizontalAlignment.CENTER, true);
            Font font = wb.createFont();
            font.setItalic(true);
            font.setColor(IndexedColors.GREY_50_PERCENT.getIndex());
            style.setFont(font);
            return style;
        }

        private CellStyle createNewBadgeStyle(Workbook wb) {
            CellStyle style = createDataStyle(wb, HorizontalAlignment.CENTER, false);
            style.setFillForegroundColor(IndexedColors.LIGHT_GREEN.getIndex());
            style.setFillPattern(FillPatternType.SOLID_FOREGROUND);
            Font font = wb.createFont();
            font.setBold(true);
            style.setFont(font);
            return style;
        }
    }
}
