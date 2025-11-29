package com.example.teacherservice.controller.adminteachersubjectregistration;

import com.example.teacherservice.dto.adminteachersubjectregistration.AdminSubjectRegistrationDto;
import com.example.teacherservice.dto.adminteachersubjectregistration.ImportResultDto;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.service.adminteachersubjectregistration.AdminSubjectRegistrationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/admin/subject-registrations")
@RequiredArgsConstructor
public class AdminSubjectRegistrationController {

    private final AdminSubjectRegistrationService adminService;
    private final JwtUtil jwtUtil;

    // ==============================================
    // GET ALL REGISTRATIONS
    // ==============================================
    @GetMapping("/getAll")
    public List<AdminSubjectRegistrationDto> getAll() {
        return adminService.getAll();
    }

    // ==============================================
    // UPDATE STATUS: approve, reject
    // ==============================================
    @PutMapping("/update-status/{id}")
    public AdminSubjectRegistrationDto updateStatus(
            @PathVariable String id,
            @RequestBody UpdateStatusRequest request
    ) {
        return adminService.updateStatus(id, request.getStatus());
    }

    // Request body class
    public static class UpdateStatusRequest {
        private RegistrationStatus status;

        public RegistrationStatus getStatus() {
            return status;
        }

        public void setStatus(RegistrationStatus status) {
            this.status = status;
        }
    }

    // 👉 MỚI: lấy chi tiết theo id
    @GetMapping("/{id}")
    public AdminSubjectRegistrationDto getById(@PathVariable String id) {
        return adminService.getById(id);
    }

    // EXPORT FILE EXCEL
    @GetMapping("/export")
    public void exportExcel(
            HttpServletResponse response,
            @RequestParam(defaultValue = "ALL") String status,
            @RequestParam(required = false) String teacher
    ) {
        adminService.exportExcel(response, status, teacher);
    }



    // IMPORT FILE EXCEL

    @PostMapping(value = "/import", consumes = "multipart/form-data")
    public ResponseEntity<ImportResultDto> importExcel(
            @RequestParam("file") MultipartFile file
    ) {
        return ResponseEntity.ok(adminService.importExcel(file));
    }
    
    // =================== PLAN EXPORT/IMPORT ===================
    
    @GetMapping("/plan/export")
    public void exportPlan(
            HttpServletResponse response,
            @RequestParam(required = false) String teacherId,
            @RequestParam(required = false) Integer year,
            HttpServletRequest request
    ) {
        String adminId = jwtUtil.ExtractUserId(request);
        adminService.exportPlanExcel(response, adminId, teacherId, year);
    }
    
    @PostMapping("/plan/import")
    public ResponseEntity<?> importPlan(
            @RequestParam String teacherId,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) {
        String adminId = jwtUtil.ExtractUserId(request);
        return ResponseEntity.ok(adminService.importPlanExcel(adminId, teacherId, file));
    }

}

