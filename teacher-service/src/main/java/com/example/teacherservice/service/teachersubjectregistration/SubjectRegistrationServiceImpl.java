package com.example.teacherservice.service.teachersubjectregistration;

import com.example.teacherservice.dto.teachersubjectregistration.CarryOverRequest;
import com.example.teacherservice.dto.teachersubjectregistration.ImportPlanResultDto;
import com.example.teacherservice.dto.teachersubjectregistration.SubjectRegistrationsDto;
import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.enums.Semester;
import com.example.teacherservice.model.Subject;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.model.User;
import com.example.teacherservice.repository.SubjectRegistrationRepository;
import com.example.teacherservice.repository.SubjectRepository;
import com.example.teacherservice.repository.UserRepository;
import com.example.teacherservice.request.teachersubjectregistration.SubjectRegistrationFilterRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.*;
import org.apache.poi.ss.util.CellRangeAddress;
import org.apache.poi.ss.usermodel.WorkbookFactory;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
public class SubjectRegistrationServiceImpl implements SubjectRegistrationService {

    private final SubjectRegistrationRepository subjectRegistrationRepository;
    private final UserRepository userRepository;
    private final SubjectRepository SubjectRepository;

    @Override
    public List<SubjectRegistration> getRegistrationsByTeacherId(String teacherId) {
        User teacher = userRepository.findById(teacherId).orElse(null);
        assert teacher != null;
        return subjectRegistrationRepository.findByTeacher_Id(teacher.getId());
    }

