package com.example.teacherservice.service.subject;

import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.SubjectSystemRepository;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.WorkbookUtil;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubjectExportService {

    private final SubjectSystemRepository systemRepo;
    private final SubjectRepository subjectRepo;

    public void exportExcel(HttpServletResponse response) {
        try (Workbook workbook = new XSSFWorkbook()) {

            List<SubjectSystem> systems = systemRepo.findAll();

            for (SubjectSystem system : systems) {

                List<Subject> subjects = subjectRepo.findBySystem(system);
                if (subjects == null || subjects.isEmpty()) continue;

                String safeSheet = WorkbookUtil.createSafeSheetName(
                        system.getSystemName().length() > 31
                                ? system.getSystemName().substring(0, 31)
                                : system.getSystemName()
                );

                Sheet sheet = workbook.createSheet(safeSheet);

                createSystemSheet(sheet, subjects, workbook);
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

    private void createSystemSheet(Sheet sheet, List<Subject> subjects, Workbook wb) {

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
        List<Subject> noSemester = subjects.stream()
                .filter(s -> s.getSemester() == null)
                .collect(Collectors.toList());

        Map<Semester, List<Subject>> groups =
                subjects.stream()
                        .filter(s -> s.getSemester() != null)
                        .collect(Collectors.groupingBy(Subject::getSemester));


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
            List<Subject> sem1 = groups.getOrDefault(Semester.SEMESTER_1, new ArrayList<>());
            sem1.addAll(noSemester);
            sem1.sort(Comparator.comparing(Subject::getSubjectName));
            groups.put(Semester.SEMESTER_1, sem1);
        }

        // ============================================
        // CASE 3: EXPORT THEO TỪNG HỌC KỲ BÌNH THƯỜNG
        // ============================================
        for (Semester sem : Semester.values()) {
            List<Subject> list = groups.get(sem);
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
    private int writeAllSkillRows(Sheet sheet, List<Subject> list, int rowIndex) {
        list.sort(Comparator.comparing(Subject::getSubjectName));

        for (Subject s : list) {
            Row r = sheet.createRow(rowIndex++);

            r.createCell(0).setCellValue(s.getSubjectName());
            r.createCell(1).setCellValue(s.getSubjectCode() == null ? "" : s.getSubjectCode());

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
    private int writeNormalRows(Sheet sheet, List<Subject> list, int rowIndex) {
        list.sort(Comparator.comparing(Subject::getSubjectName));

        for (Subject s : list) {
            Row r = sheet.createRow(rowIndex++);

            r.createCell(0).setCellValue(s.getSubjectName());
            r.createCell(1).setCellValue(s.getSubjectCode() == null ? "" : s.getSubjectCode());

            Cell hourCell = r.createCell(2);
            if (s.getHours() != null) hourCell.setCellValue(s.getHours());
            else hourCell.setCellValue("");

            r.createCell(3).setCellValue(
                    s.getDescription() == null ? "" : s.getDescription()
            );
        }

        return rowIndex;
    }
}
