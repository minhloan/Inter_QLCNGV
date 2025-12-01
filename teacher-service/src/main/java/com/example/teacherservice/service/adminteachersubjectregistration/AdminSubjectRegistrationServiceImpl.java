package com.example.teacherservice.service.adminteachersubjectregistration;

import com.example.teacherservice.dto.adminteachersubjectregistration.AdminSubjectRegistrationDto;
import com.example.teacherservice.dto.adminteachersubjectregistration.ImportResultDto;
import com.example.teacherservice.dto.adminteachersubjectregistration.ImportRowError;
import com.example.teacherservice.dto.teachersubjectregistration.ImportPlanResultDto;
import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.enums.Semester;
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
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.InputStream;
import java.text.Normalizer;
import java.text.SimpleDateFormat;
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
// ===== 1B. SET COLUMN WIDTH =====
            sheet.setColumnWidth(1, 5000);   // HỌ TÊN
            sheet.setColumnWidth(2, 8000);   // MÔN CHUẨN BỊ
            sheet.setColumnWidth(3, 4500);   // CHƯƠNG TRÌNH
            sheet.setColumnWidth(4, 4000);   // HỌC KỲ
            sheet.setColumnWidth(5, 6000);   // HÌNH THỨC CHUẨN BỊ
            sheet.setColumnWidth(6, 4000);   // HẠN HOÀN THÀNH

            if (noteCol != -1)
                sheet.setColumnWidth(noteCol, 8000); // GHI CHÚ

            if (codeCol != -1)
                sheet.setColumnWidth(codeCol, 6000); // MÃ MÔN THI

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
                    Cell c0 = getOrCreate(row, 0);
                    c0.setCellValue(stt);
                    c0.setCellStyle(borderCenter);
                    applyWrap(c0);

// Họ tên
                    Cell c1 = getOrCreate(row, 1);
                    c1.setCellValue(teacherName);
                    c1.setCellStyle(borderLeft);
                    applyWrap(c1);

// Môn
                    Cell c2 = getOrCreate(row, 2);
                    c2.setCellValue(reg.getSubject().getSubjectName());
                    c2.setCellStyle(borderLeft);
                    applyWrap(c2);

// Chương trình
                    Cell c3 = getOrCreate(row, 3);
                    c3.setCellValue(reg.getSubject().getSystem().getSystemCode());
                    c3.setCellStyle(borderCenter);
                    applyWrap(c3);

// Học kỳ
                    Cell c4 = getOrCreate(row, 4);
                    c4.setCellValue(reg.getSubject().getSemester().name());
                    c4.setCellStyle(borderCenter);
                    applyWrap(c4);

// Hình thức chuẩn bị
                    Cell c5 = getOrCreate(row, 5);
                    c5.setCellValue(reg.getReasonForCarryOver() == null ? "" : reg.getReasonForCarryOver());
                    c5.setCellStyle(borderLeft);
                    applyWrap(c5);

// Deadline
                    Cell c6 = getOrCreate(row, 6);
                    c6.setCellValue(formatDeadline(reg));
                    c6.setCellStyle(borderCenter);
                    applyWrap(c6);

// Ghi chú
                    Cell cNote = getOrCreate(row, noteCol);
                    // GHI CHÚ (template)
                    String teacherNotes = reg.getTeacherNotes() == null ? "" : reg.getTeacherNotes();
                    getOrCreate(row, noteCol).setCellValue(teacherNotes);
                    getOrCreate(row, noteCol).setCellStyle(borderLeft);
                    applyWrap(cNote);

// Mã môn thi
                    Cell cCode = getOrCreate(row, codeCol);
                    cCode.setCellValue(reg.getSubject().getSkillCode());
                    cCode.setCellStyle(borderCenter);
                    applyWrap(cCode);