    @Override
    public List<SubjectRegistrationsDto> getAllRegistrations() {
        return subjectRegistrationRepository.findAll()
                .stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<SubjectRegistrationsDto> getFilteredRegistrations(SubjectRegistrationFilterRequest request) {
        List<SubjectRegistration> results;

        if (request.getTeacherId() != null && !request.getTeacherId().isBlank()) {
            results = subjectRegistrationRepository.findByTeacher_Id(request.getTeacherId());
        } else if (request.getYear() != null && request.getQuarter() != null) {
            results = subjectRegistrationRepository.findByYearAndQuarter(request.getYear(), request.getQuarter());
        } else if (request.getStatus() != null) {
            results = subjectRegistrationRepository.findByStatus(request.getStatus());
        } else {
            results = subjectRegistrationRepository.findAll();
        }

        return results.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Override
    public SubjectRegistrationsDto getById(String id) {
        SubjectRegistration reg = subjectRegistrationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("SubjectRegistration not found"));
        return toDto(reg);
    }

    private SubjectRegistrationsDto toDto(SubjectRegistration e) {
        return SubjectRegistrationsDto.builder()
                .id(e.getId())
                .teacherId(e.getTeacher().getId())
                .subjectId(e.getSubject().getId())
                .subjectCode(e.getSubject().getSkillCode())
                .subjectName(e.getSubject().getSubjectName())
                .systemName(
                        e.getSubject().getSystem() != null
                                ? e.getSubject().getSystem().getSystemName()
                                : "N/A"
                )
                .semester(
                        e.getSubject().getSemester() != null
                                ? formatSemester(e.getSubject().getSemester())
                                : "N/A"
                )
                .year(e.getYear())
                .quarter(e.getQuarter())
                .reasonForCarryOver(e.getReasonForCarryOver())     // Hình thức chuẩn bị
                .reasonForCarryOver2(e.getReasonForCarryOver2())   // Lý do dời môn
                .teacherNotes(e.getTeacherNotes())                 // Ghi chú giáo viên
                .status(e.getStatus())
                .registrationDate(
                        e.getCreationTimestamp() != null
                                ? e.getCreationTimestamp().toString()
                                : null
                )
                .build();
    }


    @Override
    public SubjectRegistrationsDto createRegistration(SubjectRegistrationsDto dto) {
        User teacher = userRepository.findById(dto.getTeacherId()).orElse(null);
        if (teacher == null) {
            throw new RuntimeException("Teacher not authenticated");
        }

        Subject subject = SubjectRepository.findById(dto.getSubjectId()).orElse(null);
        if (subject == null) {
            throw new RuntimeException("Subject not found");
        }

        if (dto.getSubjectId() == null || dto.getYear() == null || dto.getQuarter() == null) {
            throw new IllegalArgumentException("Thiếu thông tin để đăng ký môn học");
        }

        SubjectRegistration registration = SubjectRegistration.builder()
                .teacher(teacher)
                .subject(subject)
                .year(dto.getYear())
                .quarter(dto.getQuarter())

                // Hình thức chuẩn bị
                .reasonForCarryOver(dto.getReasonForCarryOver())

                // Lý do dời môn (tạm để null khi tạo mới)
                .reasonForCarryOver2(dto.getReasonForCarryOver2())

                // Ghi chú của giáo viên
                .teacherNotes(dto.getTeacherNotes())

                .status(dto.getStatus() != null ? dto.getStatus() : RegistrationStatus.REGISTERED)
                .build();

        SubjectRegistration saved = subjectRegistrationRepository.save(registration);
        return toDto(saved);
    }


    @Override
    public SubjectRegistrationsDto carryOver(
            String registrationId,
            CarryOverRequest request,
            String teacherId
    ) {
        SubjectRegistration reg = subjectRegistrationRepository.findById(registrationId)
                .orElseThrow(() -> new RuntimeException("Không tìm thấy đăng ký"));

        if (!reg.getTeacher().getId().equals(teacherId)) {
            throw new RuntimeException("Bạn không có quyền dời môn này");
        }

        if (request.getTargetYear() == null || request.getQuarter() == null) {
            throw new RuntimeException("Vui lòng chọn năm và quý mới");
        }

        boolean exists = subjectRegistrationRepository
                .existsByTeacher_IdAndSubject_IdAndYearAndQuarter(
                        teacherId,
                        reg.getSubject().getId(),
                        request.getTargetYear(),
                        request.getQuarter()
                );

        if (exists) {
            throw new RuntimeException("Bạn đã đăng ký môn này ở năm + quý mới rồi!");
        }

        reg.setYear(request.getTargetYear());
        reg.setQuarter(request.getQuarter());
        reg.setReasonForCarryOver(request.getReasonForCarryOver());
        reg.setStatus(RegistrationStatus.CARRYOVER);

        SubjectRegistration saved = subjectRegistrationRepository.save(reg);
        return toDto(saved);
    }

    // =================== KẾ HOẠCH NĂM - EXPORT EXCEL (THEO TEMPLATE) ===================
    // =================== KẾ HOẠCH NĂM - EXPORT EXCEL (THEO TEMPLATE) ===================
    @Override
    public void exportPlanExcel(HttpServletResponse response, String teacherId, Integer yearRequest) {

        try {
            // Load template
            ClassPathResource resource = new ClassPathResource("templates/ke_hoach_chuyen_mon_template.xlsx");
            if (!resource.exists()) {
                throw new RuntimeException("Không tìm thấy template Excel!");
            }

            Workbook wb = WorkbookFactory.create(resource.getInputStream());

            // STYLE
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

            // LẤY THÔNG TIN GIÁO VIÊN
            User teacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Lấy toàn bộ đăng ký của giáo viên
            List<SubjectRegistration> allRegs = subjectRegistrationRepository.findByTeacher_Id(teacherId);

            if (allRegs.isEmpty()) {
                throw new RuntimeException("Giáo viên chưa đăng ký môn nào!");
            }

            // Group theo năm
            Map<Integer, List<SubjectRegistration>> regsByYear = new TreeMap<>();
            allRegs.stream()
                    .filter(r -> r.getYear() != null)
                    .forEach(r -> regsByYear
                            .computeIfAbsent(r.getYear(), k -> new ArrayList<>())
                            .add(r));

            if (regsByYear.isEmpty()) {
                throw new RuntimeException("Không có dữ liệu năm nào để export");
            }

            // Tạo đủ sheet (clone sheet đầu)
            while (wb.getNumberOfSheets() < regsByYear.size()) {
                wb.cloneSheet(0);
            }

            int sheetIndex = 0;

            for (Map.Entry<Integer, List<SubjectRegistration>> entry : regsByYear.entrySet()) {

                Integer year = entry.getKey();
                List<SubjectRegistration> regs = entry.getValue();

                Sheet sheet = wb.getSheetAt(sheetIndex);
                wb.setSheetName(sheetIndex, "Năm " + year);
                sheetIndex++;

                Row headerRow = sheet.getRow(7);
                if (headerRow == null) throw new RuntimeException("Template thiếu dòng header!");

                // Xác định vị trí các cột
                int colMethod = -1;
                int colNote = -1;
                int colCode = -1;

                for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                    String raw = normalize(headerRow.getCell(c).toString());

                    if (raw.contains("hinh thuc")) colMethod = c;
                    if (raw.contains("ghi chu")) colNote = c;
                    if (raw.contains("ma mon thi")) colCode = c;
                }

                if (colNote == -1 || colCode == -1)
                    throw new RuntimeException("Template thiếu cột GHI CHÚ hoặc MÃ MÔN THI!");

                int dataStart = headerRow.getRowNum() + 1;

                // Xóa merge cũ
                clearDataMergedRegions(sheet, dataStart);

                int rowIndex = dataStart;
                int stt = 1;

                int mergeStartRow = rowIndex;

                for (SubjectRegistration reg : regs) {

                    Row row = sheet.getRow(rowIndex);
                    if (row == null) row = sheet.createRow(rowIndex);

                    // STT
                    Cell c0 = getOrCreate(row, 0);
                    if (rowIndex == mergeStartRow) c0.setCellValue(stt);
                    else c0.setCellValue("");
                    c0.setCellStyle(borderCenter);
                    applyWrap(c0);

                    // HỌ TÊN
                    Cell c1 = getOrCreate(row, 1);
                    if (rowIndex == mergeStartRow) c1.setCellValue(teacher.getUsername().toUpperCase());
                    else c1.setCellValue("");
                    c1.setCellStyle(borderLeft);
                    applyWrap(c1);

                    // MÔN
                    Cell c2 = getOrCreate(row, 2);
                    c2.setCellValue(reg.getSubject().getSubjectName());
                    c2.setCellStyle(borderLeft);
                    applyWrap(c2);

                    // SYSTEM CODE
                    Cell c3 = getOrCreate(row, 3);
                    c3.setCellValue(
                            reg.getSubject().getSystem() != null
                                    ? reg.getSubject().getSystem().getSystemCode()
                                    : ""
                    );
                    c3.setCellStyle(borderCenter);
                    applyWrap(c3);

                    // SEMESTER
                    Cell c4 = getOrCreate(row, 4);
                    c4.setCellValue(
                            reg.getSubject().getSemester() != null
                                    ? formatSemester(reg.getSubject().getSemester())
                                    : ""
                    );
                    c4.setCellStyle(borderCenter);
                    applyWrap(c4);

                    // HÌNH THỨC CHUẨN BỊ
                    Cell cm = getOrCreate(row, colMethod);
                    cm.setCellValue(
                            reg.getReasonForCarryOver() != null
                                    ? reg.getReasonForCarryOver()
                                    : ""
                    );
                    cm.setCellStyle(borderLeft);
                    applyWrap(cm);

                    // DEADLINE
                    Cell cDeadline = getOrCreate(row, 6);
                    cDeadline.setCellValue(formatDeadline(reg));
                    cDeadline.setCellStyle(borderCenter);
                    applyWrap(cDeadline);

                    // GHI CHÚ
                    Cell cNote = getOrCreate(row, colNote);
                    cNote.setCellValue(
                            reg.getTeacherNotes() != null
                                    ? reg.getTeacherNotes()
                                    : ""
                    );
                    cNote.setCellStyle(borderLeft);
                    applyWrap(cNote);

                    // MÃ MÔN THI
                    Cell cCode = getOrCreate(row, colCode);
                    cCode.setCellValue(
                            reg.getSubject().getSkill() != null &&
                                    reg.getSubject().getSkill().getSkillName() != null
                                    ? reg.getSubject().getSkill().getSkillName()
                                    : reg.getSubject().getSkillCode()
                    );
                    cCode.setCellStyle(borderCenter);
                    applyWrap(cCode);

                    autoFitRow(row);

                    rowIndex++;
                }

                // Merge STT + HỌ TÊN
                if (regs.size() > 1) {
                    sheet.addMergedRegion(new CellRangeAddress(mergeStartRow, rowIndex - 1, 0, 0));
                    sheet.addMergedRegion(new CellRangeAddress(mergeStartRow, rowIndex - 1, 1, 1));
                }

                // FOOTER
                fillFooter(sheet, teacher);
            }

            // GHI FILE RA
            response.setContentType("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader("Content-Disposition", "attachment; filename=ke_hoach_gv.xlsx");
            wb.write(response.getOutputStream());
            wb.close();

        } catch (Exception e) {
            throw new RuntimeException("Export lỗi: " + e.getMessage(), e);
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
        Workbook wb = cell.getSheet().getWorkbook();
        CellStyle style = wb.createCellStyle();
        style.cloneStyleFrom(cell.getCellStyle());
        style.setWrapText(true);
        cell.setCellStyle(style);
    }

    private void autoFitRow(Row row) {
        if (row != null) {
            row.setHeight((short) -1);
        }
    }

    private void fillFooter(Sheet sheet, User teacher) {
        LocalDate today = LocalDate.now();
        String footer = "Ngày " +
                String.format("%02d", today.getDayOfMonth()) + "/" +
                String.format("%02d", today.getMonthValue()) + "/" +
                today.getYear();
        for (Row r : sheet) {
            if (r == null) continue;
            for (Cell cell : r) {
                if (cell != null && cell.getCellType() == CellType.STRING) {
                    String text = cell.getStringCellValue().trim();

                    if (text.startsWith("Ngày")) {
                        cell.setCellValue(footer);
                    }

                    if (normalize(text).equals("nguoi lap")) {
                        int nameRow = r.getRowNum() + 4;
                        Row nameR = sheet.getRow(nameRow);
                        if (nameR == null) nameR = sheet.createRow(nameRow);

                        Cell nameC = nameR.getCell(cell.getColumnIndex());
                        if (nameC == null) nameC = nameR.createCell(cell.getColumnIndex());

                        Workbook wb = sheet.getWorkbook();
                        CellStyle style = wb.createCellStyle();
                        Font f = wb.createFont();
                        f.setBold(true);
                        style.setFont(f);
                        style.setAlignment(HorizontalAlignment.CENTER);

                        nameC.setCellValue(teacher.getUsername().toUpperCase());
                        nameC.setCellStyle(style);
                    }
                }
            }
        }
    }


    // =================== KẾ HOẠCH NĂM - IMPORT EXCEL ===================

    @Override
    public ImportPlanResultDto importTeacherPlanExcel(String teacherId, Integer year, MultipartFile file) {

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new RuntimeException("Teacher not found"));

        ImportPlanResultDto result = new ImportPlanResultDto();

        try (InputStream in = file.getInputStream();
             Workbook workbook = WorkbookFactory.create(in)) {

            Sheet sheet = workbook.getSheetAt(0);

            Row header = findHeaderRow(sheet);
            if (header == null) {
                throw new RuntimeException("Không tìm thấy dòng header");
            }

            // Map cột
            Map<String, Integer> col = detectTrainingPlanColumns(header);

            int start = header.getRowNum() + 1;

            for (int i = start; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) continue;

                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    // =========================
                    // 1) LẤY MÔN
                    // =========================
                    String subjectName = getString(row, col.get("subjectName"));
                    String subjectCodeRaw = getString(row, col.get("subjectCode"));

                    if (subjectCodeRaw == null || subjectCodeRaw.isBlank()) {
                        addRowError(result, i + 1, "Thiếu MÃ MÔN THI");
                        continue;
                    }

                    String subjectCode = subjectCodeRaw.contains("-")
                            ? subjectCodeRaw.split("-")[0].trim()
                            : subjectCodeRaw.trim();

                    List<Subject> found = SubjectRepository.findAllBySkill_SkillCode(subjectCode);

                    if (found.isEmpty()) {
                        addRowError(result, i + 1, "Không tìm thấy môn với mã: " + subjectCode);
                        continue;
                    }

                    Subject subject = found.size() == 1
                            ? found.get(0)
                            : found.stream()
                            .filter(s -> normalize(s.getSubjectName()).equals(normalize(subjectName)))
                            .findFirst()
                            .orElse(found.get(0));

                    // =========================
                    // 2) LẤY DEADLINE → NĂM + QUÝ
                    // =========================
                    String deadline = getString(row, col.get("deadline"));
                    String normalized = normalizeDeadline(deadline);

                    if (normalized == null) {
                        addRowError(result, i + 1, "Deadline sai format: " + deadline);
                        continue;
                    }

                    String[] parts = normalized.split("-");
                    Integer y = Integer.parseInt(parts[1]);
                    Quarter quarter = convertMonthToQuarter(parts[0]);

                    // =========================
                    // 3) CHECK TRÙNG
                    // =========================
                    boolean exists = subjectRegistrationRepository
                            .existsByTeacher_IdAndSubject_IdAndYearAndQuarter(
                                    teacherId, subject.getId(), y, quarter);

                    if (exists) {
                        addRowError(result, i + 1,
                                "Môn " + subjectCode + " năm " + y + " quý " + quarter + " đã tồn tại → bỏ qua");
                        continue;
                    }

                    // =========================
                    // 4) LẤY HÌNH THỨC + GHI CHÚ
                    // =========================
                    String method = getString(row, col.get("method"));   // HÌNH THỨC CHUẨN BỊ
                    String note = getString(row, col.get("note"));       // GHI CHÚ GIÁO VIÊN

                    // =========================
                    // 5) TẠO BẢN GHI MỚI
                    // =========================
                    SubjectRegistration reg = new SubjectRegistration();
                    reg.setTeacher(teacher);
                    reg.setSubject(subject);
                    reg.setYear(y);
                    reg.setQuarter(quarter);
                    reg.setStatus(RegistrationStatus.REGISTERED);

                    // Ghi đúng field yêu cầu
                    reg.setReasonForCarryOver(method);      // ⭐ Hình thức chuẩn bị
                    reg.setTeacherNotes(note);              // ⭐ Ghi chú giáo viên

                    // Không động tới reason_for_carry_over2

                    subjectRegistrationRepository.save(reg);
                    result.setSuccessCount(result.getSuccessCount() + 1);

                } catch (Exception ex) {
                    addRowError(result, i + 1, ex.getMessage());
                }
            }

        } catch (Exception e) {
            addRowError(result, 0, "Import thất bại: " + e.getMessage());
        }

