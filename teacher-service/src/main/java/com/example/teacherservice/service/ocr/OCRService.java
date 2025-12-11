package com.example.teacherservice.service.ocr;

import com.example.teacherservice.dto.evidence.OCRResultDTO;
import com.example.teacherservice.model.File;

public interface OCRService {
    OCRResultDTO processFile(File file);

    // New method to process file using file paths to avoid Hibernate lazy loading issues
    OCRResultDTO processFile(String filePath, String fileName);

    // New method to process image using file paths
    OCRResultDTO processImage(String filePath, String fileName);

    // New method to process PDF using file paths
    OCRResultDTO processPDF(String filePath, String fileName);

    // New method to process Aptech certificate using file paths
    OCRResultDTO processAptechCertificate(String filePath, String fileName);

    OCRResultDTO processImage(File imageFile);

    OCRResultDTO processPDF(File pdfFile);

    OCRResultDTO processAptechCertificate(File imageFile);
}
