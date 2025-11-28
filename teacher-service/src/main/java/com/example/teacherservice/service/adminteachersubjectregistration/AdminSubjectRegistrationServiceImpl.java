package com.example.teacherservice.service.adminteachersubjectregistration;

import com.example.teacherservice.dto.adminteachersubjectregistration.AdminSubjectRegistrationDto;
import com.example.teacherservice.dto.adminteachersubjectregistration.ImportResultDto;
import com.example.teacherservice.dto.adminteachersubjectregistration.ImportRowError;
import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.SubjectRegistrationRepository;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.service.notification.NotificationService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellAddress;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.text.Normalizer;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminSubjectRegistrationServiceImpl implements AdminSubjectRegistrationService {

    private final SubjectRegistrationRepository subjectRegistrationRepository;
    private final NotificationService notificationService;
    private final UserRepository userRepository;
    private final SubjectRepository subjectRepository;
    private final static String DASH_REGEX = "[-‐-‒–—−]+";

    // ========================================================
    // BASIC CRUD
    // ========================================================

    @Override
    public List<AdminSubjectRegistrationDto> getAll() {
        return subjectRegistrationRepository.findAll()
                .stream()
                .map(this::toDto)
                .toList();
    }

    @Override
    public AdminSubjectRegistrationDto updateStatus(String id, RegistrationStatus status) {
        SubjectRegistration reg = subjectRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        reg.setStatus(status);
        SubjectRegistration saved = subjectRegistrationRepository.save(reg);

        notifyTeacherStatusUpdate(saved);
        return toDto(saved);
    }

    @Override
    public AdminSubjectRegistrationDto getById(String id) {
        SubjectRegistration reg = subjectRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));
        return toDto(reg);
    }

    // ========================================================
    // EXPORT EXCEL (ADMIN)
    // ========================================================
    @Override
    public void exportExcel(HttpServletResponse response, String statusParam, String teacherParam) {
        try {
            // ===== 1. Load template =====
            InputStream templateStream =
                    getClass().getResourceAsStream("/templates/ke_hoach_chuyen_mon_template.xlsx");

            if (templateStream == null) {
                throw new RuntimeException("Không tìm thấy template Excel!");
            }

            Workbook wb = new XSSFWorkbook(templateStream);
            Sheet sheet = wb.getSheetAt(0);

            // ===== STYLE =====
            CellStyle borderCenter = wb.createCellStyle();
            borderCenter.setBorderBottom(BorderStyle.THIN);
            borderCenter.setBorderTop(BorderStyle.THIN);
            borderCenter.setBorderLeft(BorderStyle.THIN);
            borderCenter.setBorderRight(BorderStyle.THIN);
            borderCenter.setAlignment(HorizontalAlignment.CENTER);
            borderCenter.setVerticalAlignment(VerticalAlignment.CENTER);

            CellStyle borderLeft = wb.createCellStyle();
            borderLeft.cloneStyleFrom(borderCenter);
            borderLeft.setAlignment(HorizontalAlignment.LEFT);

            // ===== TÌM CỘT NOTE + MÃ MÔN THI =====
            Row headerRow = sheet.getRow(7);
            if (headerRow == null) throw new RuntimeException("Template sai header row!");

            int noteCol = -1;
            int codeCol = -1;

            for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                String raw = normalize(headerRow.getCell(c).toString());
                if (raw.contains("ghi chu")) noteCol = c;
                if (raw.contains("ma mon thi")) codeCol = c;
            }

            if (noteCol == -1 || codeCol == -1)
                throw new RuntimeException("Thiếu cột GHI CHÚ hoặc MÃ MÔN THI trong template!");

            // ===== 2. LẤY DỮ LIỆU =====
            List<SubjectRegistration> list = subjectRegistrationRepository.findAll();

            if (statusParam != null && !statusParam.equalsIgnoreCase("ALL")) {
                try {
                    RegistrationStatus st = RegistrationStatus.valueOf(statusParam.toUpperCase());
                    list = list.stream()
                            .filter(r -> r.getStatus() == st)
                            .collect(Collectors.toList());
                } catch (Exception ignored) {}
            }

            if (teacherParam != null && !teacherParam.isBlank()) {
                list = list.stream()
                        .filter(r -> r.getTeacher().getUsername().equalsIgnoreCase(teacherParam)
                                || r.getTeacher().getTeacherCode().equalsIgnoreCase(teacherParam))
                        .collect(Collectors.toList());
            }

            if (list.isEmpty())
                throw new RuntimeException("Không có dữ liệu để export!");

            // ===== 3. GROUP THEO GIÁO VIÊN =====
            Map<String, List<SubjectRegistration>> byTeacher =
                    list.stream().collect(Collectors.groupingBy(r -> r.getTeacher().getUsername()));

            int dataStartRow = 8;
            int rowIndex = dataStartRow;
            int stt = 1;

            clearDataMergedRegions(sheet, dataStartRow);

            // ===== 4. GHI DỮ LIỆU =====
            for (Map.Entry<String, List<SubjectRegistration>> entry : byTeacher.entrySet()) {

                String teacherName = entry.getKey();
                List<SubjectRegistration> gvList = entry.getValue();
                int startRow = rowIndex;

                for (SubjectRegistration reg : gvList) {

                    Row row = sheet.getRow(rowIndex);
                    if (row == null) row = sheet.createRow(rowIndex);

                    // STT
                    getOrCreate(row, 0).setCellValue(stt);
                    getOrCreate(row, 0).setCellStyle(borderCenter);

                    // Họ tên
                    getOrCreate(row, 1).setCellValue(teacherName);
                    getOrCreate(row, 1).setCellStyle(borderLeft);

                    // Môn
                    getOrCreate(row, 2).setCellValue(reg.getSubject().getSubjectName());
                    getOrCreate(row, 2).setCellStyle(borderLeft);

                    // Chương trình
                    getOrCreate(row, 3).setCellValue(reg.getSubject().getSystem().getSystemCode());
                    getOrCreate(row, 3).setCellStyle(borderCenter);

                    // Học kỳ
                    getOrCreate(row, 4).setCellValue(reg.getSubject().getSemester().name());
                    getOrCreate(row, 4).setCellStyle(borderCenter);

                    // Hình thức chuẩn bị
                    getOrCreate(row, 5).setCellValue(
                            reg.getReasonForCarryOver() == null ? "" : reg.getReasonForCarryOver()
                    );
                    getOrCreate(row, 5).setCellStyle(borderLeft);

                    // Deadline
                    getOrCreate(row, 6).setCellValue(formatDeadline(reg));
                    getOrCreate(row, 6).setCellStyle(borderCenter);

                    // GHI CHÚ (template)
                    getOrCreate(row, noteCol).setCellValue("");
                    getOrCreate(row, noteCol).setCellStyle(borderLeft);

                    // Mã môn thi
                    getOrCreate(row, codeCol).setCellValue(reg.getSubject().getSkillCode());
                    getOrCreate(row, codeCol).setCellStyle(borderCenter);

                    rowIndex++;
                }

                if (gvList.size() > 1) {
                    sheet.addMergedRegion(new CellRangeAddress(startRow, rowIndex - 1, 0, 0));
                    sheet.addMergedRegion(new CellRangeAddress(startRow, rowIndex - 1, 1, 1));
                }

                stt++;
            }

            // ===== 5. GHI FOOTER LUÔN LUÔN Ở DƯỚI ====
            int footerRow = rowIndex + 3;

            Row leftDateRow = sheet.getRow(footerRow);
            if (leftDateRow == null) leftDateRow = sheet.createRow(footerRow);

            Cell leftDate = leftDateRow.createCell(1);
            leftDate.setCellValue("Ngày      /      /  " + java.time.LocalDate.now().getYear());

            Row leftSignerRow = sheet.getRow(footerRow + 1);
            if (leftSignerRow == null) leftSignerRow = sheet.createRow(footerRow + 1);

            leftSignerRow.createCell(1).setCellValue("NGƯỜI LẬP");

            Row rightDateRow = sheet.getRow(footerRow);
            Cell rightDate = rightDateRow.createCell(8);
            rightDate.setCellValue("Ngày      /      /  " + java.time.LocalDate.now().getYear());

            Row rightSignerRow = sheet.getRow(footerRow + 1);
            if (rightSignerRow == null) rightSignerRow = sheet.createRow(footerRow + 1);

            rightSignerRow.createCell(8).setCellValue("BỘ PHẬN ĐÀO TẠO");

            // ===== 6. FORCE EXCEL FOCUS TO FOOTER =====
            // ===== 6. FORCE EXCEL FOCUS TO FOOTER =====
            CellAddress footerAddress = new CellAddress(footerRow + 5, 0);
            sheet.setActiveCell(footerAddress);
            sheet.showInPane(footerRow, 0);


            // ===== 7. TRẢ FILE =====
            response.setContentType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=ke_hoach_chuyen_mon.xlsx");

            wb.write(response.getOutputStream());
            wb.close();

        } catch (Exception e) {
            throw new RuntimeException("Export lỗi: " + e.getMessage());
        }
    }




    private Cell getOrCreate(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) cell = row.createCell(col);
        return cell;
    }





    private void clearDataMergedRegions(Sheet sheet, int dataStartRow) {
        // duyệt ngược để không bị lệch index khi remove
        for (int i = sheet.getNumMergedRegions() - 1; i >= 0; i--) {
            CellRangeAddress region = sheet.getMergedRegion(i);

            // nếu vùng merge có đụng vào từ dòng dataStartRow trở xuống
            // và nằm trong 2 cột STT (0) hoặc HỌ TÊN (1) thì xóa
            if (region.getLastRow() >= dataStartRow &&
                    region.getFirstColumn() <= 1 &&
                    region.getLastColumn() >= 0) {

                sheet.removeMergedRegion(i);
            }
        }
    }





    private String formatDeadline(SubjectRegistration r) {
        return switch (r.getQuarter()) {
            case QUY1 -> "03-" + r.getYear();
            case QUY2 -> "06-" + r.getYear();
            case QUY3 -> "09-" + r.getYear();
            case QUY4 -> "12-" + r.getYear();
        };
    }



    // ============================================================
    // IMPORT EXCEL — ĐỌC FILE KẾ HOẠCH CHUYÊN MÔN (BẢNG GIỐNG HÌNH)
    // ============================================================

    // ========================== IMPORT EXCEL HOÀN CHỈNH ==============================

    @Override
    public ImportResultDto importExcel(MultipartFile file) {
        ImportResultDto result = new ImportResultDto();

        try (InputStream input = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(input)) {

            Sheet sheet = workbook.getSheetAt(0);

            // ==== Tìm header chứa "HỌ TÊN" ====
            Row header = findHeaderRow(sheet);
            if (header == null) {
                addRowError(result, 1, "Không tìm thấy dòng tiêu đề (HỌ TÊN)");
                return finishResult(result);
            }

            int headerIndex = header.getRowNum();
            Map<String, Integer> col = detectTrainingPlanColumns(header);

            // ==== Kiểm tra cột bắt buộc ====
            if (!col.containsKey("teacherName"))
                addRowError(result, headerIndex + 1, "Thiếu cột HỌ TÊN");
            if (!col.containsKey("subjectCode"))
                addRowError(result, headerIndex + 1, "Thiếu cột MÃ MÔN THI");
            if (!col.containsKey("deadline"))
                addRowError(result, headerIndex + 1, "Thiếu cột HẠN HOÀN THÀNH");

            if (!result.getErrors().isEmpty()) return finishResult(result);

            String lastTeacherName = null;

            // ==== Duyệt từng dòng ====
            for (int i = headerIndex + 1; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) continue;
                int excelRow = i + 1;
                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    // === Lấy ô dữ liệu ===
                    String teacherName = getString(row, col.get("teacherName"));
                    String subjectText = getString(row, col.get("subjectCode"));
                    String method = getString(row, col.get("method"));
                    String note = getString(row, col.get("note"));
                    String deadline = getString(row, col.get("deadline"));

                    // === Merge tên GV ===
                    if (isBlank(teacherName)) {
                        teacherName = lastTeacherName;
                    } else {
                        lastTeacherName = teacherName;
                    }

                    if (isBlank(teacherName)) {
                        addRowError(result, excelRow, "Thiếu HỌ TÊN");
                        continue;
                    }


                    String fullSubjectCode = subjectText.trim();

                    // === Tìm GV ===
                    User teacher = userRepository.findByUsername(teacherName).orElse(null);
                    if (teacher == null) {
                        addRowError(result, excelRow,
                                "Không tìm thấy giáo viên (username): " + teacherName);
                        continue;
                    }

                    // === Tìm môn theo FULL code ===
                    Subject subject = subjectRepository.findBySkill_SkillCode(fullSubjectCode).orElse(null);
                    if (subject == null) {
                        addRowError(result, excelRow,
                                "Không tìm thấy môn trong DB: " + fullSubjectCode);
                        continue;
                    }
                    String normalizedDeadline = normalizeDeadline(deadline);

                    if (normalizedDeadline == null) {
                        addRowError(result, excelRow, "Hạn hoàn thành không hợp lệ: " + deadline);
                        continue;
                    }
                    // === Parse deadline → year + quarter ===
                    Integer year = Integer.parseInt(normalizedDeadline.split("-")[1]);
                    Quarter quarter = convertToQuarter(normalizedDeadline);

                    if (year == null || quarter == null) {
                        addRowError(result, excelRow,
                                "Hạn hoàn thành không hợp lệ: " + deadline);
                        continue;
                    }

                    // === Check trùng ===
                    boolean exists = subjectRegistrationRepository
                            .existsByTeacher_IdAndSubject_IdAndYearAndQuarter(
                                    teacher.getId(), subject.getId(), year, quarter);

                    if (exists) {
                        result.setSkippedCount(result.getSkippedCount() + 1);
                        addRowError(result, excelRow, "Đăng ký đã tồn tại → bỏ qua");
                        continue;
                    }

                    // === Ghi note ===
                    StringBuilder combinedNote = new StringBuilder();
                    if (!isBlank(method)) combinedNote.append(method).append("\n");
                    if (!isBlank(note)) combinedNote.append(note).append("\n");
                    combinedNote.append("Hạn hoàn thành: ").append(deadline);

                    // === SAVE ===
                    SubjectRegistration reg = new SubjectRegistration();
                    reg.setTeacher(teacher);
                    reg.setSubject(subject);
                    reg.setYear(year);
                    reg.setQuarter(quarter);
                    reg.setStatus(RegistrationStatus.REGISTERED);
                    reg.setReasonForCarryOver(combinedNote.toString().trim());

                    subjectRegistrationRepository.save(reg);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex) {
                    addRowError(result, excelRow, "Lỗi xử lý dòng: " + ex.getMessage());
                }
            }

        } catch (Exception e) {
            addRowError(result, 0, "Không thể đọc file Excel: " + e.getMessage());
        }

        return finishResult(result);
    }


    // ========================================================
    // HELPER: COLUMN DETECTION / PARSE
    // ========================================================

    private Map<String, Integer> detectTrainingPlanColumns(Row header) {
        Map<String, Integer> map = new HashMap<>();

        for (int c = 0; c < header.getLastCellNum(); c++) {
            String raw = normalize(header.getCell(c).toString());

            if (raw.contains("ho ten")) map.put("teacherName", c);
            if (raw.contains("ma mon thi")) map.put("subjectCode", c);
            if (raw.contains("hinh thuc")) map.put("method", c);
            if (raw.contains("ghi chu")) map.put("note", c);
            if (raw.contains("han hoan thanh")) map.put("deadline", c);
        }

        return map;
    }


    private Row findHeaderRow(Sheet sheet) {
        for (int i = 0; i <= sheet.getLastRowNum(); i++) {
            Row row = sheet.getRow(i);
            if (row == null) continue;

            for (int c = 0; c < row.getLastCellNum(); c++) {
                String raw = normalize(row.getCell(c).toString());
                if (raw.contains("ho ten")) return row;
            }
        }
        return null;
    }

    private String getString(Row row, Integer idx) {
        if (idx == null) return null;
        Cell c = row.getCell(idx);
        if (c == null) return null;
        return c.toString().trim();
    }
    private boolean isBlank(String s) {
        return s == null || s.trim().isEmpty();
    }


    private String normalize(String s) {
        return Normalizer.normalize(s, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }

    private String normalizeDeadline(String raw) {
        if (raw == null) return null;

        raw = raw.trim();

        // ====== 1. Kiểu Excel Date (số) ======
        try {
            // Nếu ô là số → Excel date
            double numeric = Double.parseDouble(raw);
            Date date = DateUtil.getJavaDate(numeric);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);

            int month = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);

            return String.format("%02d-%04d", month, year);
        } catch (Exception ignored) {}

        // ====== 2. Kiểu dd-MMM-yyyy (02-Jun-2025) ======
        try {
            java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("dd-MMM-yyyy", Locale.ENGLISH);
            Date date = f.parse(raw);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);

            int month = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);

            return String.format("%02d-%04d", month, year);
        } catch (Exception ignored) {}

        // ====== 3. Kiểu dd/MM/yyyy ======
        try {
            java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("dd/MM/yyyy");
            Date date = f.parse(raw);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);

            int month = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);

            return String.format("%02d-%04d", month, year);
        } catch (Exception ignored) {}

        // ====== 4. Kiểu MM-YYYY ======
        if (raw.matches("\\d{2}-\\d{4}")) {
            return raw;
        }

        // ====== 5. Kiểu YYYY-MM ======
        if (raw.matches("\\d{4}-\\d{2}")) {
            String[] a = raw.split("-");
            return a[1] + "-" + a[0];
        }

        return null;
    }


    private Quarter convertToQuarter(String normalized) {
        if (normalized == null) return null;

        String month = normalized.split("-")[0];
        return switch (month) {
            case "01","02","03" -> Quarter.QUY1;
            case "04","05","06" -> Quarter.QUY2;
            case "07","08","09" -> Quarter.QUY3;
            case "10","11","12" -> Quarter.QUY4;
            default -> null;
        };
    }



    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell cell = row.getCell(i);
            if (cell != null && cell.toString().trim().length() > 0)
                return false;
        }
        return true;
    }



    private void addRowError(ImportResultDto result, int row, String msg) {
        result.getErrors().add(new ImportRowError(row, msg));
    }

    private ImportResultDto finishResult(ImportResultDto result) {
        result.setErrorCount(result.getErrors().size());
        return result;
    }

    // ========================================================
    // DTO MAPPING + NOTIFICATION
    // ========================================================

    private AdminSubjectRegistrationDto toDto(SubjectRegistration reg) {
        AdminSubjectRegistrationDto dto = new AdminSubjectRegistrationDto();

        dto.setId(reg.getId());
        dto.setTeacherCode(reg.getTeacher().getTeacherCode());
        dto.setTeacherName(reg.getTeacher().getUsername());
        dto.setSubjectId(reg.getSubject().getId());
        dto.setSubjectName(reg.getSubject().getSubjectName());
        dto.setSubjectCode(reg.getSubject().getSkillCode());
        dto.setSystemName(
                reg.getSubject().getSystem() != null
                        ? reg.getSubject().getSystem().getSystemName()
                        : "N/A"
        );
        dto.setSemester(reg.getSubject().getSemester().name());
        dto.setYear(reg.getYear());
        dto.setQuarter(reg.getQuarter());
        dto.setRegistrationDate(
                reg.getCreationTimestamp() != null
                        ? reg.getCreationTimestamp().toString()
                        : null
        );
        dto.setStatus(reg.getStatus().name().toLowerCase());
        dto.setNotes(reg.getReasonForCarryOver());

        return dto;
    }

    private void notifyTeacherStatusUpdate(SubjectRegistration registration) {
        try {
            notificationService.createAndSend(
                    registration.getTeacher().getId(),
                    "Cập nhật đăng ký",
                    "Đăng ký môn " + registration.getSubject().getSubjectName()
                            + " đã được cập nhật.",
                    NotificationType.SUBJECT_NOTIFICATION,
                    "SubjectRegistration",
                    registration.getId()
            );
        } catch (Exception ignored) {
        }
    }
}