        result.setErrorCount(result.getErrors().size());
        return result;
    }




    private Cell getOrCreate(Row row, int col) {
        Cell cell = row.getCell(col);
        if (cell == null) cell = row.createCell(col);
        return cell;
    }

    private void clearDataMergedRegions(Sheet sheet, int startRow) {
        for (int i = sheet.getNumMergedRegions() - 1; i >= 0; i--) {
            CellRangeAddress region = sheet.getMergedRegion(i);
            if (region.getFirstRow() >= startRow) {
                sheet.removeMergedRegion(i);
            }
        }
    }

    private String normalize(String s) {
        if (s == null) return "";
        return java.text.Normalizer.normalize(s, java.text.Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase()
                .trim();
    }

    private String getString(Row row, Integer colIndex) {
        if (colIndex == null) return null;
        Cell cell = row.getCell(colIndex);
        if (cell == null) return null;
        return cell.toString().trim();
    }

    private boolean isEmptyRow(Row row) {
        for (int i = 0; i < row.getLastCellNum(); i++) {
            Cell c = row.getCell(i);
            if (c != null && c.toString().trim().length() > 0) return false;
        }
        return true;
    }

    private Row findHeaderRow(Sheet sheet) {
        for (int i = 0; i <= sheet.getLastRowNum(); i++) {
            Row r = sheet.getRow(i);
            if (r == null) continue;

            for (int c = 0; c < r.getLastCellNum(); c++) {
                String raw = normalize(r.getCell(c) == null ? "" : r.getCell(c).toString());
                if (raw.contains("ho ten")) {
                    return r;
                }
            }
        }
        return null;
    }

    private Map<String, Integer> detectTrainingPlanColumns(Row header) {
        Map<String, Integer> col = new HashMap<>();

        for (int c = 0; c < header.getLastCellNum(); c++) {
            Cell cell = header.getCell(c);
            if (cell == null) continue;

            String raw = normalize(cell.toString());

            if (raw.contains("ho ten")) col.put("teacherName", c);
            if (raw.contains("mon chuan bi")) col.put("subjectName", c);
            if (raw.contains("ma mon thi")) col.put("subjectCode", c);
            if (raw.contains("hinh thuc")) col.put("method", c);
            if (raw.contains("ghi chu")) col.put("note", c);
            if (raw.contains("han hoan thanh")) col.put("deadline", c);
        }

        return col;
    }

    private void addRowError(ImportPlanResultDto result, int row, String msg) {
        result.getErrors().add("Row " + row + ": " + msg);
    }

    private Quarter convertMonthToQuarter(String monthStr) {
        int month = Integer.parseInt(monthStr);
        if (month <= 3) return Quarter.QUY1;
        if (month <= 6) return Quarter.QUY2;
        if (month <= 9) return Quarter.QUY3;
        return Quarter.QUY4;
    }

    private String normalizeDeadline(String raw) {
        if (raw == null) return null;
        raw = raw.trim();

        // Trường hợp Excel date (số)
        try {
            double d = Double.parseDouble(raw);
            Date date = DateUtil.getJavaDate(d);
            Calendar cal = Calendar.getInstance();
            cal.setTime(date);
            int m = cal.get(Calendar.MONTH) + 1;
            int y = cal.get(Calendar.YEAR);
            return String.format("%02d-%04d", m, y);
        } catch (Exception ignored) {}

        // dd-MMM-yyyy
        try {
            var f = new java.text.SimpleDateFormat("dd-MMM-yyyy", Locale.ENGLISH);
            var d = f.parse(raw);
            Calendar cal = Calendar.getInstance();
            cal.setTime(d);
            int m = cal.get(Calendar.MONTH) + 1;
            int y = cal.get(Calendar.YEAR);
            return String.format("%02d-%04d", m, y);
        } catch (Exception ignored) {}

        // dd/MM/yyyy
        try {
            var f = new java.text.SimpleDateFormat("dd/MM/yyyy");
            var d = f.parse(raw);
            Calendar cal = Calendar.getInstance();
            cal.setTime(d);
            int m = cal.get(Calendar.MONTH) + 1;
            int y = cal.get(Calendar.YEAR);
            return String.format("%02d-%04d", m, y);
        } catch (Exception ignored) {}

        // MM-yyyy
        if (raw.matches("\\d{2}-\\d{4}")) return raw;

        // yyyy-MM
        if (raw.matches("\\d{4}-\\d{2}")) {
            String[] a = raw.split("-");
            return a[1] + "-" + a[0];
        }

        return null;
    }

    private String formatDeadline(SubjectRegistration r) {
        return switch (r.getQuarter()) {
            case QUY1 -> "03-" + r.getYear();
            case QUY2 -> "06-" + r.getYear();
            case QUY3 -> "09-" + r.getYear();
            default -> "12-" + r.getYear();
        };
    }

}