// 🚀 TỰ GIÃN DÒNG
                    autoFitRow(row);

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
                    String method      = getString(row, col.get("method"));       // HÌNH THỨC CHUẨN BỊ
                    String deadline    = getString(row, col.get("deadline"));
                    String teacherNote = getString(row, col.get("teacherNote"));  // GHI CHÚ (Excel)

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

                    String fullSubjectCode = subjectText.contains("-")
                            ? subjectText.split("-")[0].trim()
                            : subjectText.trim();

                    // === Tìm GV theo username HOẶC tên đầy đủ ===
                    User teacher = findTeacherByNameOrUsername(teacherName);
                    if (teacher == null) {
                        addRowError(result, excelRow,
                                "Không tìm thấy giáo viên: " + teacherName + " (đã thử tìm theo username và họ tên)");
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

                    // === SAVE ===
                    SubjectRegistration reg = new SubjectRegistration();
                    reg.setTeacher(teacher);
                    reg.setSubject(subject);
                    reg.setYear(year);
                    reg.setQuarter(quarter);
                    reg.setStatus(RegistrationStatus.REGISTERED);

                    // 🔥 CHỈ LƯU method + teacherNote
                    reg.setReasonForCarryOver(
                            (method == null || method.isBlank()) ? null : method.trim()
                    );
                    reg.setReasonForCarryOver2(null); // không dùng trong import này

                    reg.setTeacherNotes(
                            (teacherNote == null || teacherNote.isBlank()) ? null : teacherNote.trim()
                    );

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
    // ========================================================
// HELPER: COLUMN DETECTION / PARSE
// ========================================================
    // ========================================================
// HELPER: COLUMN DETECTION / PARSE  (CHO importExcel)
// ========================================================
    private Map<String, Integer> detectTrainingPlanColumns(Row header) {
        Map<String, Integer> map = new HashMap<>();

        for (int c = 0; c < header.getLastCellNum(); c++) {
            Cell cell = header.getCell(c);
            if (cell == null) continue;

            String raw = normalize(cell.toString());

            if (raw.contains("ho ten"))        map.put("teacherName", c);
            if (raw.contains("ma mon thi"))    map.put("subjectCode", c);
            if (raw.contains("hinh thuc"))     map.put("method", c);

            // 🔥 TẤT CẢ cột "GHI CHÚ" → teacherNote
            if (raw.contains("ghi chu"))       map.put("teacherNote", c);

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

        // ====== CASE 1: Ô dạng số (Excel date) ======
        try {
            double numeric = Double.parseDouble(raw);
            Date date = DateUtil.getJavaDate(numeric);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);

            int month = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);

            return String.format("%02d-%04d", month, year);
        } catch (Exception ignored) {}

        // ====== CASE 2: dd/MM/yyyy ======
        try {
            SimpleDateFormat f = new SimpleDateFormat("dd/MM/yyyy");
            Date date = f.parse(raw);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            return String.format("%02d-%04d", cal.get(Calendar.MONTH) + 1, cal.get(Calendar.YEAR));
        } catch (Exception ignored) {}

        // ====== CASE 3: MM/yyyy ======
        if (raw.matches("\\d{1,2}/\\d{4}")) {
            String[] p = raw.split("/");
            return String.format("%02d-%s", Integer.parseInt(p[0]), p[1]);
        }

        // ====== CASE 4: dd-MMM-yyyy ======
        try {
            SimpleDateFormat f = new SimpleDateFormat("dd-MMM-yyyy", Locale.ENGLISH);
            Date date = f.parse(raw);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            return String.format("%02d-%04d", cal.get(Calendar.MONTH) + 1, cal.get(Calendar.YEAR));
        } catch (Exception ignored) {}

        // ====== CASE 5: MMM-yyyy ======
        try {
            SimpleDateFormat f = new SimpleDateFormat("MMM-yyyy", Locale.ENGLISH);
            Date date = f.parse(raw);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            return String.format("%02d-%04d", cal.get(Calendar.MONTH) + 1, cal.get(Calendar.YEAR));
        } catch (Exception ignored) {}

        // ====== CASE 6: MM-YYYY ======
        if (raw.matches("\\d{2}-\\d{4}")) return raw;

        // ====== CASE 7: YYYY-MM ======
        if (raw.matches("\\d{4}-\\d{2}")) {
            String[] p = raw.split("-");
            return p[1] + "-" + p[0];
        }

        return null;
    }



    private Quarter convertToQuarter(String normalized) {
        if (normalized == null) return null;

        String month = normalized.split("-")[0].trim();
        // chuẩn hóa: "3" → "03"
        if (month.length() == 1) {
            month = "0" + month;
        }

        return switch (month) {
            case "01", "02", "03" -> Quarter.QUY1;
            case "04", "05", "06" -> Quarter.QUY2;
            case "07", "08", "09" -> Quarter.QUY3;
            case "10", "11", "12" -> Quarter.QUY4;
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
        dto.setTeacherId(reg.getTeacher().getId());
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

        // 🔥 Thêm 3 dòng này để FE lấy đúng dữ liệu
        dto.setReasonForCarryOver(reg.getReasonForCarryOver());   // Hình thức chuẩn bị
        dto.setReasonForCarryOver2(reg.getReasonForCarryOver2()); // Lý do dời môn
        dto.setTeacherNotes(reg.getTeacherNotes());               // Ghi chú GV

        dto.setNotes(reg.getTeacherNotes()); // ghi chú tổng hợp

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

    /**
     * Tìm giáo viên
     * 1. Username (nguyen_van)
     * 2. Teacher Code (GV001)
     * 3. Họ tên đầy đủ (Nguyễn Văn A) - with normalization
     *
     */
    private User findTeacherByNameOrUsername(String nameOrUsername) {
        if (nameOrUsername == null || nameOrUsername.trim().isEmpty()) {
            return null;
        }

        String searchStr = nameOrUsername.trim();

        // Stage 1: Try simple DB query (username or teacher code)
        Optional<User> directMatch = userRepository.findByUsernameOrTeacherCode(searchStr);
        if (directMatch.isPresent()) {
            return directMatch.get();
        }

        // Stage 2: Try normalized full name search
        String normalizedSearch = normalize(searchStr);

        List<User> allUsers = userRepository.findAll();
        for (User user : allUsers) {
            // Check normalized username
            if (normalize(user.getUsername()).equals(normalizedSearch)) {
                return user;
            }

            // Check normalized full name patterns
            if (user.getUserDetails() != null) {
                String firstName = user.getUserDetails().getFirstName();
                String lastName = user.getUserDetails().getLastName();

                if (firstName != null && lastName != null) {
                    // Try "Họ Tên" pattern (Vietnamese style)
                    String fullName = (lastName + " " + firstName).trim();
                    if (normalize(fullName).equals(normalizedSearch)) {
                        return user;
                    }

                    // Try "Tên Họ" pattern
                    String reversedName = (firstName + " " + lastName).trim();
                    if (normalize(reversedName).equals(normalizedSearch)) {
                        return user;
                    }
                }
            }
        }

        return null;
    }

    // =================== ADMIN - KẾ HOẠCH CHUYÊN MÔN - EXPORT ===================
    @Override
    public void exportPlanExcel(HttpServletResponse response, String adminId, String teacherId, Integer year) {

        ClassPathResource resource = new ClassPathResource("templates/ke_hoach_chuyen_mon_template.xlsx");

        if (!resource.exists()) {
            throw new RuntimeException("Template file not found");
        }

        int targetYear = (year != null) ? year : java.time.Year.now().getValue();

        // Fetch Admin for "Người lập" field
        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        String adminName = admin.getUsername();

        try (InputStream templateStream = resource.getInputStream();
             ByteArrayOutputStream buffer = new ByteArrayOutputStream()) {

            // Read template to buffer
            byte[] bufferArray = new byte[8192];
            int nRead;
            while ((nRead = templateStream.read(bufferArray, 0, bufferArray.length)) != -1) {
                buffer.write(bufferArray, 0, nRead);
            }
            buffer.flush();

            try (ByteArrayInputStream bais = new ByteArrayInputStream(buffer.toByteArray());
                 Workbook wb = new XSSFWorkbook(bais)) {

                // Styles
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

                List<User> teachersToExport = new ArrayList<>();

                if (teacherId != null && !teacherId.isEmpty()) {
                    User teacher = userRepository.findById(teacherId)
                            .orElseThrow(() -> new RuntimeException("Teacher not found"));
                    teachersToExport.add(teacher);
                } else {
                    // Export ALL teachers
                    List<SubjectRegistration> allRegsInYear = subjectRegistrationRepository.findAll().stream()
                            .filter(r -> r.getYear() != null && r.getYear() == targetYear)
                            .toList();

                    Set<String> teacherIds = allRegsInYear.stream()
                            .map(r -> r.getTeacher().getId())
                            .collect(Collectors.toSet());

                    teachersToExport = userRepository.findAllById(teacherIds);
                }

                // 1. Filter teachers and collect data first
                List<Map.Entry<User, List<SubjectRegistration>>> validData = new ArrayList<>();

                teachersToExport.sort(Comparator.comparing(User::getTeacherCode, Comparator.nullsLast(Comparator.naturalOrder())));

                for (User teacher : teachersToExport) {
                    List<SubjectRegistration> regs = subjectRegistrationRepository.findByTeacher_Id(teacher.getId())
                            .stream()
                            .filter(r -> r.getYear() != null && r.getYear() == targetYear)
                            .toList();
                    if (!regs.isEmpty()) {
                        validData.add(new AbstractMap.SimpleEntry<>(teacher, regs));
                    }
                }

                if (validData.isEmpty()) {
                    throw new RuntimeException("Không có dữ liệu giáo viên nào để export cho năm " + targetYear);
                }

                // 2. Prepare sheets (Clone template)
                for (int i = 1; i < validData.size(); i++) {
                    wb.cloneSheet(0);
                }

                // 3. Fill data
                for (int i = 0; i < validData.size(); i++) {
                    User teacher = validData.get(i).getKey();
                    List<SubjectRegistration> regs = validData.get(i).getValue();
                    Sheet sheet = wb.getSheetAt(i);

                    // Set Sheet Name
                    String sheetName = teacher.getTeacherCode();
                    if (sheetName == null || sheetName.isEmpty()) sheetName = teacher.getUsername();
                    if (sheetName.length() > 30) sheetName = sheetName.substring(0, 30);

                    String finalSheetName = sheetName;
                    int suffix = 1;
                    while (wb.getSheetIndex(finalSheetName) != -1 && wb.getSheetIndex(finalSheetName) != i) {
                        finalSheetName = sheetName + "_" + suffix++;
                    }
                    wb.setSheetName(i, finalSheetName);

                    fillSheetData(wb, sheet, teacher, regs, targetYear, borderCenter, borderLeft, adminName);
                }

                // Remove unused sheets
                while (wb.getNumberOfSheets() > validData.size()) {
                    wb.removeSheetAt(validData.size());
                }

                // 4. Write to output buffer first (Double buffering)
                try (ByteArrayOutputStream outBuffer = new ByteArrayOutputStream()) {
                    wb.write(outBuffer);

                    // 5. Write to response
                    response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
                    String filename = (teacherId != null && !validData.isEmpty())
                            ? "ke_hoach_" + validData.get(0).getKey().getTeacherCode() + "_" + targetYear + ".xlsx"
                            : "ke_hoach_tong_hop_" + targetYear + ".xlsx";
                    response.setHeader("Content-Disposition", "attachment; filename=" + filename);
                    response.setContentLength(outBuffer.size());

                    response.getOutputStream().write(outBuffer.toByteArray());
                    response.getOutputStream().flush();
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Export lỗi: " + e.getMessage());
        }
    }

    private void fillSheetData(
            Workbook wb,
            Sheet sheet,
            User teacher,
            List<SubjectRegistration> regs,
            int year,
            CellStyle borderCenter,
            CellStyle borderLeft,
            String adminName
    ) {

        Row header = sheet.getRow(7);
        if (header == null) throw new RuntimeException("Template lỗi: thiếu header row 7");

        int colHoTen = -1;
        int colMethod = -1;
        int colNote = -1;
        int colCode = -1;

        for (int c = 0; c < header.getLastCellNum(); c++) {
            Cell h = header.getCell(c);
            if (h == null) continue;

            String text = normalize(h.getStringCellValue());

            if (text.contains("ho ten")) colHoTen = c;
            else if (text.contains("hinh thuc")) colMethod = c;
            else if (text.contains("ghi chu")) colNote = c;
            else if (text.contains("ma mon thi")) colCode = c;
        }

        int startRow = header.getRowNum() + 1;
        clearPlanMergedRegions(sheet, startRow);

        int rowIndex = startRow;
        int sttValue = 1;

        // ===== CHỈ GHI 1 LẦN =====
        for (int i = 0; i < regs.size(); i++) {

            SubjectRegistration reg = regs.get(i);
            Row row = sheet.getRow(rowIndex);
            if (row == null) row = sheet.createRow(rowIndex);

            // STT
            Cell cStt = getOrCreate(row, 0);
            if (i == 0) cStt.setCellValue(sttValue);
            else cStt.setCellValue("");
            cStt.setCellStyle(borderCenter);
            applyWrap(cStt);

            // HỌ TÊN
            Cell cName = getOrCreate(row, colHoTen);
            if (i == 0) cName.setCellValue(teacher.getUsername().toUpperCase());
            else cName.setCellValue("");
            cName.setCellStyle(borderLeft);
            applyWrap(cName);

            // MÔN
            Cell cMon = getOrCreate(row, 2);
            cMon.setCellValue(reg.getSubject().getSubjectName());
            cMon.setCellStyle(borderLeft);
            applyWrap(cMon);

            // CHƯƠNG TRÌNH
            Cell cSys = getOrCreate(row, 3);
            cSys.setCellValue(
                    reg.getSubject().getSystem() != null
                            ? reg.getSubject().getSystem().getSystemCode()
                            : ""
            );
            cSys.setCellStyle(borderCenter);
            applyWrap(cSys);

            // HỌC KỲ
            Cell cSem = getOrCreate(row, 4);
            cSem.setCellValue(formatSemester(reg.getSubject().getSemester()));

            cSem.setCellStyle(borderCenter);
            applyWrap(cSem);

            // HÌNH THỨC
            if (colMethod != -1) {
                Cell cMethod = getOrCreate(row, colMethod);
                cMethod.setCellValue(
                        reg.getReasonForCarryOver() == null
                                ? ""
                                : reg.getReasonForCarryOver()
                );
                cMethod.setCellStyle(borderLeft);
                applyWrap(cMethod);
            }

            // DEADLINE
            Cell cDeadline = getOrCreate(row, 6);
            cDeadline.setCellValue(formatPlanDeadline(reg));
            cDeadline.setCellStyle(borderCenter);
            applyWrap(cDeadline);

            // GHI CHÚ
            if (colNote != -1) {
                Cell cNote = getOrCreate(row, colNote);
                cNote.setCellValue(
                        reg.getTeacherNotes() == null
                                ? ""
                                : reg.getTeacherNotes()
                );
                cNote.setCellStyle(borderLeft);
                applyWrap(cNote);
            }

            // MÃ MÔN
            if (colCode != -1) {
                String skill = reg.getSubject().getSkill() != null &&
                        reg.getSubject().getSkill().getSkillName() != null
                        ? reg.getSubject().getSkill().getSkillName()
                        : reg.getSubject().getSkillCode();

                Cell cCode = getOrCreate(row, colCode);
                cCode.setCellValue(skill);
                cCode.setCellStyle(borderCenter);
                applyWrap(cCode);
            }

            autoFitRow(row);
            rowIndex++;
        }

        // MERGE STT | HỌ TÊN
        if (regs.size() > 1) {
            sheet.addMergedRegion(new CellRangeAddress(startRow, rowIndex - 1, 0, 0));
            sheet.addMergedRegion(new CellRangeAddress(startRow, rowIndex - 1, colHoTen, colHoTen));
        }
    }

    private String formatSemester(Semester sem) {
        return switch (sem) {
            case SEMESTER_1 -> "Kỳ 1";
            case SEMESTER_2 -> "Kỳ 2";
            case SEMESTER_3 -> "Kỳ 3";
            case SEMESTER_4 -> "Kỳ 4";
        };
    }


    private void applyWrap(Cell cell) {
        if (cell == null) return;
        CellStyle st = cell.getCellStyle();
        CellStyle newStyle = cell.getSheet().getWorkbook().createCellStyle();
        newStyle.cloneStyleFrom(st);
        newStyle.setWrapText(true);
        cell.setCellStyle(newStyle);
    }

    private void autoFitRow(Row row) {
        if (row == null) return;
        row.setHeight((short) -1); // Excel auto-calc height
    }



    private String formatPlanDeadline(SubjectRegistration reg) {
        if (reg.getYear() == null || reg.getQuarter() == null) return "";
        int month = switch (reg.getQuarter()) {
            case QUY1 -> 3;
            case QUY2 -> 6;
            case QUY3 -> 9;
            case QUY4 -> 12;
            default -> 12;
        };
        return month + "/" + reg.getYear();
    }

    private void clearPlanMergedRegions(Sheet sheet, int startRow) {
        List<Integer> regionsToRemove = new ArrayList<>();
        for (int i = 0; i < sheet.getNumMergedRegions(); i++) {
            CellRangeAddress region = sheet.getMergedRegion(i);
            if (region.getFirstRow() >= startRow) {
                regionsToRemove.add(i);
            }
        }
        for (int i = regionsToRemove.size() - 1; i >= 0; i--) {
            sheet.removeMergedRegion(regionsToRemove.get(i));
        }
    }


    private Map<String, Integer> detectPlanColumns(Row header) {
        Map<String, Integer> map = new HashMap<>();

        for (int i = 0; i < header.getLastCellNum(); i++) {
            Cell cell = header.getCell(i);
            if (cell == null) continue;

            String text = normalize(cell.toString());

            if (text.contains("ten mon")) map.put("subjectName", i);
            else if (text.contains("ma mon thi")) map.put("subjectCode", i);
            else if (text.contains("han hoan thanh") || text.contains("deadline")) map.put("deadline", i);
            else if (text.contains("hinh thuc")) map.put("method", i);

                // 🔥 FIX CHÍNH: Toàn bộ ghi chú → teacherNote
            else if (text.contains("ghi chu")) {
                map.put("teacherNote", i);
            }
        }

        return map;
    }


    private Row findPlanHeaderRow(Sheet sheet) {
        for (Row row : sheet) {
            for (Cell cell : row) {
                if (cell != null && normalize(cell.toString()).contains("stt")) {
                    return row;
                }
            }
        }
        return null;
    }

    private String normalizePlanDeadline(String deadline) {
        if (deadline == null) return null;

        String trimmed = deadline.trim();
        if (trimmed.isEmpty()) return null;

        // 1) Dạng "10/2023" hoặc "3/2025"
        if (trimmed.matches("\\d{1,2}/\\d{4}")) {
            String[] p = trimmed.split("/");
            int monthInt = Integer.parseInt(p[0]);
            String month = String.format("%02d", monthInt);  // luôn 2 chữ số
            String year = p[1];
            return month + "-" + year;                      // → "03-2025"
        }

        // 2) Dạng "dd/MM/yyyy"
        try {
            java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("dd/MM/yyyy");
            Date date = f.parse(trimmed);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);

            int monthInt = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);
            return String.format("%02d-%04d", monthInt, year);
        } catch (Exception ignored) {}

        // 3) Dạng "dd-MMM-yyyy" (02-Jun-2025)
        try {
            java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("dd-MMM-yyyy", Locale.ENGLISH);
            Date date = f.parse(trimmed);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);

            int monthInt = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);
            return String.format("%02d-%04d", monthInt, year);
        } catch (Exception ignored) {}

        // 4) Dạng "MMM-yyyy" (Jun-2025)
        try {
            java.text.SimpleDateFormat f = new java.text.SimpleDateFormat("MMM-yyyy", Locale.ENGLISH);
            Date date = f.parse(trimmed);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);

            int monthInt = cal.get(Calendar.MONTH) + 1;
            int year = cal.get(Calendar.YEAR);
            return String.format("%02d-%04d", monthInt, year);
        } catch (Exception ignored) {}

        // 5) Đã đúng "MM-YYYY"
        if (trimmed.matches("\\d{2}-\\d{4}")) {
            return trimmed;
        }

        // 6) Dạng "YYYY-MM" → đảo lại
        if (trimmed.matches("\\d{4}-\\d{2}")) {
            String[] a = trimmed.split("-");
            return a[1] + "-" + a[0];
        }

        return null;
    }


    // =================== ADMIN - KẾ HOẠCH CHUYÊN MÔN - IMPORT ===================
    @Override
    public ImportPlanResultDto importPlanExcel(String adminId, String teacherId, MultipartFile file) {

        User admin = userRepository.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Admin not found"));
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        ImportPlanResultDto result = new ImportPlanResultDto();

        try (InputStream in = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(in)) {

            Sheet sheet = workbook.getSheetAt(0);

            Row header = findPlanHeaderRow(sheet);
            if (header == null) {
                throw new RuntimeException("Không tìm thấy dòng header");
            }

            Map<String, Integer> col = detectPlanColumns(header);

            int start = header.getRowNum() + 1;

            for (int i = start; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) continue;

                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    // ============================ SUBJECT ============================
                    String subjectNameFromExcel = getString(row, col.get("subjectName"));
                    String subjectCodeRaw = getString(row, col.get("subjectCode"));



                    String subjectCode = subjectCodeRaw.contains("-")
                            ? subjectCodeRaw.split("-")[0].trim()
                            : subjectCodeRaw.trim();

                    List<Subject> matchingSubjects =
                            subjectRepository.findAllBySkill_SkillCode(subjectCode);

                    if (matchingSubjects.isEmpty()) {
                        result.getErrors().add("Row " + (i + 1) + ": Không tìm thấy môn: " + subjectCode);
                        continue;
                    }

                    Subject subject;
                    if (matchingSubjects.size() == 1) {
                        subject = matchingSubjects.get(0);
                    } else {
                        if (subjectNameFromExcel != null && !subjectNameFromExcel.isBlank()) {
                            String name = normalize(subjectNameFromExcel);
                            subject = matchingSubjects.stream()
                                    .filter(s -> normalize(s.getSubjectName()).equals(name))
                                    .findFirst()
                                    .orElse(matchingSubjects.get(0));
                        } else {
                            subject = matchingSubjects.get(0);
                        }
                    }

                    // ============================ DEADLINE ============================
                    String deadline = getString(row, col.get("deadline"));
                    String normalized = normalizePlanDeadline(deadline);

                    if (normalized == null) {
                        result.getErrors().add("Row " + (i + 1) + ": Deadline sai format: " + deadline);
                        continue;
                    }

                    Integer y = Integer.parseInt(normalized.split("-")[1]);
                    Quarter quarter = convertToQuarter(normalized);

                    boolean exists =
                            subjectRegistrationRepository.existsByTeacher_IdAndSubject_IdAndYearAndQuarter(
                                    teacherId, subject.getId(), y, quarter);

                    if (exists) {
                        result.getErrors().add("Row " + (i + 1) + ": Môn " + subjectCode +
                                " năm " + y + " quý " + quarter + " đã tồn tại → bỏ qua");
                        continue;
                    }

                    // ============================ NOTES ============================
                    String method = getString(row, col.get("method"));      // Hình thức chuẩn bị
                    String teacherNote = getString(row, col.get("teacherNote")); // Ghi chú GV

                    // ============================ SAVE ============================
                    SubjectRegistration reg = new SubjectRegistration();
                    reg.setTeacher(teacher);
                    reg.setSubject(subject);
                    reg.setYear(y);
                    reg.setQuarter(quarter);
                    reg.setStatus(RegistrationStatus.REGISTERED);

                    // 🔥🔥 LƯU ĐÚNG TỪNG CỘT
                    reg.setReasonForCarryOver(
                            (method == null || method.isBlank()) ? null : method.trim()
                    );

                    reg.setReasonForCarryOver2(null); // 🔥 KHÔNG BAO GIỜ LƯU GHI CHÚ VÀO ĐÂY

                    reg.setTeacherNotes(
                            (teacherNote == null || teacherNote.isBlank()) ? null : teacherNote.trim()
                    );


                    subjectRegistrationRepository.save(reg);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex) {
                    result.getErrors().add("Row " + (i + 1) + ": " + ex.getMessage());
                }
            }

        } catch (Exception e) {
            result.getErrors().add("Import thất bại: " + e.getMessage());
        }

        result.setErrorCount(result.getErrors().size());
        return result;
    }


}
