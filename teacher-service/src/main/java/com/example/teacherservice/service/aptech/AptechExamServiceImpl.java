package com.example.teacherservice.service.aptech;

import com.example.teacherservice.dto.aptech.AptechExamDto;
import com.example.teacherservice.dto.aptech.AptechExamHistoryDto;
import com.example.teacherservice.dto.aptech.AptechExamSessionDto;
import com.example.teacherservice.enums.ExamResult;
import com.example.teacherservice.model.*;
import com.example.teacherservice.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AptechExamServiceImpl implements AptechExamService {

    private final AptechExamRepository examRepo;
    private final AptechExamSessionRepository sessionRepo;
    private final UserRepository userRepo;
    private final SubjectRepository subjectRepo;
    private final FileRepository fileRepo;

    private static final int MAX_ATTEMPTS = 3;
    private static final int PASS_THRESHOLD = 70;

    private final AptechExamRepository examRepository;

    // =========================
    // Sessions
    // =========================
    @Override
    public List<AptechExamSessionDto> getAllSessions() {
        return sessionRepo.findAll().stream()
                .map(this::toSessionDto)
                .collect(Collectors.toList());
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
        if (exam.getResult() != ExamResult.PASS)
            throw new IllegalArgumentException("Certificate only for PASS exams");
        exam.setCertificateFile(certificateFile);
        examRepo.save(exam);
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
                .teacherCode(exam.getTeacher().getTeacherCode())
                .teacherName(exam.getTeacher().getUsername())
                .subjectId(exam.getSubject().getId())
                .subjectName(exam.getSubject().getSubjectName())
                .attempt(exam.getAttempt())
                .score(exam.getScore())
                .result(exam.getResult())
                .aptechStatus(exam.getAptechStatus() != null ? exam.getAptechStatus().name() : null)
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
            com.example.teacherservice.enums.AptechStatus s = com.example.teacherservice.enums.AptechStatus.valueOf(status);
            exam.setAptechStatus(s);
            examRepository.save(exam);
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


}
