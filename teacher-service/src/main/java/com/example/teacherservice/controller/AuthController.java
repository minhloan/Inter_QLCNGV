package com.example.teacherservice.controller;

import com.example.teacherservice.dto.auth.ForgotPassword;
import com.example.teacherservice.dto.auth.RegisterDto;
import com.example.teacherservice.dto.auth.TokenDto;
import com.example.teacherservice.dto.auth.VerifyOtp;
import com.example.teacherservice.request.auth.LoginRequest;
import com.example.teacherservice.request.auth.RegisterRequest;
import com.example.teacherservice.request.auth.UpdatePasswordRequest;
import com.example.teacherservice.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Map;

@RestController
@RequestMapping("/v1/teacher/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<TokenDto> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.login(request));
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterDto> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPassword request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("ok", true, "message", "OTP sent to your email"));
    }

    @PostMapping("/verifyOtp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtp request) {
        boolean ok = authService.verifyOtp(request.getEmail(), request.getOtp());
        if (ok) {
            return ResponseEntity.ok(Map.of("ok", true, "message", "OTP verified successfully"));
        }
        return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Invalid OTP"));
    }

    @PostMapping("/updatePassword")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        boolean ok = authService.resetPassword(request);
        if (ok) {
            return ResponseEntity.ok(Map.of("ok", true, "message", "Password updated successfully"));
        }
        return ResponseEntity.badRequest().body(
                Map.of("ok", false, "message", "OTP not verified or verification expired")
        );
    }

    @PostMapping("/login/role")
    public ResponseEntity<TokenDto> loginWithRole(
            @RequestBody LoginRequest request,
            @RequestParam String role) {
        return ResponseEntity.ok(authService.loginWithRoleSelection(request, role));
    }

}

