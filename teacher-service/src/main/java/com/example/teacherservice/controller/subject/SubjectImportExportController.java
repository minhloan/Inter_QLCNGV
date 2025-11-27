package com.example.teacherservice.controller.subject;

import com.example.teacherservice.service.subject.SubjectImportService;
import com.example.teacherservice.service.subject.SubjectExportService;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/teacher/subject-excel")
@RequiredArgsConstructor
public class SubjectImportExportController {

    private final SubjectImportService importService;
    private final SubjectExportService exportService;

    // SubjectImportExportController.java
    @PostMapping("/import")
    public ResponseEntity<?> importSubjects(@RequestParam("file") MultipartFile file) {
        int imported = importService.importExcel(file);
        return ResponseEntity.ok("Import thành công: " + imported + " môn học");
    }

    @GetMapping("/export")
    public void exportExcel(HttpServletResponse response) {
        exportService.exportExcel(response);
    }

}
