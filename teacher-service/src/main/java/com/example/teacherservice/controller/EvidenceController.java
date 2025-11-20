package com.example.teacherservice.controller;

import com.example.teacherservice.dto.evidence.EvidenceDTO;
import com.example.teacherservice.dto.evidence.EvidenceResponseDTO;
import com.example.teacherservice.dto.evidence.UpdateOCRTextDTO;
import com.example.teacherservice.service.evidence.EvidenceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/evidence")
@RequiredArgsConstructor
public class EvidenceController {

    private final EvidenceService evidenceService;

    @PostMapping("/upload")
    public ResponseEntity<EvidenceResponseDTO> uploadEvidence(
            @RequestParam("file") MultipartFile file,
            @RequestParam("teacherId") String teacherId,
            @RequestParam("subjectId") String subjectId,
            @RequestParam(value = "submittedDate", required = false) String submittedDate) {

        EvidenceDTO dto = EvidenceDTO.builder()
                .teacherId(teacherId)
                .subjectId(subjectId)
                .submittedDate(submittedDate)
                .build();

        EvidenceResponseDTO evidence = evidenceService.uploadEvidence(dto, file);
        return ResponseEntity.status(HttpStatus.CREATED).body(evidence);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EvidenceResponseDTO> getEvidenceById(@PathVariable String id) {
        EvidenceResponseDTO evidence = evidenceService.findById(id);
        return ResponseEntity.ok(evidence);
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<List<EvidenceResponseDTO>> getEvidenceByTeacher(
            @PathVariable String teacherId) {
        List<EvidenceResponseDTO> evidences = evidenceService.findByTeacherId(teacherId);
        return ResponseEntity.ok(evidences);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EvidenceResponseDTO>> getEvidenceByStatus(
            @PathVariable String status) {
        List<EvidenceResponseDTO> evidences = evidenceService.findByStatus(status);
        return ResponseEntity.ok(evidences);
    }

    @GetMapping
    public ResponseEntity<List<EvidenceResponseDTO>> getAllEvidence() {
        List<EvidenceResponseDTO> evidences = evidenceService.findAll();
        return ResponseEntity.ok(evidences);
    }

    @PutMapping("/{id}/ocr-text")
    public ResponseEntity<EvidenceResponseDTO> updateOCRText(
            @PathVariable String id,
            @RequestBody UpdateOCRTextDTO dto) {
        EvidenceResponseDTO evidence = evidenceService.updateOCRText(id, dto);
        return ResponseEntity.ok(evidence);
    }

    @PostMapping("/{id}/verify")
    public ResponseEntity<EvidenceResponseDTO> verifyEvidence(
            @PathVariable String id,
            @RequestParam("verifiedById") String verifiedById,
            @RequestParam("approved") boolean approved) {
        EvidenceResponseDTO evidence = evidenceService.verifyEvidence(id, verifiedById, approved);
        return ResponseEntity.ok(evidence);
    }

    @PostMapping("/{id}/reprocess-ocr")
    public ResponseEntity<String> reprocessOCR(@PathVariable String id) {
        evidenceService.processOCRAsync(id);
        return ResponseEntity.ok("OCR reprocessing started");
    }
}