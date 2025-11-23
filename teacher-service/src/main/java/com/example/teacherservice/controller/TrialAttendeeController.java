package com.example.teacherservice.controller;

import com.example.teacherservice.dto.trial.TrialAttendeeDto;
import com.example.teacherservice.request.trial.TrialAttendeeRequest;
import com.example.teacherservice.service.trial.TrialAttendeeService;
import com.example.teacherservice.jwt.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/v1/teacher/trial")
@RequiredArgsConstructor
public class TrialAttendeeController {

    private final TrialAttendeeService trialAttendeeService;
    private final JwtUtil jwtUtil;

    @PostMapping("/attendee")
    public ResponseEntity<TrialAttendeeDto> addAttendee(@RequestBody TrialAttendeeRequest request) {
        TrialAttendeeDto dto = trialAttendeeService.addAttendee(
                request.getTrialId(),
                request.getAttendeeName(),
                request.getAttendeeRole().toString(),
                request.getAttendeeUserId()
        );
        return new ResponseEntity<>(dto, HttpStatus.CREATED);
    }

    @GetMapping("/attendee/{trialId}")
    public ResponseEntity<List<TrialAttendeeDto>> getAttendeesByTrial(@PathVariable String trialId) {
        List<TrialAttendeeDto> attendees = trialAttendeeService.getAttendeesByTrial(trialId);
        return ResponseEntity.ok(attendees);
    }

    @DeleteMapping("/attendee/{attendeeId}")
    public ResponseEntity<Void> removeAttendee(@PathVariable String attendeeId) {
        trialAttendeeService.removeAttendee(attendeeId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/attendee/my")
    public ResponseEntity<List<TrialAttendeeDto>> getMyAttendees(HttpServletRequest request) {
        String userId = jwtUtil.ExtractUserId(request);
        List<TrialAttendeeDto> attendees = trialAttendeeService.getMyAttendees(userId);
        return ResponseEntity.ok(attendees);
    }
}
