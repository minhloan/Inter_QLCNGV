package com.example.teacherservice.service.aptech;

import com.example.teacherservice.dto.aptech.AptechExamDto;
import com.example.teacherservice.dto.aptech.AptechExamHistoryDto;
import com.example.teacherservice.dto.aptech.AptechExamSessionDto;
import com.example.teacherservice.model.File;

import java.util.List;

public interface AptechExamService {
    List<AptechExamSessionDto> getAllSessions();
    List<AptechExamDto> getAllExams();
    List<AptechExamDto> getExamsByTeacher(String teacherId);
    List<AptechExamHistoryDto> getExamHistory(String teacherId, String subjectId);
    void uploadCertificate(String examId, File certificateFile);
    File downloadCertificate(String examId);
    boolean canRetakeExam(String teacherId, String subjectId);
    String getRetakeCondition(String teacherId, String subjectId);
    AptechExamDto registerExam(String teacherId, String sessionId, String subjectId);
    void updateScore(String id, Integer score, String result);
    void updateStatus(String id, String status);
}
