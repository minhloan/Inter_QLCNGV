package com.example.teacherservice.controller;

import com.example.teacherservice.dto.auth.ForgotPassword;
import com.example.teacherservice.dto.auth.RegisterDto;
import com.example.teacherservice.dto.auth.TokenDto;
import com.example.teacherservice.dto.auth.VerifyOtp;
import com.example.teacherservice.request.auth.LoginRequest;
import com.example.teacherservice.request.auth.GoogleLoginRequest;
import com.example.teacherservice.request.auth.RegisterRequest;
import com.example.teacherservice.request.auth.UpdatePasswordRequest;
import com.example.teacherservice.service.auth.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
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
        TokenDto tokenDto = authService.login(request);
        return ResponseEntity.ok(tokenDto);
    }

    @PostMapping("/google-login")
    public ResponseEntity<TokenDto> googleLogin(@RequestBody GoogleLoginRequest request) {
        TokenDto tokenDto = authService.googleLogin(request);
        return ResponseEntity.ok(tokenDto);
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterDto> register(@Valid @RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/forgotPassword")
    public ResponseEntity<?> forgotPassword(@Valid @RequestBody ForgotPassword request) {
        authService.forgotPassword(request);
        return ResponseEntity.ok(Map.of("ok", true, "message", "Mã OTP đã được gửi đến email của bạn"));
    }

    @PostMapping("/verifyOtp")
    public ResponseEntity<?> verifyOtp(@Valid @RequestBody VerifyOtp request) {
        boolean ok = authService.verifyOtp(request.getEmail(), request.getOtp());
        if (ok) {
            return ResponseEntity.ok(Map.of("ok", true, "message", "Xác thực OTP thành công"));
        }
        return ResponseEntity.badRequest().body(Map.of("ok", false, "message", "Mã OTP không đúng"));
    }

    @PostMapping("/updatePassword")
    public ResponseEntity<?> updatePassword(@Valid @RequestBody UpdatePasswordRequest request) {
        boolean ok = authService.resetPassword(request);
        if (ok) {
            return ResponseEntity.ok(Map.of("ok", true, "message", "Cập nhật mật khẩu thành công"));
        }
        return ResponseEntity.badRequest().body(
                Map.of("ok", false, "message", "Mã OTP chưa được xác thực hoặc đã hết hạn")
        );
    }

    @PostMapping("/login/role")
    public ResponseEntity<TokenDto> loginWithRole(
            @RequestBody LoginRequest request,
            @RequestParam String role,
            HttpServletResponse response) {
        TokenDto tokenDto = authService.loginWithRoleSelection(request, role);
        
        // Set cookies
        Cookie accessCookie = new Cookie("accessToken", tokenDto.getAccess());
        accessCookie.setHttpOnly(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(60 * 60 * 24); // 1 ngày
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", tokenDto.getRefresh());
        refreshCookie.setHttpOnly(false);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(60 * 60 * 24 * 7); // 7 ngày
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(tokenDto);
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenDto> refresh(
            HttpServletRequest request, 
            HttpServletResponse response,
            @RequestBody(required = false) Map<String, String> body) {
        // Lấy refreshToken từ cookie (ưu tiên)
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        // Nếu không có trong cookie, thử lấy từ body (fallback)
        if ((refreshToken == null || refreshToken.isEmpty()) && body != null) {
            refreshToken = body.get("refreshToken");
        }

        if (refreshToken == null || refreshToken.isEmpty()) {
            return ResponseEntity.status(401).build();
        }

        TokenDto tokenDto = authService.refreshToken(refreshToken);
        
        // Set accessToken vào cookie
        Cookie accessCookie = new Cookie("accessToken", tokenDto.getAccess());
        accessCookie.setHttpOnly(false);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(60 * 60 * 24); // 1 ngày
        response.addCookie(accessCookie);

        return ResponseEntity.ok(tokenDto);
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletRequest request, HttpServletResponse response) {
        // Lấy refreshToken từ cookie
        String refreshToken = null;
        Cookie[] cookies = request.getCookies();
        if (cookies != null) {
            for (Cookie cookie : cookies) {
                if ("refreshToken".equals(cookie.getName())) {
                    refreshToken = cookie.getValue();
                    break;
                }
            }
        }

        if (refreshToken != null && !refreshToken.isEmpty()) {
            authService.logout(refreshToken);
        }

        // Xóa cookies
        Cookie accessCookie = new Cookie("accessToken", null);
        accessCookie.setPath("/");
        accessCookie.setMaxAge(0);
        response.addCookie(accessCookie);

        Cookie refreshCookie = new Cookie("refreshToken", null);
        refreshCookie.setPath("/");
        refreshCookie.setMaxAge(0);
        response.addCookie(refreshCookie);

        return ResponseEntity.ok(Map.of("ok", true, "message", "Đăng xuất thành công"));
    }
}

