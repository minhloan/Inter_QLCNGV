package com.example.teacherservice.service.ocr;

import com.example.teacherservice.dto.evidence.OCRResultDTO;
import com.example.teacherservice.model.File;

public interface OCRService {
    OCRResultDTO processFile(File file);
    OCRResultDTO processImage(File imageFile);
    OCRResultDTO processPDF(File pdfFile);
    OCRResultDTO processAptechCertificate(File imageFile);
}
