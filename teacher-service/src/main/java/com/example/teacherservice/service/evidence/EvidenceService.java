package com.example.teacherservice.service.evidence;

import com.example.teacherservice.dto.evidence.EvidenceDTO;
import com.example.teacherservice.dto.evidence.EvidenceResponseDTO;
import com.example.teacherservice.dto.evidence.UpdateOCRTextDTO;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

public interface EvidenceService {
    EvidenceResponseDTO uploadEvidence(EvidenceDTO dto, MultipartFile file);
    EvidenceResponseDTO findById(String id);
    List<EvidenceResponseDTO> findByTeacherId(String teacherId);
    List<EvidenceResponseDTO> findByStatus(String status);
    EvidenceResponseDTO updateOCRText(String id, UpdateOCRTextDTO dto);
    EvidenceResponseDTO verifyEvidence(String id, String verifiedById, boolean approved);
    void processOCRAsync(String evidenceId);
    List<EvidenceResponseDTO> findAll();
}
