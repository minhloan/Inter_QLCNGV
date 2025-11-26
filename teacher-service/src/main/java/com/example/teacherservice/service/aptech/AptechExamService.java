package com.example.teacherservice.service.aptech;

import com.example.teacherservice.dto.aptech.AptechExamDto;
import com.example.teacherservice.dto.aptech.AptechExamHistoryDto;
import com.example.teacherservice.dto.aptech.AptechExamSessionDto;
import com.example.teacherservice.dto.aptech.AptechOCRResponseDto;
import com.example.teacherservice.dto.common.PagedResponse;
import com.example.teacherservice.dto.evidence.OCRResultDTO;
import com.example.teacherservice.model.File;

import java.io.IOException;
import java.util.List;

public interface AptechExamService {
    List<AptechExamSessionDto> getAllSessions();
    PagedResponse<AptechExamSessionDto> getUpcomingSessions(int page, int size, String keyword);
    AptechExamSessionDto createSession(AptechExamSessionDto dto, String createdBy);
    List<AptechExamDto> getAllExams();
    List<AptechExamDto> getExamsByTeacher(String teacherId);
    AptechExamDto getExamForTeacher(String examId, String teacherId);
    List<AptechExamHistoryDto> getExamHistory(String teacherId, String subjectId);
    AptechOCRResponseDto uploadExamProofWithOCR(String examId, File proofFile, OCRResultDTO ocrResult);
    void uploadCertificate(String examId, File certificateFile);
    File downloadCertificate(String examId);
    boolean canRetakeExam(String teacherId, String subjectId);
    String getRetakeCondition(String teacherId, String subjectId);
    AptechExamDto registerExam(String teacherId, String sessionId, String subjectId);
    byte[] exportExamListDocument(String sessionId, String generatedBy) throws IOException;
    byte[] exportExamSummaryDocument(String sessionId, String generatedBy) throws IOException;
    byte[] exportExamStatsDocument(String sessionId, String generatedBy) throws IOException;
    void updateScore(String id, Integer score, String result);
    void updateStatus(String id, String status);
}
