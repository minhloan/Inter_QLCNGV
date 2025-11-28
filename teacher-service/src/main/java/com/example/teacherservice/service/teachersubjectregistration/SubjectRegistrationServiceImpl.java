package com.example.teacherservice.service.teachersubjectregistration;

import com.example.teacherservice.dto.teachersubjectregistration.CarryOverRequest;
import com.example.teacherservice.dto.teachersubjectregistration.ImportPlanResultDto;
import com.example.teacherservice.dto.teachersubjectregistration.SubjectRegistrationsDto;
import com.example.teacherservice.enums.Quarter;
import com.example.teacherservice.enums.RegistrationStatus;
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
                        e.getSubject().getSystem() != null ?
                                e.getSubject().getSystem().getSystemName() : "N/A"
                )
                .semester(
                        e.getSubject().getSemester() != null ?
                                e.getSubject().getSemester().name() : "N/A"
                )
                .year(e.getYear())
                .quarter(e.getQuarter() != null ? e.getQuarter() : null)
                .reasonForCarryOver(e.getReasonForCarryOver())
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
            throw new IllegalArgumentException("Thiếu thông tin cần thiết để đăng ký môn học");
        }

        SubjectRegistration registration = SubjectRegistration.builder()
                .teacher(teacher)
                .subject(subject)
                .year(dto.getYear())
                .quarter(dto.getQuarter())
                .reasonForCarryOver(dto.getReasonForCarryOver())
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

    // =================== KẾ HOẠCH NĂM - EXPORT EXCEL ===================
    // =================== KẾ HOẠCH NĂM - EXPORT EXCEL ===================
    // =================== KẾ HOẠCH NĂM - EXPORT EXCEL (THEO TEMPLATE) ===================
    @Override
    public void exportPlanExcel(HttpServletResponse response, String teacherId, Integer yearRequest) {

        ClassPathResource resource = new ClassPathResource("templates/ke_hoach_chuyen_mon_template.xlsx");
        
        // Validate file exists
        if (!resource.exists()) {
            throw new RuntimeException("Template file not found: templates/ke_hoach_chuyen_mon_template.xlsx. " +
                    "Please ensure the file exists in src/main/resources/templates/");
        }

        // Validate file is readable
        if (!resource.isReadable()) {
            throw new RuntimeException("Template file is not readable: templates/ke_hoach_chuyen_mon_template.xlsx");
        }

        InputStream templateStream = null;
        Workbook wb = null;
        try {
            templateStream = resource.getInputStream();

            if (templateStream == null) {
                throw new RuntimeException("Cannot open input stream for template file");
            }

            // Đọc file vào memory trước để tránh lỗi ZIP
            ByteArrayOutputStream buffer = new ByteArrayOutputStream();
            byte[] bufferArray = new byte[8192];
            int nRead;
            long totalBytes = 0;
            while ((nRead = templateStream.read(bufferArray, 0, bufferArray.length)) != -1) {
                buffer.write(bufferArray, 0, nRead);
                totalBytes += nRead;
            }
            buffer.flush();
            byte[] fileBytes = buffer.toByteArray();
            
            if (fileBytes.length == 0) {
                throw new RuntimeException("Template file is empty. File size: " + totalBytes + " bytes");
            }

            // Kiểm tra magic number của file Excel (XLSX bắt đầu với PK - ZIP signature)
            if (fileBytes.length < 4 || (fileBytes[0] != 0x50 || fileBytes[1] != 0x4B)) {
                throw new RuntimeException("Template file is not a valid Excel file. " +
                        "Expected ZIP signature (PK) but found different bytes. File might be corrupted.");
            }

            // Load workbook từ byte array - dùng WorkbookFactory để xử lý tốt hơn
            try (ByteArrayInputStream bais = new ByteArrayInputStream(fileBytes)) {
                wb = WorkbookFactory.create(bais);
            } catch (java.util.zip.ZipException zipEx) {
                throw new RuntimeException("Template Excel file is corrupted (ZIP error). " +
                        "Please replace the template file with a valid Excel (.xlsx) file. " +
                        "File size: " + fileBytes.length + " bytes. Error: " + zipEx.getMessage(), zipEx);
            } catch (Exception e) {
                // Kiểm tra nếu là DataFormatException (nested trong ZipException)
                Throwable cause = e.getCause();
                if (cause instanceof java.util.zip.DataFormatException || 
                    cause instanceof java.util.zip.ZipException ||
                    e.getMessage() != null && e.getMessage().contains("invalid stored block lengths")) {
                    throw new RuntimeException("Template Excel file is corrupted (ZIP/DataFormat error). " +
                            "Please replace the template file 'ke_hoach_chuyen_mon_template.xlsx' with a valid Excel (.xlsx) file. " +
                            "File size: " + fileBytes.length + " bytes. Error: " + e.getMessage(), e);
                }
                throw new RuntimeException("Invalid Excel template file. Please check if the file is a valid Excel (.xlsx) file. " +
                        "The file might be corrupted. File size: " + fileBytes.length + " bytes. Error: " + e.getMessage(), e);
            }

            User teacher = userRepository.findById(teacherId)
                    .orElseThrow(() -> new RuntimeException("Teacher not found"));

            // Lấy tất cả đăng ký của GV (nhiều năm)
            List<SubjectRegistration> allRegs =
                    subjectRegistrationRepository.findByTeacher_Id(teacherId);

            if (allRegs.isEmpty()) {
                throw new RuntimeException("Giáo viên chưa đăng ký môn nào!");
            }

            // Group theo năm, sort tăng dần
            Map<Integer, List<SubjectRegistration>> regsByYear = new TreeMap<>();
            allRegs.stream()
                    .filter(r -> r.getYear() != null)
                    .forEach(r -> regsByYear
                            .computeIfAbsent(r.getYear(), k -> new ArrayList<>())
                            .add(r));

            if (regsByYear.isEmpty()) {
                throw new RuntimeException("Không có dữ liệu năm nào để export");
            }

            // ====== STYLE GIỐNG BÊN ADMIN ======
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

            // ====== CHUẨN BỊ ĐỦ SỐ SHEET (clone từ sheet 0) ======
            int needSheets = regsByYear.size();
            while (wb.getNumberOfSheets() < needSheets) {
                wb.cloneSheet(0);
            }

            // ====== ĐỔ DỮ LIỆU TỪNG NĂM VÀO MỖI SHEET ======
            int sheetIndex = 0;
            for (Map.Entry<Integer, List<SubjectRegistration>> entry : regsByYear.entrySet()) {

                Integer year = entry.getKey();
                List<SubjectRegistration> regs = entry.getValue();

                Sheet sheet = wb.getSheetAt(sheetIndex);
                wb.setSheetName(sheetIndex, "Năm " + year);
                sheetIndex++;

                // ----- tìm dòng header (dòng có HỌ TÊN) -----
                Row headerRow = sheet.getRow(7);   // đúng template của bạn: header nằm ở dòng 8 (index 7)
                if (headerRow == null) {
                    throw new RuntimeException("Template không có dòng header (row 8)!");
                }

                // Xác định cột HÌNH THỨC, GHI CHÚ, MÃ MÔN THI theo text header
                int methodCol = -1;
                int noteCol = -1;
                int codeCol = -1;

                for (int c = 0; c < headerRow.getLastCellNum(); c++) {
                    Cell h = headerRow.getCell(c);
                    if (h == null) continue;

                    String raw = normalize(h.toString());

                    if (raw.contains("hinh thuc chuan bi") || raw.contains("hinh thuc")) {
                        methodCol = c;
                    } else if (raw.contains("ghi chu")) {
                        noteCol = c;
                    } else if (raw.contains("ma mon thi")) {
                        codeCol = c;
                    }
                }

                if (codeCol == -1) {
                    throw new RuntimeException("Không tìm thấy cột MÃ MÔN THI trong template!");
                }
                if (noteCol == -1) {
                    throw new RuntimeException("Không tìm thấy cột GHI CHÚ trong template!");
                }

                int dataStartRow = headerRow.getRowNum() + 1;

                // Xoá merge cũ ở vùng dữ liệu (nếu có)
                clearDataMergedRegions(sheet, dataStartRow);

                // ----- Ghi dữ liệu -----
                int rowIndex = dataStartRow;
                int stt = 1;

                for (SubjectRegistration reg : regs) {

                    Row row = sheet.getRow(rowIndex);
                    if (row == null) row = sheet.createRow(rowIndex);

                    // 0: STT
                    Cell c0 = getOrCreate(row, 0);
                    c0.setCellValue(stt++);
                    c0.setCellStyle(borderCenter);

                    // 1: HỌ TÊN
                    Cell c1 = getOrCreate(row, 1);
                    c1.setCellValue(teacher.getUsername());
                    c1.setCellStyle(borderLeft);

                    // 2: MÔN CHUẨN BỊ
                    Cell c2 = getOrCreate(row, 2);
                    c2.setCellValue(reg.getSubject().getSubjectName());
                    c2.setCellStyle(borderLeft);

                    // 3: CHƯƠNG TRÌNH
                    Cell c3 = getOrCreate(row, 3);
                    c3.setCellValue(
                            reg.getSubject().getSystem() != null
                                    ? reg.getSubject().getSystem().getSystemCode()
                                    : ""
                    );
                    c3.setCellStyle(borderCenter);

                    // 4: HỌC KỲ
                    Cell c4 = getOrCreate(row, 4);
                    c4.setCellValue(
                            reg.getSubject().getSemester() != null
                                    ? reg.getSubject().getSemester().name()
                                    : ""
                    );
                    c4.setCellStyle(borderCenter);

                    // HÌNH THỨC CHUẨN BỊ (để trống, nhưng đúng cột)
                    if (methodCol != -1) {
                        Cell cm = getOrCreate(row, methodCol);
                        cm.setCellValue("");
                        cm.setCellStyle(borderLeft);
                    }

                    // HẠN HOÀN THÀNH (03/06/09/12 - năm)
                    Cell cDeadline = getOrCreate(row, 6);
                    cDeadline.setCellValue(formatDeadline(reg));
                    cDeadline.setCellStyle(borderCenter);

                    // GHI CHÚ (để trống)
                    Cell cNote = getOrCreate(row, noteCol);
                    cNote.setCellValue("");
                    cNote.setCellStyle(borderLeft);

                    // MÃ MÔN THI (đúng cột, không lộn nữa)
                    Cell cCode = getOrCreate(row, codeCol);
                    cCode.setCellValue(reg.getSubject().getSkillCode());
                    cCode.setCellStyle(borderCenter);

                    rowIndex++;
                }

                // ----- Cập nhật NĂM trên tiêu đề + footer Ngày / / NĂM -----
                String footerLabel = "Ngày    /    / " + year;

                for (Row r : sheet) {
                    if (r == null) continue;

                    for (Cell cell : r) {
                        if (cell == null || cell.getCellType() != CellType.STRING) continue;

                        String text = cell.getStringCellValue();

                        // Dòng tiêu đề kiểu "NĂM: 2025"
                        if (text.contains("NĂM")) {
                            if (text.contains(":")) {
                                cell.setCellValue("NĂM: " + year);
                            }
                        }

                        // Footer "Ngày / / 2025"
                        if (text.trim().startsWith("Ngày")) {
                            cell.setCellValue(footerLabel);
                        }
                    }
                }
            }

            // ====== Ghi workbook ra response ======
            response.setContentType(
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
            response.setHeader(
                    "Content-Disposition",
                    "attachment; filename=ke_hoach_giao_vien.xlsx");

            wb.write(response.getOutputStream());
            response.getOutputStream().flush();

        } catch (Exception e) {
            throw new RuntimeException("Export lỗi: " + e.getMessage(), e);
        } finally {
            // Cleanup resources
            if (wb != null) {
                try {
                    wb.close();
                } catch (IOException e) {
                    // Ignore
                }
            }
            if (templateStream != null) {
                try {
                    templateStream.close();
                } catch (IOException e) {
                    // Ignore
                }
            }
        }
    }




    // Support
    private void setCell(Row row, int col, Object value, CellStyle style) {
        Cell c = row.getCell(col);
        if (c == null) c = row.createCell(col);
        if (value instanceof String) c.setCellValue((String) value);
        else if (value instanceof Integer) c.setCellValue((Integer) value);
        c.setCellStyle(style);
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

            // Map cột: ho ten, ma mon thi, han hoan thanh, hinh thuc, ghi chu
            Map<String, Integer> col = detectTrainingPlanColumns(header);

            int start = header.getRowNum() + 1;

            // chuẩn hóa username trong DB
            String teacherNameDbNorm = normalize(teacher.getUsername());

            for (int i = start; i <= sheet.getLastRowNum(); i++) {

                Row row = sheet.getRow(i);
                if (row == null || isEmptyRow(row)) continue;

                result.setTotalRows(result.getTotalRows() + 1);

                try {
                    // =========================
                    // 1. KIỂM TRA ĐÚNG GIÁO VIÊN
                    // =========================
                    String teacherNameExcel = getString(row, col.get("teacherName"));
                    if (teacherNameExcel == null || teacherNameExcel.isBlank()) {
                        addRowError(result, i + 1, "Thiếu HỌ TÊN");
                        continue;
                    }

                    String teacherNameExcelNorm = normalize(teacherNameExcel);
                    if (!teacherNameExcelNorm.equals(teacherNameDbNorm)) {
                        addRowError(result, i + 1,
                                "Họ tên trong file không khớp giáo viên đăng nhập: " + teacherNameExcel);
                        continue;
                    }

                    // =========================
                    // 2. LẤY MÃ MÔN
                    // =========================
                    String subjectCode = getString(row, col.get("subjectCode"));
                    if (subjectCode == null || subjectCode.isBlank()) {
                        addRowError(result, i + 1, "Thiếu MÃ MÔN THI");
                        continue;
                    }

                    Subject subject = SubjectRepository.findBySkill_SkillCode(subjectCode)
                            .orElseThrow(() -> new RuntimeException("Không tìm thấy môn: " + subjectCode));

                    // =========================
                    // 3. LẤY DEADLINE → NĂM + QUÝ
                    // =========================
                    String deadline = getString(row, col.get("deadline"));
                    String normalized = normalizeDeadline(deadline);

                    if (normalized == null) {
                        addRowError(result, i + 1, "Deadline sai format: " + deadline);
                        continue;
                    }

                    String[] parts = normalized.split("-");
                    Integer y = Integer.parseInt(parts[1]);
                    String month = parts[0];

                    Quarter quarter = convertMonthToQuarter(month);

                    // =========================
                    // 4. CHECK TRÙNG (teacherId + subjectId + year + quarter)
                    // =========================
                    boolean exists =
                            subjectRegistrationRepository.existsByTeacher_IdAndSubject_IdAndYearAndQuarter(
                                    teacherId,
                                    subject.getId(),
                                    y,
                                    quarter
                            );

                    if (exists) {
                        addRowError(result, i + 1,
                                "Môn " + subjectCode + " năm " + y + " quý " + quarter + " đã tồn tại → bỏ qua");
                        continue;
                    }

                    // =========================
                    // 5. TẠO ĐĂNG KÝ MỚI (CHỈ THÊM, KHÔNG GHI ĐÈ)
                    // =========================
                    SubjectRegistration reg = new SubjectRegistration();
                    reg.setTeacher(teacher);
                    reg.setSubject(subject);
                    reg.setYear(y);
                    reg.setQuarter(quarter);

                    // Ghép HÌNH THỨC + GHI CHÚ vào reasonForCarryOver
                    String method = getString(row, col.get("method"));
                    String note = getString(row, col.get("note"));

                    StringBuilder sb = new StringBuilder();
                    if (method != null && !method.isBlank()) sb.append("- ").append(method).append("\n");
                    if (note != null && !note.isBlank()) sb.append("- ").append(note).append("\n");
                    sb.append("Deadline: ").append(deadline);

                    reg.setReasonForCarryOver(sb.toString());
                    reg.setStatus(RegistrationStatus.REGISTERED);

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
