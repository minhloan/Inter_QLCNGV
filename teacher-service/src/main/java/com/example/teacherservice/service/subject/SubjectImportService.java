package com.example.teacherservice.service.subject;

import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectSystem;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.SubjectSystemRepository;
import com.example.teacherservice.util.ExcelUtils;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SubjectImportService {

    private final SubjectRepository subjectRepo;
    private final SubjectSystemRepository systemRepo;

    public int importSystemTemplate(String systemId, MultipartFile file) {
        SubjectSystem system = systemRepo.findById(systemId)
                .orElseThrow(() -> new NotFoundException("Không tìm thấy hệ đào tạo"));

        try (InputStream in = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(in)) {

            Sheet sheet = workbook.getSheetAt(0);
            return importTemplateSheet(sheet, system);

        } catch (Exception e) {
            throw new RuntimeException("Import Excel khung chương trình thất bại: " + e.getMessage(), e);
        }
    }

    public int importExcel(MultipartFile file) {
        int totalImported = 0;

        try (InputStream in = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(in)) {

            for (Sheet sheet : workbook) {

                String sheetName = sheet.getSheetName().trim();
                System.out.println("📌 Đang xử lý Sheet: " + sheetName);

                SubjectSystem system = systemRepo.findMatchingSystem(sheetName);
                if (system == null) {
                    System.out.println("❌ Không có System phù hợp → bỏ sheet: " + sheetName);
                    continue;
                }

                System.out.println("✅ Match System: " + system.getSystemName()
                        + " (" + system.getSystemCode() + ")");

                int importedInSheet = importFlexibleSheet(sheet, system);
                totalImported += importedInSheet;

                System.out.println("✔ Sheet [" + sheetName + "] import xong: "
                        + importedInSheet + " môn");
            }

        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Import Excel thất bại: " + e.getMessage(), e);
        }

        System.out.println("🎯 Tổng số môn import: " + totalImported);
        return totalImported;
    }

    private int importFlexibleSheet(Sheet sheet, SubjectSystem system) {

        Semester currentSemester = null;
        Map<String, Integer> col = new HashMap<>();
        boolean headerDetected = false;
        int count = 0;

        for (Row row : sheet) {

            // ===================== GHÉP TEXT TOÀN DÒNG =====================
            StringBuilder sb = new StringBuilder();
            for (int i = 0; i < row.getLastCellNum(); i++) {
                String v = ExcelUtils.getString(row, i);
                if (v != null) sb.append(v.trim().toLowerCase()).append(" ");
            }
            String rowText = sb.toString().trim();

            // ===================== DETECT HỌC KỲ ============================
            if (rowText.contains("học kỳ") || rowText.contains("hoc ky") || rowText.contains("semester")) {

                if (rowText.contains("1")) currentSemester = Semester.SEMESTER_1;
                else if (rowText.contains("2")) currentSemester = Semester.SEMESTER_2;
                else if (rowText.contains("3")) currentSemester = Semester.SEMESTER_3;
                else if (rowText.contains("4")) currentSemester = Semester.SEMESTER_4;

                System.out.println("➡ Detect học kỳ: " + currentSemester);
                continue;
            }

            // ===================== DÒ HEADER ===============================
            if (!headerDetected) {

                for (Cell cell : row) {
                    String header = ExcelUtils.getString(row, cell.getColumnIndex());
                    if (header == null) continue;

                    String h = header.trim().toLowerCase();
                    int idx = cell.getColumnIndex();

                    // ===== ƯU TIÊN: "tên môn" =====
                    if ((h.contains("tên môn") || h.contains("ten mon")
                            || (h.contains("subject") && !h.contains("skill")))
                            && !col.containsKey("name")) {
                        col.put("name", idx);
                    }

                    // ===== Skill Name =====
                    if (h.contains("skill name")) {
                        col.put("description", idx);
                        if (!col.containsKey("name")) {
                            col.put("name", idx); // all skill
                        }
                    }

                    // Skill No
                    if (h.contains("skill no") || h.contains("mã") || h.equals("skill") || h.contains("code")) {
                        col.put("code", idx);
                    }

                    // Hours
                    if (h.contains("giờ") || h.contains("gio") || h.contains("hours")) {
                        col.put("hours", idx);
                    }

                    // Description
                    if ((h.contains("ghi chú") || h.contains("ghi chu") || h.contains("note")
                            || (h.contains("description") && !h.contains("skill")))
                            && !col.containsKey("description")) {
                        col.put("description", idx);
                    }
                }

                if (col.containsKey("name") && col.containsKey("code")) {
                    headerDetected = true;
                    System.out.println("✅ HEADER FOUND: " + col);
                }

                continue;
            }

            // ===================== DATA ROW ===============================

            Integer nameIdx = col.get("name");
            Integer descIdx = col.get("description");

            String name = nameIdx != null ? ExcelUtils.getString(row, nameIdx) : null;
            String desc = descIdx != null ? ExcelUtils.getString(row, descIdx) : null;

            // --- ƯU TIÊN TÊN MÔN, nếu trống → dùng Skill Name ---
            if ((name == null || name.isBlank()) && desc != null && !desc.isBlank()) {
                name = desc;
            }

            if (name == null || name.isBlank()) continue;

            String code = ExcelUtils.getString(row, col.get("code"));

            // ------------------ DETECT NEW ------------------
            boolean isNew = false;
            String sheetName = sheet.getSheetName().trim().toLowerCase();

            if (sheetName.contains("all skill portal") && rowText.contains("new")) {
                isNew = true;
            }

            // ------------------ CHECK TRÙNG ------------------
            Optional<Subject> oldOpt =
                    subjectRepo.findBySubjectNameIgnoreCaseAndSystem(name.trim(), system);

            if (oldOpt.isPresent()) {

                Subject old = oldOpt.get();

                if (isNew && (old.getIsNewSubject() == null || !old.getIsNewSubject())) {
                    old.setIsNewSubject(true);
                }

                if (desc != null && !desc.isBlank()) {
                    old.setDescription(desc);
                }

                if ((old.getSubjectName() == null || old.getSubjectName().isBlank())
                        && desc != null && !desc.isBlank()) {
                    old.setSubjectName(desc);
                }

                subjectRepo.save(old);
                System.out.println("🔁 Cập nhật môn cũ: " + old.getSubjectName());
                continue;
            }

            // ------------------ TẠO MÔN MỚI ------------------
            Subject s = new Subject();
            s.setSubjectName(name.trim());
            if (code == null || code.isBlank()) {
                System.out.println("⚠ Không có mã skill cho môn: " + name + " → lưu tạm với mã trống");
                s.setSubjectCode(null);
            } else {
                s.setSubjectCode(code.trim());
            }
            s.setDescription(desc);
            s.setHours(col.containsKey("hours") ? ExcelUtils.getInt(row, col.get("hours")) : null);
            s.setSemester(currentSemester);
            s.setSystem(system);
            s.setIsActive(true);
            s.setIsNewSubject(isNew);

            subjectRepo.save(s);
            count++;

            System.out.println("   ➕ Imported: " + name
                    + " | HK: " + currentSemester
                    + (isNew ? " | NEW" : ""));
        }

        return count;
    }

    private int importTemplateSheet(Sheet sheet, SubjectSystem system) {
        Semester currentSemester = null;
        int count = 0;

        for (Row row : sheet) {
            String rowText = buildRowText(row);

            Semester detected = detectSemester(rowText);
            if (detected != null) {
                currentSemester = detected;
                continue;
            }

            if (isHeaderRow(rowText)) {
                if (currentSemester == null) {
                    currentSemester = Semester.SEMESTER_1;
                }
                continue;
            }

            String name = ExcelUtils.getString(row, 1);
            String code = ExcelUtils.getString(row, 2);
            String note = ExcelUtils.getString(row, 3);
            String isNew = ExcelUtils.getString(row, 4);
            String multiplierStr = ExcelUtils.getString(row, 5);

            if ((name == null || name.isBlank()) && (code == null || code.isBlank())) {
                continue; // empty row
            }

            if (name == null || name.isBlank()) name = note;
            if (name == null || name.isBlank()) continue;
            if (currentSemester == null) {
                currentSemester = Semester.SEMESTER_1;
            }

            Subject subject = new Subject();

            subject.setSystem(system);
            subject.setSubjectName(name.trim());
            if (code == null || code.isBlank()) {
                subject.setSubjectCode(null);
            } else {
                subject.setSubjectCode(code.trim());
            }
            subject.setDescription(note);
            subject.setSemester(currentSemester);
            subject.setIsActive(true);
            subject.setIsNewSubject(isTrue(isNew));
            subject.setHours(parseMultiplier(multiplierStr));

            subjectRepo.save(subject);
            count++;
        }

        return count;
    }

    private Semester detectSemester(String text) {
        if (text == null || text.isBlank()) return null;
        String normalized = normalize(text);

        if (containsKeyword(normalized, "1")) {
            return Semester.SEMESTER_1;
        }
        if (containsKeyword(normalized, "2")) {
            return Semester.SEMESTER_2;
        }
        if (containsKeyword(normalized, "3")) {
            return Semester.SEMESTER_3;
        }
        if (containsKeyword(normalized, "4")) {
            return Semester.SEMESTER_4;
        }
        return null;
    }

    private boolean isHeaderRow(String normalizedRowText) {
        if (normalizedRowText == null) return false;
        return (normalizedRowText.contains("ten mon") && normalizedRowText.contains("skill"))
                || normalizedRowText.contains("stt");
    }

    private boolean containsKeyword(String normalized, String number) {
        return normalized.contains("hoc ky " + number)
                || normalized.contains("hoc ky" + number)
                || normalized.contains("hk" + number)
                || normalized.contains("semester " + number)
                || normalized.contains("semester" + number);
    }

    private String buildRowText(Row row) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < row.getLastCellNum(); i++) {
            String v = ExcelUtils.getString(row, i);
            if (v != null) {
                sb.append(normalize(v)).append(" ");
            }
        }
        return sb.toString().trim();
    }

    private String normalize(String input) {
        if (input == null) return null;
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD)
                .replaceAll("\\p{InCombiningDiacriticalMarks}+", "");
        return normalized.toLowerCase().trim();
    }

    private boolean isTrue(String value) {
        if (value == null) return false;
        String normalized = value.trim().toLowerCase();
        return normalized.equals("true")
                || normalized.equals("1")
                || normalized.equals("yes")
                || normalized.equals("x")
                || normalized.equals("new");
    }

    private Integer parseMultiplier(String value) {
        try {
            if (value == null || value.isBlank()) return null;
            return Integer.parseInt(value.trim());
        } catch (NumberFormatException ex) {
            return null;
        }
    }

//    private String generateCodeFromName(String name) {
//        String base = normalize(name)
//                .replaceAll("[^a-z0-9]", "")
//                .toUpperCase();
//        if (base.isBlank()) base = "AUTO";
//        if (base.length() > MAX_CODE_LENGTH - 5) {
//            base = base.substring(0, MAX_CODE_LENGTH - 5);
//        }
//
//        String suffix = Long.toString(System.currentTimeMillis(), 36).toUpperCase();
//        if (suffix.length() > 4) {
//            suffix = suffix.substring(suffix.length() - 4);
//        }
//
//        return safeCode(base + suffix);
//    }
//
//    private String safeCode(String code) {
//        if (code == null || code.isBlank()) {
//            return generateCodeFromName("AUTO");
//        }
//
//        String normalized = code.toUpperCase().replaceAll("[^A-Z0-9-]", "-");
//        normalized = normalized.replaceAll("-{2,}", "-").replaceAll("^-|-$", "");
//        if (normalized.length() > MAX_CODE_LENGTH) {
//            normalized = normalized.substring(0, MAX_CODE_LENGTH);
//        }
//        if (normalized.isBlank()) {
//            return generateCodeFromName("AUTO");
//        }
//        return normalized;
//    }
}
