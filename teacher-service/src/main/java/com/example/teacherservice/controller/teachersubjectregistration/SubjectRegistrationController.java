package com.example.teacherservice.controller.teachersubjectregistration;

import com.example.teacherservice.dto.teachersubjectregistration.SubjectRegistrationsDto;
import com.example.teacherservice.jwt.JwtUtil;
import com.example.teacherservice.model.SubjectRegistration;
import com.example.teacherservice.request.teachersubjectregistration.SubjectRegistrationFilterRequest;
import com.example.teacherservice.service.teachersubjectregistration.SubjectRegistrationService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.modelmapper.ModelMapper;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/v1/teacher/subject-registrations")
@RequiredArgsConstructor
public class SubjectRegistrationController {

    private final SubjectRegistrationService subjectRegistrationService;
    private final ModelMapper modelMapper;
    private final JwtUtil jwtUtil;


    @GetMapping("/getAll")
    public List<SubjectRegistrationsDto> getAll(HttpServletRequest request) {
        String userId = jwtUtil.ExtractUserId(request);
        List<SubjectRegistration> registrations = subjectRegistrationService.getRegistrationsByTeacherId(userId);

        List<SubjectRegistrationsDto> result = registrations.stream()
                .map(r -> subjectRegistrationService.getById(r.getId())) // hoặc gọi toDto trực tiếp
                .collect(Collectors.toList());

        return result;
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
    public ResponseEntity<SubjectRegistrationsDto> registerSubject(@RequestBody SubjectRegistrationsDto dto, HttpServletRequest request) {
        String teacherId = jwtUtil.ExtractUserId(request);
        dto.setTeacherId(teacherId);
        return ResponseEntity.status(HttpStatus.CREATED).body(subjectRegistrationService.createRegistration(dto));
    }


    @GetMapping("/ping")
    public String ping() {
        return "ok";
    }
}
