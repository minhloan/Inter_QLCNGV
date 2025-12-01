package com.example.teacherservice.service.aptech;

import com.example.teacherservice.dto.aptech.AptechExamDto;
import com.example.teacherservice.dto.aptech.AptechExamHistoryDto;
import com.example.teacherservice.dto.aptech.AptechExamSessionDto;
import com.example.teacherservice.dto.aptech.AptechOCRResponseDto;
import com.example.teacherservice.dto.common.PagedResponse;
import com.example.teacherservice.dto.evidence.OCRResultDTO;
import com.example.teacherservice.enums.ExamResult;
import com.example.teacherservice.enums.NotificationType;
import com.example.teacherservice.model.*;
import com.example.teacherservice.repository.*;
import com.example.teacherservice.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.apache.poi.xwpf.usermodel.*;
import org.openxmlformats.schemas.wordprocessingml.x2006.main.CTRow;
import org.springframework.core.io.ClassPathResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.text.Normalizer;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class AptechExamServiceImpl implements AptechExamService {
    private static final int SECTION_ROW_HEIGHT = 500; // twips (≈ 25pt)
    private static final int DATA_ROW_HEIGHT    = 420; // twips (≈ 21pt)
    private final AptechExamRepository examRepo;
    private final AptechExamSessionRepository sessionRepo;
    private final UserRepository userRepo;
    private final SubjectRepository subjectRepo;
    private final NotificationService notificationService;

    private static final int MAX_ATTEMPTS = 3;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy");
    private static final DateTimeFormatter TIME_FORMATTER = DateTimeFormatter.ofPattern("HH'h'mm");
    private static final String DEFAULT_SIGNATURE = "....................................";
    private static final String DEFAULT_SECTION_LABEL = "APTECH";
    private static final Pattern DIACRITICS_PATTERN = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
    private static final String SESSION_NOTIFICATION_ENTITY = "APTECH_EXAM_SESSION";

    private final AptechExamRepository examRepository;

    private void setRowHeight(XWPFTableRow row, int heightTwips) {
        if (row == null) return;
        row.setHeight(heightTwips);  // Apache POI sẽ set trHeight cho row
    }
    // =========================
    // Sessions
    // =========================
    @Override
    public List<AptechExamSessionDto> getAllSessions() {
        return sessionRepo.findAll().stream()
                .map(this::toSessionDto)
                .collect(Collectors.toList());
    }

    @Override
    public PagedResponse<AptechExamSessionDto> getUpcomingSessions(int page, int size, String keyword) {
        int safePage = Math.max(page, 0);
        int requestedSize = size <= 0 ? 10 : size;
        int safeSize = Math.min(Math.max(requestedSize, 5), 50);

        Sort sort = Sort.by(Sort.Order.asc("examDate"), Sort.Order.asc("examTime"));
        Pageable pageable = PageRequest.of(safePage, safeSize, sort);

        LocalDate today = LocalDate.now();
        String normalizedKeyword = (keyword != null && !keyword.trim().isEmpty()) ? keyword.trim() : null;

        Page<AptechExamSession> result = sessionRepo.searchUpcomingSessions(today, normalizedKeyword, pageable);
        List<AptechExamSessionDto> items = result.getContent().stream()
                .map(this::toSessionDto)
                .collect(Collectors.toList());

        return PagedResponse.<AptechExamSessionDto>builder()
                .items(items)
                .page(result.getNumber())
                .size(result.getSize())
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .hasNext(result.hasNext())
                .build();
    }

    @Override
    public AptechExamSessionDto createSession(AptechExamSessionDto dto, String createdBy) {
        validateSessionPayload(dto);
        String normalizedRoom = normalizeRoomLabel(dto.getRoom());

        if (sessionRepo.existsByExamDateAndRoom(dto.getExamDate(), normalizedRoom)) {
            String dateText = dto.getExamDate().format(DATE_FORMATTER);
            throw new IllegalArgumentException(String.format("Phòng %s đã được đặt cho đợt thi ngày %s", normalizedRoom, dateText));
        }

        AptechExamSession session = AptechExamSession.builder()
                .examDate(dto.getExamDate())
                .examTime(dto.getExamTime())
                .room(normalizedRoom)
                .note(dto.getNote())
                .build();

        AptechExamSession saved = sessionRepo.save(session);
        notifyUsersAboutNewSession(saved, createdBy);
        return toSessionDto(saved);
    }

    private void validateSessionPayload(AptechExamSessionDto dto) {
        if (dto == null) {
            throw new IllegalArgumentException("Thông tin đợt thi không hợp lệ");
        }
        if (dto.getExamDate() == null) {
            throw new IllegalArgumentException("Vui lòng chọn ngày thi Aptech");
        }
        if (dto.getExamDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Ngày thi phải từ hôm nay trở đi");
        }
        if (dto.getExamTime() == null) {
            throw new IllegalArgumentException("Vui lòng chọn giờ thi");
        }
        if (dto.getRoom() == null || dto.getRoom().isBlank()) {
            throw new IllegalArgumentException("Phòng thi không được bỏ trống");
        }
        if (dto.getRoom().trim().length() > 50) {
            throw new IllegalArgumentException("Tên phòng thi tối đa 50 ký tự");
        }
    }

    private String normalizeRoomLabel(String room) {
        return room != null ? room.trim().toUpperCase(Locale.ROOT) : null;
    }

    private void notifyUsersAboutNewSession(AptechExamSession session, String createdBy) {
        if (session == null || notificationService == null) return;
        String message = String.format(
                "Đợt thi Aptech mới: %s | Giờ: %s | Phòng: %s",
                formatExamDate(session),
                formatExamTime(session),
                session.getRoom() != null && !session.getRoom().isBlank() ? session.getRoom() : "........"
        );
        notificationService.broadcast(
                createdBy,
                "Đợt thi Aptech mới",
                message,
                NotificationType.ADMIN_NOTIFICATION,
                SESSION_NOTIFICATION_ENTITY,
                session.getId()
        );
    }

    // =========================
    // Exams
    // =========================
    @Override
    public List<AptechExamDto> getAllExams() {
        return examRepo.findAll().stream()
                .map(this::toExamDto)
                .collect(Collectors.toList());
    }

    @Override
    public List<AptechExamDto> getExamsByTeacher(String teacherId) {
        User teacher = userRepo.findById(teacherId).orElseThrow();
        return examRepo.findByTeacher(teacher).stream()
                .map(this::toExamDto)
                .collect(Collectors.toList());
    }

    @Override
    public AptechExamDto getExamForTeacher(String examId, String teacherId) {
        AptechExam exam = examRepo.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        if (exam.getTeacher() == null || !exam.getTeacher().getId().equals(teacherId)) {
            throw new IllegalArgumentException("Exam not found");
        }
        return toExamDto(exam);
    }

    @Override
    public List<AptechExamHistoryDto> getExamHistory(String teacherId, String subjectId) {
        User teacher = userRepo.findById(teacherId).orElseThrow();
        return examRepo.findByTeacher(teacher).stream()
                .filter(exam -> exam.getSubject().getId().equals(subjectId))
                .map(this::toHistoryDto)
                .collect(Collectors.toList());
    }

    // =========================
    // Certificates
    // =========================
    @Override
    public void uploadCertificate(String examId, File certificateFile) {
        AptechExam exam = examRepo.findById(examId).orElseThrow();

        if (exam.getExamProofFile() == null) {
            throw new IllegalArgumentException("Vui lòng upload chứng nhận thi trước khi nộp bằng chính thức");
        }

        Integer score = exam.getScore();
        if (score == null || score < 80) {
            throw new IllegalArgumentException("Certificate only available for exams with score >= 80");
        }
        exam.setCertificateFile(certificateFile);
        examRepo.save(exam);
        
        // Gửi thông báo thành công
        notifyTeacherAboutCertificateUpload(exam);
    }

    @Override
    @Transactional
    public AptechOCRResponseDto uploadExamProofWithOCR(String examId, File proofFile, OCRResultDTO ocrResult) {
        AptechExam exam = examRepo.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        
        // 1. Save exam proof file reference
        exam.setExamProofFile(proofFile);
        
        // 2. Save OCR raw text for debugging
        if (ocrResult.getOcrText() != null) {
            exam.setOcrRawText(ocrResult.getOcrText());
        }
        
        // 3. Save OCR extracted name for verification
        boolean nameMatch = false;
        if (ocrResult.getOcrFullName() != null) {
            exam.setOcrExtractedName(ocrResult.getOcrFullName());
            
            // Verify name matches teacher
            String teacherName = exam.getTeacher().getUsername(); // or fullName if available
            nameMatch = namesAreSimilar(teacherName, ocrResult.getOcrFullName());
            if (!nameMatch) {

            }
        }
        
        // 4. Save OCR subject code for verification
        boolean subjectMatch = false;
        if (ocrResult.getOcrSubjectName() != null) {
            exam.setOcrSubjectCode(ocrResult.getOcrSubjectName());
            
            // Verify subject matches
            String expectedCode = exam.getSubject().getSkillCode();
            subjectMatch = ocrResult.getOcrSubjectName().contains(expectedCode);
            if (!subjectMatch) {

            }
        }
        
        // 5. Auto-update score and result if OCR extracted them successfully
        // For Aptech: save PERCENTAGE (100) not MARKS (30) since scoring is percentage-based
        if (ocrResult.getOcrPercentage() != null) {
            exam.setScore(ocrResult.getOcrPercentage());
        }

        if (ocrResult.getOcrResult() != null) {
            exam.setResult(ocrResult.getOcrResult());
        }

        examRepo.save(exam);
        
        // 6. Build and return response DTO
        return AptechOCRResponseDto.builder()
                .proofFileId(proofFile.getId())
                .extractedScore(ocrResult.getOcrPercentage())  // Return percentage (100) not marks (30)
                .extractedResult(ocrResult.getOcrResult() != null ? ocrResult.getOcrResult().name() : null)
                .extractedSubject(ocrResult.getOcrSubjectName())
                .extractedName(ocrResult.getOcrFullName())
                .ocrRawText(ocrResult.getOcrText())
                .subjectMatch(subjectMatch)
                .nameMatch(nameMatch)
                .build();
    }

    private void notifyTeacherAboutStatusUpdate(AptechExam exam, com.example.teacherservice.enums.AptechStatus newStatus) {
        if (exam == null || exam.getTeacher() == null || newStatus == null) {
            return;
        }

        User teacher = exam.getTeacher();
        String subjectName = exam.getSubject() != null ? exam.getSubject().getSubjectName() : "môn thi";
        String examDate = exam.getExamDate() != null ? exam.getExamDate().format(DATE_FORMATTER) : "N/A";
        
        String title = "Cập nhật trạng thái kỳ thi Aptech";
        String message = String.format(
            """
            Trạng thái kỳ thi Aptech của bạn đã được cập nhật.
            
            Môn thi: %s
            Ngày thi: %s
            Trạng thái mới: %s
            """,
            subjectName,
            examDate,
            newStatus.name()
        );

        notificationService.createAndSend(
            teacher.getId(),
            title,
            message,
            NotificationType.EXAM_NOTIFICATION,
            "APTECH_EXAM",
            exam.getId()
        );
    }

    private void notifyTeacherAboutCertificateUpload(AptechExam exam) {
        if (exam == null || exam.getTeacher() == null) {
            return;
        }

        User teacher = exam.getTeacher();
        String subjectName = exam.getSubject() != null ? exam.getSubject().getSubjectName() : "môn thi";
        
        String title = "Upload bằng Aptech thành công";
        String message = String.format(
            """
            Bạn đã upload thành công bằng chính thức cho kỳ thi Aptech.
            
            Môn thi: %s
            Điểm số: %d%%
            
            Chúc mừng bạn đã hoàn thành kỳ thi!
            """,
            subjectName,
            exam.getScore() != null ? exam.getScore() : 0
        );

        notificationService.createAndSend(
            teacher.getId(),
            title,
            message,
            NotificationType.EXAM_NOTIFICATION,
            "APTECH_EXAM",
            exam.getId()
        );
    }

    private boolean namesAreSimilar(String name1, String name2) {
        if (name1 == null || name2 == null) return false;
        
        // Normalize and compare
        String n1 = normalize(name1).replaceAll("\\s+", "").toLowerCase();
        String n2 = normalize(name2).replaceAll("\\s+", "").toLowerCase();
        
        return n1.equals(n2);
    }

    private String normalize(String text) {
        // Remove accents (already imported Normalizer at top)
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD);
        return normalized.replaceAll("\\p{M}", "");
    }

    @Override
    public File downloadCertificate(String examId) {
        AptechExam exam = examRepo.findById(examId).orElseThrow();
        if (exam.getCertificateFile() == null)
            throw new IllegalArgumentException("Certificate not found");
        return exam.getCertificateFile();
    }

    // =========================
    // Retake
    // =========================
    @Override
    public boolean canRetakeExam(String teacherId, String subjectId) {
        User teacher = userRepo.findById(teacherId).orElseThrow();
        Subject subject = subjectRepo.findById(subjectId).orElseThrow();
        int attempt = getMaxAttempt(teacher, subject);
        if (attempt == 0) return true;
        Optional<AptechExam> latest = examRepo.findByTeacherAndSubjectAndAttempt(teacher, subject, attempt);
        return latest.map(e -> e.getResult() == ExamResult.FAIL && attempt < MAX_ATTEMPTS).orElse(true);
    }

    @Override
    public String getRetakeCondition(String teacherId, String subjectId) {
        User teacher = userRepo.findById(teacherId).orElseThrow();
        Subject subject = subjectRepo.findById(subjectId).orElseThrow();
        int attempt = getMaxAttempt(teacher, subject);
        if (attempt == 0) return "Có thể thi lần đầu";
        Optional<AptechExam> latest = examRepo.findByTeacherAndSubjectAndAttempt(teacher, subject, attempt);
        if (latest.isPresent() && latest.get().getResult() == ExamResult.FAIL && attempt < MAX_ATTEMPTS)
            return "Có thể thi lại sau lần " + attempt + " thất bại";
        return "Không đủ điều kiện thi lại";
    }

    // =========================
    // Register
    // =========================
    @Override
    public AptechExamDto registerExam(String teacherId, String sessionId, String subjectId) {
        User teacher = userRepo.findById(teacherId).orElseThrow();
        AptechExamSession session = sessionRepo.findById(sessionId).orElseThrow();
        Subject subject = subjectRepo.findById(subjectId).orElseThrow();

        int attempt = getMaxAttempt(teacher, subject) + 1;
        if (attempt > MAX_ATTEMPTS) throw new IllegalArgumentException("Exceeded max attempts");

        AptechExam exam = AptechExam.builder()
                .teacher(teacher)
                .session(session)
                .subject(subject)
                .attempt(attempt)
                .score(null)
                .result(null)
                .examDate(session.getExamDate())
                .build();

        examRepo.save(exam);
        return toExamDto(exam);
    }

    private int getMaxAttempt(User teacher, Subject subject) {
        return examRepo.findByTeacher(teacher).stream()
                .filter(e -> e.getSubject().getId().equals(subject.getId()))
                .mapToInt(AptechExam::getAttempt)
                .max()
                .orElse(0);
    }

    // =========================
    // DTO Mapping
    // =========================
    private AptechExamDto toExamDto(AptechExam exam) {
        return AptechExamDto.builder()
                .id(exam.getId())
                .sessionId(exam.getSession().getId())
                .examDate(exam.getExamDate())
                .examTime(exam.getSession().getExamTime())
                .room(exam.getSession().getRoom())
                .teacherId(exam.getTeacher().getId())
                .teacherCode(exam.getTeacher().getUsername())
                .teacherName(exam.getTeacher().getUsername())
                .subjectId(exam.getSubject().getId())
                .subjectCode(exam.getSubject().getSkillCode())
                .subjectName(exam.getSubject().getSubjectName())
                .attempt(exam.getAttempt())
                .score(exam.getScore())
                .result(exam.getResult())
                .aptechStatus(exam.getAptechStatus() != null ? exam.getAptechStatus().name() : null)
                .examProofFileId(exam.getExamProofFile() != null ? exam.getExamProofFile().getId() : null)
                .certificateFileId(exam.getCertificateFile() != null ? exam.getCertificateFile().getId() : null)
                .canRetake(canRetakeExam(exam.getTeacher().getId(), exam.getSubject().getId()))
                .retakeCondition(getRetakeCondition(exam.getTeacher().getId(), exam.getSubject().getId()))
                .build();
    }

    @Override
    @Transactional
    public void updateStatus(String id, String status) {
        AptechExam exam = examRepository.findById(id).orElseThrow(() -> new RuntimeException("Exam not found"));
        try {
            com.example.teacherservice.enums.AptechStatus oldStatus = exam.getAptechStatus();
            com.example.teacherservice.enums.AptechStatus s = com.example.teacherservice.enums.AptechStatus.valueOf(status);
            exam.setAptechStatus(s);
            examRepository.save(exam);
            
            // Gửi thông báo cho giảng viên khi trạng thái thay đổi
            if (oldStatus != s) {
                notifyTeacherAboutStatusUpdate(exam, s);
            }
        } catch (IllegalArgumentException ex) {
            throw new RuntimeException("Invalid status");
        }
    }

    private AptechExamHistoryDto toHistoryDto(AptechExam exam) {
        return AptechExamHistoryDto.builder()
                .id(exam.getId())
                .examDate(exam.getExamDate())
                .examTime(exam.getSession().getExamTime())
                .room(exam.getSession().getRoom())
                .subjectName(exam.getSubject().getSubjectName())
                .attempt(exam.getAttempt())
                .score(exam.getScore())
                .result(exam.getResult())
                .examProofFileId(exam.getExamProofFile() != null ? exam.getExamProofFile().getId() : null)
                .certificateFileId(exam.getCertificateFile() != null ? exam.getCertificateFile().getId() : null)
                .build();
    }

    private AptechExamSessionDto toSessionDto(AptechExamSession session) {
        return AptechExamSessionDto.builder()
                .id(session.getId())
                .examDate(session.getExamDate())
                .examTime(session.getExamTime())
                .room(session.getRoom())
                .note(session.getNote())
                .build();
    }
    @Override
    @Transactional
    public void updateScore(String id, Integer score, String result) {
        AptechExam exam = examRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Exam not found"));

        exam.setScore(score);
        exam.setResult(ExamResult.valueOf(result)); // vì result là Enum

        examRepository.save(exam);
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExamListDocument(String sessionId, String generatedBy) throws IOException {
        ExportContext context = resolveExportContext(sessionId);
        ClassPathResource resource = new ClassPathResource("templates/BM06.35-template.docx");

        if (!resource.exists()) {
            throw new IOException("Không tìm thấy file template BM06.35-template.docx trong thư mục resources/templates. Vui lòng kiểm tra file template có tồn tại và hợp lệ.");
        }

        try (InputStream is = resource.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            applyListDocumentMetadata(document, context.getSession());

            XWPFTable table = findTableByHeader(document.getTables(), "HỌ TÊN GV");
            if (table != null) {
                fillExamListTable(table, context.getExams());
            }

            String signature = safeSignature(generatedBy);
            replaceTextEverywhere(document, "Lê Thị Minh Loan", signature);
            replaceTextEverywhere(document, "Lê Thị Minh Loan", signature);

            document.write(outputStream);
            return outputStream.toByteArray();
        } catch (java.util.zip.ZipException e) {
            throw new IOException("File template BM06.35-template.docx bị hỏng hoặc không hợp lệ. " +
                    "Vui lòng kiểm tra lại file template. Lỗi chi tiết: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExamSummaryDocument(String sessionId, String generatedBy) throws IOException {
        ExportContext context = resolveExportContext(sessionId);
        ClassPathResource resource = new ClassPathResource("templates/BM06.36-template.docx");

        if (!resource.exists()) {
            throw new IOException("Không tìm thấy file template BM06.36-template.docx trong thư mục resources/templates. Vui lòng kiểm tra file template có tồn tại và hợp lệ.");
        }

        try (InputStream is = resource.getInputStream();
             XWPFDocument document = new XWPFDocument(is);
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            String dateText = formatExamDate(context.getSession());
            if (!dateText.isBlank()) {
                replaceTextEverywhere(document, "04/03/2025", dateText);
            }

            XWPFTable table = findTableByHeader(document.getTables(), "TT");
            if (table != null) {
                fillExamSummaryTable(table, context.getExams());
            }

            String signature = safeSignature(generatedBy);
            replaceTextEverywhere(document, "Lê Thị Minh Loan", signature);
            replaceTextEverywhere(document, "Lê Thị Minh Loan", signature);

            document.write(outputStream);
            return outputStream.toByteArray();
        } catch (java.util.zip.ZipException e) {
            throw new IOException("File template BM06.36-template.docx bị hỏng hoặc không hợp lệ. " +
                    "Vui lòng kiểm tra lại file template. Lỗi chi tiết: " + e.getMessage(), e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public byte[] exportExamStatsDocument(String sessionId, String generatedBy) throws IOException {
        ExportContext context = resolveStatsContext(sessionId);
        StatsReport report = buildStatsReport(context.getExams());

        try (XWPFDocument document = new XWPFDocument();
             ByteArrayOutputStream outputStream = new ByteArrayOutputStream()) {

            writeStatsHeader(document, context.getSession(), generatedBy);
            writeStatsOverview(document, report);
            writeSystemStatsTable(document, report.getSystemRows());
            writeTeacherStatsTable(document, report.getTeacherRows());

            document.write(outputStream);
            return outputStream.toByteArray();
        }
    }

    private void applyListDocumentMetadata(XWPFDocument document, AptechExamSession session) {
        String dateText = formatExamDate(session);
        String timeText = formatExamTime(session);
        String roomText = formatExamRoom(session);

        replaceParagraphContaining(document.getParagraphs(), "Ngày thi", "Ngày thi: " + dateText);
        replaceParagraphContaining(document.getParagraphs(), "Giờ thi", "Giờ thi: " + timeText + " – Phòng thi: " + roomText);

        replaceTextEverywhere(document, "04/03/2025", dateText);
        replaceTextEverywhere(document, "09h00", timeText);
        replaceTextEverywhere(document, "Lab02", roomText);
    }

    private void writeStatsHeader(XWPFDocument document, AptechExamSession session, String generatedBy) {
        XWPFParagraph title = document.createParagraph();
        title.setAlignment(ParagraphAlignment.CENTER);
        title.setSpacingAfter(200);
        XWPFRun titleRun = title.createRun();
        titleRun.setBold(true);
        titleRun.setFontSize(16);
        titleRun.setText("THỐNG KÊ GIÁO VIÊN THI CHỨNG NHẬN APTECH");

        LocalDate today = LocalDate.now();
        appendMetaLine(document, "Ngày tạo báo cáo: " + today.format(DATE_FORMATTER));

        if (session != null) {
            appendMetaLine(document, String.format("Đợt thi: %s | Giờ: %s | Phòng: %s",
                    formatExamDate(session),
                    formatExamTime(session),
                    formatExamRoom(session)));
        } else {
            appendMetaLine(document, "Phạm vi dữ liệu: Toàn bộ kỳ thi đã lưu trong hệ thống");
        }

        if (generatedBy != null && !generatedBy.isBlank()) {
            appendMetaLine(document, "Người lập biểu: " + generatedBy.trim());
        }
    }

    private void appendMetaLine(XWPFDocument document, String text) {
        XWPFParagraph paragraph = document.createParagraph();
        paragraph.setSpacingAfter(120);
        XWPFRun run = paragraph.createRun();
        run.setFontSize(11);
        run.setText(text != null ? text : "");
    }

    private void writeStatsOverview(XWPFDocument document, StatsReport report) {
        XWPFParagraph overview = document.createParagraph();
        overview.setSpacingAfter(200);
        XWPFRun overviewRun = overview.createRun();
        overviewRun.setFontSize(11);
        overviewRun.setText(String.format(
                "Tổng số lần thi: %d | PASS: %d | FAIL: %d | Tỷ lệ đạt: %s%% | Số giảng viên tham gia: %d",
                report.getTotalExams(),
                report.getPassCount(),
                report.getFailCount(),
                formatPercentage(report.getPassCount(), report.getTotalExams()),
                report.getUniqueTeacherCount()));
    }

    private void writeSystemStatsTable(XWPFDocument document, List<SystemStatsRow> rows) {
        XWPFParagraph heading = document.createParagraph();
        heading.setSpacingBefore(200);
        heading.setSpacingAfter(120);
        XWPFRun headingRun = heading.createRun();
        headingRun.setBold(true);
        headingRun.setText("1. Thống kê theo hệ thống môn học");

        if (rows == null || rows.isEmpty()) {
            appendMetaLine(document, "Chưa có dữ liệu kỳ thi để thống kê.");
            return;
        }

        XWPFTable table = document.createTable(rows.size() + 1, 7);
        String[] headers = {"STT", "Hệ thống", "GV tham gia", "Tổng lần thi", "PASS", "FAIL", "Tỷ lệ PASS (%)"};
        for (int i = 0; i < headers.length; i++) {
            setPlainCellText(table.getRow(0).getCell(i), headers[i], true, ParagraphAlignment.CENTER);
        }

        int rowIndex = 1;
        for (SystemStatsRow row : rows) {
            XWPFTableRow tableRow = table.getRow(rowIndex);
            setPlainCellText(tableRow.getCell(0), String.valueOf(rowIndex), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(1), row.getLabel(), false, ParagraphAlignment.LEFT);
            setPlainCellText(tableRow.getCell(2), String.valueOf(row.getTeacherCount()), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(3), String.valueOf(row.getTotalExams()), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(4), String.valueOf(row.getPassCount()), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(5), String.valueOf(row.getFailCount()), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(6),
                    formatPercentage(row.getPassCount(), row.getTotalExams()),
                    false,
                    ParagraphAlignment.CENTER);
            rowIndex++;
        }
    }

    private void writeTeacherStatsTable(XWPFDocument document, List<TeacherStatsRow> rows) {
        XWPFParagraph heading = document.createParagraph();
        heading.setSpacingBefore(200);
        heading.setSpacingAfter(120);
        XWPFRun headingRun = heading.createRun();
        headingRun.setBold(true);
        headingRun.setText("2. Chi tiết theo giảng viên (tối đa 50 người)");

        if (rows == null || rows.isEmpty()) {
            appendMetaLine(document, "Chưa ghi nhận giáo viên tham gia kỳ thi Aptech.");
            return;
        }

        XWPFTable table = document.createTable(rows.size() + 1, 9);
        String[] headers = {"STT", "Mã GV", "Tên giảng viên", "Tổng lần thi", "PASS", "FAIL",
                "Điểm cao nhất", "Lần thi gần nhất", "KQ gần nhất"};
        for (int i = 0; i < headers.length; i++) {
            setPlainCellText(table.getRow(0).getCell(i), headers[i], true, ParagraphAlignment.CENTER);
        }

        int rowIndex = 1;
        for (TeacherStatsRow row : rows) {
            XWPFTableRow tableRow = table.getRow(rowIndex);
            setPlainCellText(tableRow.getCell(0), String.valueOf(rowIndex), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(1), defaultText(row.getTeacherCode()), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(2), defaultText(row.getTeacherName()), false, ParagraphAlignment.LEFT);
            setPlainCellText(tableRow.getCell(3), String.valueOf(row.getTotalExams()), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(4), String.valueOf(row.getPassCount()), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(5), String.valueOf(row.getFailCount()), false, ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(6),
                    row.getHighestScore() != null ? String.valueOf(row.getHighestScore()) : "-",
                    false,
                    ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(7),
                    row.getLatestExamDate() != null ? row.getLatestExamDate().format(DATE_FORMATTER) : "-",
                    false,
                    ParagraphAlignment.CENTER);
            setPlainCellText(tableRow.getCell(8),
                    formatResultLabel(row.getLatestResult()),
                    false,
                    ParagraphAlignment.CENTER);
            rowIndex++;
        }
    }

    private void setPlainCellText(XWPFTableCell cell, String text, boolean bold, ParagraphAlignment alignment) {
        if (cell == null) return;

        for (int i = cell.getParagraphs().size() - 1; i >= 0; i--) {
            cell.removeParagraph(i);
        }

        XWPFParagraph paragraph = cell.addParagraph();
        paragraph.setAlignment(alignment);
        paragraph.setSpacingAfter(0);

        XWPFRun run = paragraph.createRun();
        run.setFontFamily("Times New Roman");   // Font cố định
        run.setFontSize(10);                    // Size 10 cho tất cả cell dữ liệu / header
        run.setBold(bold);
        run.setText(text != null ? text : "");

        centerCellVertically(cell);
    }


    private String formatPercentage(long numerator, long denominator) {
        if (denominator <= 0) {
            return "0.0";
        }
        double rate = (double) numerator * 100d / denominator;
        return String.format(Locale.US, "%.1f", rate);
    }

    private void populateTableWithSystemGroups(XWPFTable table,
                                               List<AptechExam> exams,
                                               RowPopulator populator) {
        if (table == null || table.getRows().isEmpty()) return;

        TableTemplates templates = prepareTableTemplates(table);
        if (templates == null) return;

        Map<String, List<AptechExam>> grouped = splitExamsBySystem(exams);
        if (grouped.isEmpty()) return;

        List<String> systemOrder = getSortedSystemKeys(grouped);
        int counter = 1;

        for (String systemName : systemOrder) {
            XWPFTableRow sectionRow = appendRowFromTemplate(table, templates.sectionRowTemplate);
            ensureRowHasCells(sectionRow, templates.sectionCellCount);
            applyRowStyles(sectionRow, templates.sectionCellStyles);
            setRowHeight(sectionRow, SECTION_ROW_HEIGHT);      // <<< thêm dòng này
            writeSectionLabel(sectionRow, systemName);

            List<AptechExam> systemItems = grouped.get(systemName);
            if (systemItems == null || systemItems.isEmpty()) continue;

            for (AptechExam exam : systemItems) {
                XWPFTableRow dataRow = appendRowFromTemplate(table, templates.dataRowTemplate);
                ensureRowHasCells(dataRow, templates.dataCellCount);
                applyRowStyles(dataRow, templates.dataCellStyles);
                setRowHeight(dataRow, DATA_ROW_HEIGHT);        // <<< và dòng này
                populator.populate(dataRow, exam, String.valueOf(counter++));
            }
        }
    }

    private void centerCellVertically(XWPFTableCell cell) {
        if (cell == null) return;
        cell.setVerticalAlignment(XWPFTableCell.XWPFVertAlign.CENTER);
    }

    private TableTemplates prepareTableTemplates(XWPFTable table) {
        if (table == null || table.getRows().isEmpty()) return null;

        XWPFTableRow sectionSample = table.getRows().size() > 1 ? table.getRow(1) : null;
        XWPFTableRow dataSample = table.getRows().size() > 2 ? table.getRow(2) : null;

        CTRow sectionTemplate = sectionSample != null ? (CTRow) sectionSample.getCtRow().copy() : null;
        CTRow dataTemplate = dataSample != null ? (CTRow) dataSample.getCtRow().copy() : null;
        int sectionCellCount = sectionSample != null
                ? sectionSample.getTableCells().size()
                : 1;
        int dataCellCount = dataSample != null
                ? dataSample.getTableCells().size()
                : table.getRow(0).getTableCells().size();
        List<RunStyle> sectionStyles = extractCellRunStyles(sectionSample);
        List<RunStyle> dataStyles = extractCellRunStyles(dataSample);

        for (int i = table.getRows().size() - 1; i >= 1; i--) {
            table.removeRow(i);
        }

        return new TableTemplates(sectionTemplate, dataTemplate, sectionCellCount, dataCellCount, sectionStyles, dataStyles);
    }

    private XWPFTableRow appendRowFromTemplate(XWPFTable table, CTRow templateInfo) {
        int index = table.getNumberOfRows();
        XWPFTableRow row = table.insertNewTableRow(index);
        if (templateInfo != null) {
            row.getCtRow().set(templateInfo.copy());
            row = table.getRow(index);
        }
        return row;
    }

    private void writeSectionLabel(XWPFTableRow row, String systemName) {
        if (row == null) return;
        ensureRowHasCells(row, 1);

        String label = systemName != null && !systemName.isBlank() ? systemName : DEFAULT_SECTION_LABEL;

        XWPFTableCell firstCell = row.getCell(0);
        // Điền text nhưng vẫn giữ border/căn lề
        updateCellTextPreservingStyle(firstCell, label);
        // Ép style cho dòng SystemName: Times New Roman size 11
        applySectionHeaderStyle(firstCell);

        // Xóa nội dung các cell còn lại (nếu có) nhưng không xóa paragraph để giữ border
        for (int i = 1; i < row.getTableCells().size(); i++) {
            clearCellTextPreservingStyle(row.getCell(i));
        }
    }

    private void applySectionHeaderStyle(XWPFTableCell cell) {
        if (cell == null) return;
        for (XWPFParagraph p : cell.getParagraphs()) {
            for (XWPFRun r : p.getRuns()) {
                r.setFontFamily("Times New Roman");
                r.setFontSize(11);
                r.setBold(true);
            }
            p.setSpacingBefore(0);
            p.setSpacingAfter(0);
        }
        centerCellVertically(cell);
    }


    private static class TableTemplates {
        private final CTRow sectionRowTemplate;
        private final CTRow dataRowTemplate;
        private final int sectionCellCount;
        private final int dataCellCount;
        private final List<RunStyle> sectionCellStyles;
        private final List<RunStyle> dataCellStyles;

        private TableTemplates(CTRow sectionRowTemplate,
                               CTRow dataRowTemplate,
                               int sectionCellCount,
                               int dataCellCount,
                               List<RunStyle> sectionCellStyles,
                               List<RunStyle> dataCellStyles) {
            this.sectionRowTemplate = sectionRowTemplate;
            this.dataRowTemplate = dataRowTemplate;
            this.sectionCellCount = sectionCellCount;
            this.dataCellCount = dataCellCount;
            this.sectionCellStyles = sectionCellStyles;
            this.dataCellStyles = dataCellStyles;
        }
    }

    // Thay thế nội dung text nhưng giữ nguyên định dạng gốc của file Word
    private void updateCellTextPreservingStyle(XWPFTableCell cell, String newText) {
        if (cell == null || newText == null) return;

        // Nếu ô không có đoạn văn nào, tạo mới (trường hợp hiếm)
        if (cell.getParagraphs().isEmpty()) {
            cell.addParagraph().createRun().setText(newText);
            return;
        }

        // Lấy đoạn văn đầu tiên
        XWPFParagraph p = cell.getParagraphs().get(0);
        List<XWPFRun> runs = p.getRuns();

        if (runs != null && !runs.isEmpty()) {
            runs.get(0).setText(newText, 0);
            for (int i = runs.size() - 1; i > 0; i--) {
                p.removeRun(i);
            }
        } else {
            p.createRun().setText(newText);
        }
    }

    private void clearCellTextPreservingStyle(XWPFTableCell cell) {
        if (cell == null) return;
        for (XWPFParagraph p : cell.getParagraphs()) {
            for (XWPFRun r : p.getRuns()) {
                r.setText("", 0);
            }
        }
    }

    private List<RunStyle> extractCellRunStyles(XWPFTableRow row) {
        if (row == null) return Collections.emptyList();
        List<RunStyle> styles = new ArrayList<>();
        for (XWPFTableCell cell : row.getTableCells()) {
            styles.add(extractPrimaryRunStyle(cell));
        }
        return styles;
    }

    private RunStyle extractPrimaryRunStyle(XWPFTableCell cell) {
        if (cell == null) return null;
        for (XWPFParagraph paragraph : cell.getParagraphs()) {
            if (!paragraph.getRuns().isEmpty()) {
                return RunStyle.from(paragraph.getRuns().get(0));
            }
        }
        return null;
    }

    private void applyRowStyles(XWPFTableRow row, List<RunStyle> cellStyles) {
        if (row == null || cellStyles == null || cellStyles.isEmpty()) return;
        List<XWPFTableCell> cells = row.getTableCells();
        int max = Math.min(cells.size(), cellStyles.size());
        for (int i = 0; i < max; i++) {
            RunStyle style = cellStyles.get(i);
            if (style == null) continue;
            applyStyleToCell(cells.get(i), style);
        }
    }

    private void applyStyleToCell(XWPFTableCell cell, RunStyle style) {
        if (cell == null || style == null) return;
        if (cell.getParagraphs().isEmpty()) {
            cell.addParagraph();
        }
        XWPFParagraph paragraph = cell.getParagraphs().get(0);
        XWPFRun run;
        if (paragraph.getRuns().isEmpty()) {
            run = paragraph.createRun();
        } else {
            run = paragraph.getRuns().get(0);
            for (int i = paragraph.getRuns().size() - 1; i > 0; i--) {
                paragraph.removeRun(i);
            }
        }
        style.applyTo(run);
    }

    private void fillExamListTable(XWPFTable table, List<AptechExam> exams) {
        populateTableWithSystemGroups(table, exams, (row, exam, stt) ->
                fillListRow(row, stt, safeTeacherName(exam), formatSubjectDisplay(exam)));
    }

    private void fillExamSummaryTable(XWPFTable table, List<AptechExam> exams) {
        populateTableWithSystemGroups(table, exams, (row, exam, stt) ->
                fillSummaryRow(row, stt, safeTeacherName(exam),
                        formatSubjectDisplay(exam), formatScore(exam), formatResult(exam)));
    }

    private String safeSystemDisplay(SubjectSystem system) {
        if (system == null) return DEFAULT_SECTION_LABEL;
        String name = system.getSystemName();
        if (name != null && !name.isBlank()) {
            return name.trim();
        }
        String code = system.getSystemCode();
        if (code != null && !code.isBlank()) {
            return code.trim();
        }
        return DEFAULT_SECTION_LABEL;
    }

    private List<String> getSortedSystemKeys(Map<String, List<AptechExam>> grouped) {
        List<String> keys = new ArrayList<>(grouped.keySet());
        keys.sort((k1, k2) -> {
            int weight1 = systemWeight(k1);
            int weight2 = systemWeight(k2);
            if (weight1 != weight2) {
                return Integer.compare(weight1, weight2);
            }
            return k1.compareToIgnoreCase(k2);
        });
        return keys;
    }

    private int systemWeight(String label) {
        String normalized = label != null ? label.trim().toUpperCase(Locale.ROOT) : "";
        if (normalized.contains("APTECH")) return 0;
        if (normalized.contains("ARENA")) return 1;
        return 2;
    }

    // Cập nhật lại fillListRow
    private void fillListRow(XWPFTableRow row, String stt, String teacher, String subject) {
        ensureRowHasCells(row, 4);
        // Dùng hàm bảo toàn style thay vì setCellTextWithStyle cũ
        setTextForDataCell(row.getCell(0), stt);
        setTextForDataCell(row.getCell(1), teacher);
        setTextForDataCell(row.getCell(2), subject);
        setTextForDataCell(row.getCell(3), "");
    }

    // Cập nhật lại fillSummaryRow
    private void fillSummaryRow(XWPFTableRow row, String stt, String teacher, String subject, String score, String result) {
        ensureRowHasCells(row, 5);
        setTextForDataCell(row.getCell(0), stt);
        setTextForDataCell(row.getCell(1), teacher);
        setTextForDataCell(row.getCell(2), subject);
        setTextForDataCell(row.getCell(3), score);
        setTextForDataCell(row.getCell(4), result);
    }

    // Hàm helper để set text cho dòng dữ liệu thường
    private void setTextForDataCell(XWPFTableCell cell, String text) {
        if (cell == null) return;

        if (cell.getParagraphs().isEmpty()) {
            cell.addParagraph();
        }
        XWPFParagraph p = cell.getParagraphs().get(0);

        XWPFRun r;
        if (p.getRuns().isEmpty()) {
            r = p.createRun();
        } else {
            r = p.getRuns().get(0);
            // Xóa các run thừa nếu có
            for (int i = p.getRuns().size() - 1; i > 0; i--) {
                p.removeRun(i);
            }
        }

        // Luôn ép font Times New Roman size 10 cho dòng data
        r.setFontFamily("Times New Roman");
        r.setFontSize(10);
        r.setText(text != null ? text : "", 0);

        centerCellVertically(cell);
    }

    private String normalizeSystemKey(String label) {
        String normalized = normalizeMarker(label);
        return normalized != null ? normalized : DEFAULT_SECTION_LABEL;
    }

    private String normalizeMarker(String value) {
        return value != null && !value.isBlank()
                ? value.trim().toUpperCase(Locale.ROOT)
                : null;
    }

    private String normalizeText(String value) {
        if (value == null) return "";
        String normalized = Normalizer.normalize(value, Normalizer.Form.NFD);
        String withoutDiacritics = DIACRITICS_PATTERN.matcher(normalized).replaceAll("");
        String collapsedSpaces = withoutDiacritics.replaceAll("\\s+", " ").trim();
        return collapsedSpaces.toUpperCase(Locale.ROOT);
    }

    private boolean looksLikeExamListRow(String normalizedRow) {
        if (normalizedRow == null || normalizedRow.isBlank()) return false;
        return normalizedRow.contains("APTECH")
                || normalizedRow.contains("ARENA")
                || normalizedRow.contains("HO TEN GV")
                || normalizedRow.contains("MON THI")
                || normalizedRow.contains("MA N THI")
                || normalizedRow.contains("KY TEN")
                || normalizedRow.contains("STT")
                || normalizedRow.contains("TT");
    }

    private void ensureRowHasCells(XWPFTableRow row, int expectedCellCount) {
        if (row == null) return;
        int current = row.getTableCells().size();
        for (int i = current; i < expectedCellCount; i++) {
            row.createCell();
        }
    }

    private void replaceTextEverywhere(XWPFDocument document, String target, String replacement) {
        if (target == null || replacement == null) return;
        for (XWPFParagraph paragraph : document.getParagraphs()) {
            replaceInParagraph(paragraph, target, replacement);
        }
        for (XWPFTable table : document.getTables()) {
            for (XWPFTableRow row : table.getRows()) {
                for (XWPFTableCell cell : row.getTableCells()) {
                    for (XWPFParagraph paragraph : cell.getParagraphs()) {
                        replaceInParagraph(paragraph, target, replacement);
                    }
                }
            }
        }
    }

    private void replaceInParagraph(XWPFParagraph paragraph, String target, String replacement) {
        if (paragraph == null) return;
        String text = paragraph.getText();
        if (text == null || !text.contains(target)) {
            return;
        }
        XWPFRun templateRun;
        if (paragraph.getRuns().isEmpty()) {
            templateRun = paragraph.createRun();
        } else {
            templateRun = paragraph.getRuns().get(0);
        }
        RunStyle style = RunStyle.from(templateRun);
        for (int i = paragraph.getRuns().size() - 1; i >= 0; i--) {
            paragraph.removeRun(i);
        }
        XWPFRun newRun = paragraph.createRun();
        style.applyTo(newRun);
        newRun.setText(text.replace(target, replacement), 0);
    }

    private void replaceParagraphContaining(List<XWPFParagraph> paragraphs, String keyword, String newText) {
        if (keyword == null) return;
        for (XWPFParagraph paragraph : paragraphs) {
            String text = paragraph.getText();
            if (text != null && text.contains(keyword)) {
                overwriteParagraph(paragraph, newText);
                break;
            }
        }
    }

    private void overwriteParagraph(XWPFParagraph paragraph, String newText) {
        if (paragraph == null) return;
        XWPFRun templateRun;
        if (paragraph.getRuns().isEmpty()) {
            templateRun = paragraph.createRun();
        } else {
            templateRun = paragraph.getRuns().get(0);
        }
        RunStyle style = RunStyle.from(templateRun);
        for (int i = paragraph.getRuns().size() - 1; i >= 0; i--) {
            paragraph.removeRun(i);
        }
        XWPFRun newRun = paragraph.createRun();
        style.applyTo(newRun);
        newRun.setText(newText != null ? newText : "", 0);
    }

    private static class RunStyle {
        private final Boolean bold;
        private final Boolean italic;
        private final UnderlinePatterns underline;
        private final Double fontSize;
        private final String fontFamily;
        private final String color;
        private final Integer textPosition;

        private RunStyle(Boolean bold, Boolean italic, UnderlinePatterns underline, Double fontSize,
                         String fontFamily, String color, Integer textPosition) {
            this.bold = bold;
            this.italic = italic;
            this.underline = underline;
            this.fontSize = fontSize;
            this.fontFamily = fontFamily;
            this.color = color;
            this.textPosition = textPosition;
        }

        static RunStyle from(XWPFRun run) {
            if (run == null) {
                return new RunStyle(null, null, null, null, null, null, null);
            }
            Double fontSize = run.getFontSizeAsDouble();
            Integer position = run.getTextPosition() != 0 ? run.getTextPosition() : null;
            return new RunStyle(
                    run.isBold(),
                    run.isItalic(),
                    run.getUnderline(),
                    fontSize,
                    run.getFontFamily(),
                    run.getColor(),
                    position
            );
        }

        void applyTo(XWPFRun target) {
            if (target == null) return;
            if (bold != null) target.setBold(bold);
            if (italic != null) target.setItalic(italic);
            if (underline != null) target.setUnderline(underline);
            if (fontSize != null && fontSize > 0) target.setFontSize(fontSize);
            if (fontFamily != null) target.setFontFamily(fontFamily);
            if (color != null) target.setColor(color);
            if (textPosition != null) target.setTextPosition(textPosition);
        }
    }

    @FunctionalInterface
    private interface RowPopulator {
        void populate(XWPFTableRow row, AptechExam exam, String counter);
    }

    private ExportContext resolveExportContext(String sessionId) {
        AptechExamSession session = null;
        List<AptechExam> exams = new ArrayList<>();

        String normalizedSessionId = sessionId != null ? sessionId.trim() : null;

        if (normalizedSessionId != null && !normalizedSessionId.isBlank()) {
            session = sessionRepo.findById(normalizedSessionId).orElse(null);
            if (session != null) {
            exams = examRepo.findBySession(session);
            }
        }

        if (session == null) {
            Optional<AptechExamSession> latestSession = sessionRepo.findAll(Sort.by(Sort.Direction.DESC, "examDate"))
                    .stream()
                    .findFirst();
            if (latestSession.isPresent()) {
                session = latestSession.get();
                exams = examRepo.findBySession(session);
            } else {
                exams = examRepo.findAll();
                if (!exams.isEmpty()) {
                    session = exams.get(0).getSession();
                    exams = examRepo.findBySession(session);
                }
            }
        }

        return new ExportContext(session, exams);
    }

    private ExportContext resolveStatsContext(String sessionId) {
        AptechExamSession session = null;
        List<AptechExam> exams;

        String normalizedSessionId = sessionId != null ? sessionId.trim() : null;
        if (normalizedSessionId != null && !normalizedSessionId.isBlank()) {
            session = sessionRepo.findById(normalizedSessionId)
                    .orElseThrow(() -> new IllegalArgumentException("Đợt thi không tồn tại"));
            exams = examRepo.findBySession(session);
        } else {
            exams = examRepo.findAll();
        }

        return new ExportContext(session, exams);
    }

    private StatsReport buildStatsReport(List<AptechExam> exams) {
        List<AptechExam> safeExams = exams != null ? exams : Collections.emptyList();
        Map<String, SystemStatsAccumulator> systemMap = new HashMap<>();
        Map<String, TeacherStatsAccumulator> teacherMap = new HashMap<>();
        long passCount = 0;
        long failCount = 0;
        Set<String> teacherIds = new HashSet<>();

        for (AptechExam exam : safeExams) {
            if (exam == null) continue;
            if (exam.getResult() == ExamResult.PASS) passCount++;
            if (exam.getResult() == ExamResult.FAIL) failCount++;
            if (exam.getTeacher() != null && exam.getTeacher().getId() != null) {
                teacherIds.add(exam.getTeacher().getId());
            }

            SystemStatsAccumulator systemAccumulator = resolveSystemAccumulator(systemMap, exam);
            systemAccumulator.accept(exam);

            if (exam.getTeacher() != null) {
                TeacherStatsAccumulator teacherAccumulator = teacherMap.computeIfAbsent(
                        exam.getTeacher().getId(),
                        id -> new TeacherStatsAccumulator(
                                id,
                                exam.getTeacher().getUsername(),
                                exam.getTeacher().getUsername()));
                teacherAccumulator.accept(exam);
            }
        }

        List<SystemStatsRow> systemRows = systemMap.values().stream()
                .map(SystemStatsAccumulator::toRow)
                .sorted((a, b) -> {
                    int compareWeight = Integer.compare(systemWeight(a.getLabel()), systemWeight(b.getLabel()));
                    if (compareWeight != 0) return compareWeight;
                    return a.getLabel().compareToIgnoreCase(b.getLabel());
                })
                .collect(Collectors.toList());

        List<TeacherStatsRow> teacherRows = teacherMap.values().stream()
                .map(TeacherStatsAccumulator::toRow)
                .sorted(Comparator
                        .comparing(TeacherStatsRow::getPassCount, Comparator.reverseOrder())
                        .thenComparing(TeacherStatsRow::getFailCount)
                        .thenComparing(row -> defaultText(row.getTeacherName()), String.CASE_INSENSITIVE_ORDER))
                .limit(50)
                .collect(Collectors.toList());

        return new StatsReport(
                safeExams.size(),
                passCount,
                failCount,
                teacherIds.size(),
                systemRows,
                teacherRows);
    }

    private SystemStatsAccumulator resolveSystemAccumulator(Map<String, SystemStatsAccumulator> systemMap, AptechExam exam) {
        String label = exam != null && exam.getSubject() != null
                ? safeSystemDisplay(exam.getSubject().getSystem())
                : DEFAULT_SECTION_LABEL;
        String key = normalizeSystemKey(label);
        return systemMap.computeIfAbsent(key, k -> new SystemStatsAccumulator(label));
    }


    private Map<String, List<AptechExam>> splitExamsBySystem(List<AptechExam> exams) {
        Map<String, List<AptechExam>> grouped = new HashMap<>();
        if (exams != null) {
            for (AptechExam exam : exams) {
                SubjectSystem system = exam != null && exam.getSubject() != null
                        ? exam.getSubject().getSystem()
                        : null;
                String key = normalizeSystemKey(system != null ? safeSystemDisplay(system) : DEFAULT_SECTION_LABEL);
                grouped.computeIfAbsent(key, k -> new ArrayList<>()).add(exam);
            }
        }

        Comparator<AptechExam> comparator = Comparator
                .comparing(this::safeTeacherName, String.CASE_INSENSITIVE_ORDER)
                .thenComparing(this::safeSubjectName, String.CASE_INSENSITIVE_ORDER);
        grouped.values().forEach(list -> list.sort(comparator));
        return grouped;
    }

    private String safeTeacherName(AptechExam exam) {
        if (exam == null || exam.getTeacher() == null) return "";
        return resolveTeacherFullName(exam.getTeacher());
    }

    private String resolveTeacherFullName(User teacher) {
        if (teacher == null) return "";
        String username = teacher.getUsername();
        return username != null ? username.trim() : "";
    }

    private String safeSubjectName(AptechExam exam) {
        return exam != null && exam.getSubject() != null && exam.getSubject().getSubjectName() != null
                ? exam.getSubject().getSubjectName()
                : "";
    }

    private String formatSubjectDisplay(AptechExam exam) {
        if (exam == null || exam.getSubject() == null) return "";
        String code = exam.getSubject().getSkillCode();
        String name = exam.getSubject().getSubjectName();
        if (code != null && !code.isBlank()) {
            return code + (name != null && !name.isBlank() ? "-" + name : "");
        }
        return name != null ? name : "";
    }

    private String formatScore(AptechExam exam) {
        return exam != null && exam.getScore() != null ? String.valueOf(exam.getScore()) : "";
    }

    private String formatResult(AptechExam exam) {
        if (exam == null || exam.getResult() == null) return "";
        return exam.getResult() == ExamResult.PASS ? "ĐẠT" : "KHÔNG ĐẠT";
    }

    private String formatResultLabel(ExamResult result) {
        if (result == null) return "-";
        return result == ExamResult.PASS ? "ĐẠT" : "KHÔNG ĐẠT";
    }

    private XWPFTable findTableByHeader(List<XWPFTable> tables, String headerKeyword) {
        if (tables == null || tables.isEmpty()) return null;
        String keyword = normalizeText(headerKeyword);
        XWPFTable fallback = null;

        for (XWPFTable table : tables) {
            for (XWPFTableRow row : table.getRows()) {
                String text = getRowText(row);
                if (text.isBlank()) {
                    continue;
                }

                String normalizedRow = normalizeText(text);
                if (!keyword.isBlank() && normalizedRow.contains(keyword)) {
                    return table;
                }
                if (fallback == null && looksLikeExamListRow(normalizedRow)) {
                    fallback = table;
                }
            }
        }
        return fallback;
    }

    private String formatExamDate(AptechExamSession session) {
        return session != null && session.getExamDate() != null
                ? session.getExamDate().format(DATE_FORMATTER)
                : "........";
    }

    private String formatExamTime(AptechExamSession session) {
        return session != null && session.getExamTime() != null
                ? session.getExamTime().format(TIME_FORMATTER)
                : "........";
    }

    private String formatExamRoom(AptechExamSession session) {
        return session != null && session.getRoom() != null && !session.getRoom().isBlank()
                ? session.getRoom()
                : "........";
    }

    private String safeSignature(String generatedBy) {
        return generatedBy != null && !generatedBy.isBlank() ? generatedBy : DEFAULT_SIGNATURE;
    }

    private String defaultText(String value) {
        return value != null && !value.isBlank() ? value.trim() : "-";
    }

    private String getRowText(XWPFTableRow row) {
        if (row == null) return "";
        StringBuilder builder = new StringBuilder();
        for (XWPFTableCell cell : row.getTableCells()) {
            String cellText = cell.getText();
            if (cellText != null && !cellText.isBlank()) {
                if (!builder.isEmpty()) builder.append(' ');
                builder.append(cellText.trim());
            }
        }
        return builder.toString();
    }

    private static class ExportContext {
        private final AptechExamSession session;
        private final List<AptechExam> exams;

        ExportContext(AptechExamSession session, List<AptechExam> exams) {
            this.session = session;
            this.exams = exams != null ? exams : Collections.emptyList();
        }

        public AptechExamSession getSession() {
            return session;
        }

        public List<AptechExam> getExams() {
            return exams;
        }
    }

    private static class StatsReport {
        private final int totalExams;
        private final long passCount;
        private final long failCount;
        private final int uniqueTeacherCount;
        private final List<SystemStatsRow> systemRows;
        private final List<TeacherStatsRow> teacherRows;

        StatsReport(int totalExams,
                    long passCount,
                    long failCount,
                    int uniqueTeacherCount,
                    List<SystemStatsRow> systemRows,
                    List<TeacherStatsRow> teacherRows) {
            this.totalExams = totalExams;
            this.passCount = passCount;
            this.failCount = failCount;
            this.uniqueTeacherCount = uniqueTeacherCount;
            this.systemRows = systemRows != null ? systemRows : Collections.emptyList();
            this.teacherRows = teacherRows != null ? teacherRows : Collections.emptyList();
        }

        public int getTotalExams() {
            return totalExams;
        }

        public long getPassCount() {
            return passCount;
        }

        public long getFailCount() {
            return failCount;
        }

        public int getUniqueTeacherCount() {
            return uniqueTeacherCount;
        }

        public List<SystemStatsRow> getSystemRows() {
            return systemRows;
        }

        public List<TeacherStatsRow> getTeacherRows() {
            return teacherRows;
        }
    }

    private static class SystemStatsRow {
        private final String label;
        private final long teacherCount;
        private final long totalExams;
        private final long passCount;
        private final long failCount;

        private SystemStatsRow(String label, long teacherCount, long totalExams, long passCount, long failCount) {
            this.label = label;
            this.teacherCount = teacherCount;
            this.totalExams = totalExams;
            this.passCount = passCount;
            this.failCount = failCount;
        }

        public String getLabel() {
            return label;
        }

        public long getTeacherCount() {
            return teacherCount;
        }

        public long getTotalExams() {
            return totalExams;
        }

        public long getPassCount() {
            return passCount;
        }

        public long getFailCount() {
            return failCount;
        }
    }

    private static class TeacherStatsRow {
        private final String teacherCode;
        private final String teacherName;
        private final long totalExams;
        private final long passCount;
        private final long failCount;
        private final Integer highestScore;
        private final LocalDate latestExamDate;
        private final ExamResult latestResult;

        private TeacherStatsRow(String teacherCode,
                                String teacherName,
                                long totalExams,
                                long passCount,
                                long failCount,
                                Integer highestScore,
                                LocalDate latestExamDate,
                                ExamResult latestResult) {
            this.teacherCode = teacherCode;
            this.teacherName = teacherName;
            this.totalExams = totalExams;
            this.passCount = passCount;
            this.failCount = failCount;
            this.highestScore = highestScore;
            this.latestExamDate = latestExamDate;
            this.latestResult = latestResult;
        }

        public String getTeacherCode() {
            return teacherCode;
        }

        public String getTeacherName() {
            return teacherName;
        }

        public long getTotalExams() {
            return totalExams;
        }

        public long getPassCount() {
            return passCount;
        }

        public long getFailCount() {
            return failCount;
        }

        public Integer getHighestScore() {
            return highestScore;
        }

        public LocalDate getLatestExamDate() {
            return latestExamDate;
        }

        public ExamResult getLatestResult() {
            return latestResult;
        }
    }

    private static class SystemStatsAccumulator {
        private final String label;
        private final Set<String> teacherIds = new HashSet<>();
        private long totalExams;
        private long passCount;
        private long failCount;

        private SystemStatsAccumulator(String label) {
            this.label = label != null ? label : DEFAULT_SECTION_LABEL;
        }

        private void accept(AptechExam exam) {
            totalExams++;
            if (exam != null) {
                if (exam.getResult() == ExamResult.PASS) passCount++;
                if (exam.getResult() == ExamResult.FAIL) failCount++;
                if (exam.getTeacher() != null && exam.getTeacher().getId() != null) {
                    teacherIds.add(exam.getTeacher().getId());
                }
            }
        }

        private SystemStatsRow toRow() {
            return new SystemStatsRow(label, teacherIds.size(), totalExams, passCount, failCount);
        }
    }

    private static class TeacherStatsAccumulator {
        private final String teacherId;
        private final String teacherCode;
        private final String teacherName;
        private long totalExams;
        private long passCount;
        private long failCount;
        private Integer highestScore;
        private LocalDate latestExamDate;
        private ExamResult latestResult;

        private TeacherStatsAccumulator(String teacherId, String teacherCode, String teacherName) {
            this.teacherId = teacherId;
            this.teacherCode = teacherCode;
            this.teacherName = teacherName;
        }

        private void accept(AptechExam exam) {
            totalExams++;
            if (exam.getResult() == ExamResult.PASS) passCount++;
            if (exam.getResult() == ExamResult.FAIL) failCount++;

            Integer score = exam.getScore();
            if (score != null) {
                if (highestScore == null || score > highestScore) {
                    highestScore = score;
                }
            }

            if (exam.getExamDate() != null) {
                if (latestExamDate == null || exam.getExamDate().isAfter(latestExamDate)) {
                    latestExamDate = exam.getExamDate();
                    latestResult = exam.getResult();
                }
            }
        }

        private TeacherStatsRow toRow() {
            return new TeacherStatsRow(
                    teacherCode,
                    teacherName,
                    totalExams,
                    passCount,
                    failCount,
                    highestScore,
                    latestExamDate,
                    latestResult);
        }
    }
}
