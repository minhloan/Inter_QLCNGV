package com.example.teacherservice.controller.teachersubjectregistration;

import com.example.teacherservice.dto.teachersubjectregistration.CarryOverRequest;
import com.example.teacherservice.dto.teachersubjectregistration.ImportPlanResultDto;
import com.example.teacherservice.dto.teachersubjectregistration.SubjectRegistrationsDto;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.request.teachersubjectregistration.SubjectRegistrationFilterRequest;
import com.example.teacherservice.service.teachersubjectregistration.SubjectRegistrationService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Year;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/teacher/subject-registrations")
@RequiredArgsConstructor
public class SubjectRegistrationController {

    private final SubjectRegistrationService subjectRegistrationService;
    private final JwtUtil jwtUtil;

    @GetMapping("/getAll")
    public List<SubjectRegistrationsDto> getAll(HttpServletRequest request) {
        String userId = jwtUtil.ExtractUserId(request);
        List<SubjectRegistration> registrations = subjectRegistrationService.getRegistrationsByTeacherId(userId);

        return registrations.stream()
                .map(r -> subjectRegistrationService.getById(r.getId()))
                .collect(Collectors.toList());
    }

    @PostMapping("/{registrationId}/carry-over")
    public SubjectRegistrationsDto carryOver(
            @PathVariable String registrationId,
            @RequestBody CarryOverRequest request,
            HttpServletRequest http
    ) {
        String teacherId = jwtUtil.ExtractUserId(http);
        return subjectRegistrationService.carryOver(registrationId, request, teacherId);
    }

    @PostMapping("/filter")
    public List<SubjectRegistrationsDto> filter(@RequestBody SubjectRegistrationFilterRequest request) {
        return subjectRegistrationService.getFilteredRegistrations(request);
    }

    @GetMapping("/{id}")
    public SubjectRegistrationsDto getById(@PathVariable String id) {
        return subjectRegistrationService.getById(id);
    }

    @PostMapping("/register")
    public ResponseEntity<SubjectRegistrationsDto> registerSubject(
            @RequestBody SubjectRegistrationsDto dto,
            HttpServletRequest request
    ) {
        String teacherId = jwtUtil.ExtractUserId(request);
        dto.setTeacherId(teacherId);
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectRegistrationService.createRegistration(dto));
    }
// =============== EXPORT KẾ HOẠCH NĂM ===============
// =============== EXPORT KẾ HOẠCH NĂM (TEMPLATE NHƯ ADMIN) ===============

    @GetMapping("/plan/export")
    public void exportTeacherPlan(
            @RequestParam(required = false) Integer year,
            HttpServletRequest request,
            HttpServletResponse response
    ) {
        String teacherId = jwtUtil.ExtractUserId(request);
        int targetYear = (year != null) ? year : Year.now().getValue();

        subjectRegistrationService.exportPlanExcel(response, teacherId, targetYear);
    }

// =============== IMPORT KẾ HOẠCH NĂM ===============

    @PostMapping(value = "/plan/import", consumes = "multipart/form-data")
    public ResponseEntity<ImportPlanResultDto> importTeacherPlan(
            @RequestParam Integer year,
            @RequestParam("file") MultipartFile file,
            HttpServletRequest request
    ) {
        String teacherId = jwtUtil.ExtractUserId(request);
        ImportPlanResultDto result = subjectRegistrationService.importTeacherPlanExcel(teacherId, year, file);
        return ResponseEntity.ok(result);
    }
}