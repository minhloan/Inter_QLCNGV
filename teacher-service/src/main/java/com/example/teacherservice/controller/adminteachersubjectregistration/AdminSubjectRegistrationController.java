package com.example.teacherservice.controller.adminteachersubjectregistration;

import com.example.teacherservice.dto.adminteachersubjectregistration.AdminSubjectRegistrationDto;
import com.example.teacherservice.enums.RegistrationStatus;
import com.example.teacherservice.service.adminteachersubjectregistration.AdminSubjectRegistrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/admin/subject-registrations")
@RequiredArgsConstructor
public class AdminSubjectRegistrationController {

    private final AdminSubjectRegistrationService adminService;

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
}
