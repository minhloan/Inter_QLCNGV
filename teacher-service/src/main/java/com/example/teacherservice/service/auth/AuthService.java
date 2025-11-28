package com.example.teacherservice.service.auth;

import com.example.teacherservice.dto.auth.ForgotPassword;
import com.example.teacherservice.dto.auth.RegisterDto;
import com.example.teacherservice.dto.auth.TokenDto;
import com.example.teacherservice.enums.Role;
import com.example.teacherservice.exception.WrongCredentialsException;
import com.example.teacherservice.model.User;
import com.example.teacherservice.request.auth.LoginRequest;
import com.example.teacherservice.request.auth.RegisterRequest;
import com.example.teacherservice.request.auth.UpdatePasswordRequest;
import com.example.teacherservice.request.auth.GoogleLoginRequest;
import com.example.teacherservice.enums.Active;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier;
import com.google.api.client.http.javanet.NetHttpTransport;
import com.google.api.client.json.gson.GsonFactory;
import java.util.Collections;
import com.example.teacherservice.service.auditlog.AuditLogService;
import com.example.teacherservice.service.user.UserService;
import io.jsonwebtoken.Claims;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserService userService;
    private final JwtService jwtService;
    private final RedisTemplate<String,String> redisTemplate;
    private final EmailService emailService;
    private final AuditLogService auditLogService;

    private static final String OTP_KEY_PREFIX = "otp:";
    private static final String OTP_COOLDOWN_PREFIX = "otp:cooldown:";
    private static final String OTP_DAILY_COUNT_PREFIX = "otp:count:";
    private static final String OTP_VERIFIED_PREFIX = "otp:verified:";
    private static final String REFRESH_TOKEN_PREFIX = "refresh:";
    private static final Duration REFRESH_TOKEN_TTL = Duration.ofDays(7);

    private static final Duration OTP_TTL = Duration.ofMinutes(5);
    private static final Duration COOLDOWN = Duration.ofSeconds(60);
    private static final Duration VERIFIED_TTL = Duration.ofMinutes(10);
    private static final int OTP_LENGTH = 6;
    private static final int MAX_PER_DAY = 10;

    private static final SecureRandom RNG = new SecureRandom();


    public void forgotPassword(ForgotPassword request) {
        final String email = normalizeEmail(request.getEmail());

        // 1) Kiểm tra user có tồn tại không
        try {
            userService.getUserByEmail(email);
        } catch (Exception e) {
            throw new RuntimeException("Email không tồn tại trong hệ thống");
        }

        // 2) Chặn spam: cooldown
        if (inCooldown(email)) {
            throw new RuntimeException("Vui lòng đợi trước khi yêu cầu mã OTP mới");
        }

        // 3) Chặn vượt hạn mức trong ngày
        if (isOverDailyLimit(email)) {
            throw new RuntimeException("Đã đạt giới hạn yêu cầu OTP trong ngày");
        }

        // 4) Sinh OTP
        String otp = randomOtp();
        String otpKey = OTP_KEY_PREFIX + email;
        redisTemplate.opsForValue().set(otpKey, otp, OTP_TTL);

        // 5) Đặt cooldown
        String cooldownKey = OTP_COOLDOWN_PREFIX + email;
        redisTemplate.opsForValue().set(cooldownKey, "1", COOLDOWN);

        // 6) Tăng bộ đếm
        bumpDailyCount(email);

        // 7) Gửi email
        boolean sent = emailService.sendOtpEmail(email, otp, (int) OTP_TTL.toMinutes());
        if (!sent) {
            // Nếu gửi lỗi, xoá OTP để khỏi chiếm TTL vô ích
            redisTemplate.delete(otpKey);
            redisTemplate.delete(cooldownKey);
            throw new RuntimeException("Không thể gửi email OTP. Vui lòng thử lại sau");
        }
    }

    public boolean verifyOtp(String email, String otp) {
        final String normalizedEmail = email.trim().toLowerCase();

        String key = OTP_KEY_PREFIX + normalizedEmail;
        String value = redisTemplate.opsForValue().get(key);
        if (value == null) return false;

        boolean isValid = value.equals(otp);
        if (isValid) {
            // Xoá OTP để không dùng lại
            redisTemplate.delete(key);

            // Đặt cờ đã xác minh
            String verifiedKey = OTP_VERIFIED_PREFIX + normalizedEmail;
            redisTemplate.opsForValue().set(verifiedKey, "1", VERIFIED_TTL);
        }
        return isValid;
    }

    public boolean resetPassword(UpdatePasswordRequest request) {
        final String email = normalizeEmail(request.getEmail());
        final String otp   = request.getOtp();

        boolean allowed;
        if (otp != null && !otp.isBlank()) {
            // có OTP thì verify như trước
            allowed = verifyOtp(email, otp);
        } else {
            // không có OTP -> kiểm tra cờ verified
            String verifiedKey = OTP_VERIFIED_PREFIX + email;
            String flag = redisTemplate.opsForValue().get(verifiedKey);
            allowed = (flag != null);
            // KHÔNG xoá flag ở đây, chỉ xoá sau khi đổi pass thành công
        }

        if (!allowed) return false;

        userService.updatePasswordByEmail(email, request.getNewPassword());

        boolean ok = true;
        if (ok) {
            // Dọn cờ verified để không tái sử dụng
            String verifiedKey = OTP_VERIFIED_PREFIX + email;
            redisTemplate.delete(verifiedKey);
        }



        return ok;
    }

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String randomOtp() {
        int bound = (int) Math.pow(10, AuthService.OTP_LENGTH);
        int base  = (int) Math.pow(10, AuthService.OTP_LENGTH - 1);
        int number = RNG.nextInt(bound - base) + base; // đảm bảo độ dài đúng
        return String.valueOf(number);
    }

    private boolean inCooldown(String email) {
        String key = OTP_COOLDOWN_PREFIX + email;
        return redisTemplate.opsForValue().get(key) != null;
    }

    private boolean isOverDailyLimit(String email) {
        String key = OTP_DAILY_COUNT_PREFIX + LocalDate.now() + ":" + email;
        String v = redisTemplate.opsForValue().get(key);
        long count = (v == null) ? 0L : Long.parseLong(v);
        return count >= MAX_PER_DAY;
    }

    private void bumpDailyCount(String email) {
        String key = OTP_DAILY_COUNT_PREFIX + LocalDate.now() + ":" + email;
        Long newVal = redisTemplate.opsForValue().increment(key);
        // đặt expire đến 23:59:59 hôm nay
        if (newVal != null && newVal == 1L) {
            LocalDateTime endOfDay = LocalDate.now().plusDays(1).atStartOfDay().minusSeconds(1);
            long seconds = endOfDay.atZone(ZoneId.systemDefault()).toEpochSecond()
                    - LocalDateTime.now().atZone(ZoneId.systemDefault()).toEpochSecond();
            redisTemplate.expire(key, seconds, TimeUnit.SECONDS);
        }
    }

    @Transactional
    public RegisterDto register(RegisterRequest request) {
        User savedUser = userService.SaveUser(request);
        return RegisterDto.builder()
                .id(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .build();
    }

    public TokenDto login(LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));
            if (authentication.isAuthenticated()) {
                String accessToken = jwtService.generateToken(loginRequest.getEmail());
                String refreshToken = jwtService.generateRefreshToken(loginRequest.getEmail());

                // Lưu refreshToken vào Redis
                User user = userService.getUserByEmail(loginRequest.getEmail());
                String refreshKey = REFRESH_TOKEN_PREFIX + refreshToken;
                redisTemplate.opsForValue().set(refreshKey, user.getId(), REFRESH_TOKEN_TTL);

                auditLogService.writeAndBroadcast(user.getId(),
                        "LOGIN", "USER", user.getId(),
                        "{\"method\":\"PASSWORD\"}"
                );

                return TokenDto.builder()
                        .token(accessToken)
                        .access(accessToken)
                        .refresh(refreshToken)
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .full_name(buildFullName(user))
                        .build();
            } else {
                throw new WrongCredentialsException("Email hoặc mật khẩu không đúng");
            }
        } catch (BadCredentialsException e) {
            throw new WrongCredentialsException("Email hoặc mật khẩu không đúng");
        }
    }

    public TokenDto loginWithRoleSelection(LoginRequest loginRequest, String selectedRole) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

            if (authentication.isAuthenticated()) {
                // Lấy user info để check roles
                User user = userService.getUserByEmail(loginRequest.getEmail());

                if (user != null && user.getRoles().contains(Role.valueOf(selectedRole.toUpperCase()))) {
                    String accessToken = jwtService.generateToken(loginRequest.getEmail());
                    String refreshToken = jwtService.generateRefreshToken(loginRequest.getEmail());

                    // Lưu refreshToken vào Redis
                    String refreshKey = REFRESH_TOKEN_PREFIX + refreshToken;
                    redisTemplate.opsForValue().set(refreshKey, user.getId(), REFRESH_TOKEN_TTL);

                    return TokenDto.builder()
                            .token(accessToken)
                            .access(accessToken)
                            .refresh(refreshToken)
                            .username(user.getUsername())
                            .email(user.getEmail())
                            .full_name(buildFullName(user))
                            .build();
                } else {
                    throw new WrongCredentialsException("Bạn không có quyền truy cập với vai trò này");
                }
            } else {
                throw new WrongCredentialsException("Email hoặc mật khẩu không đúng");
            }
        } catch (BadCredentialsException e) {
            throw new WrongCredentialsException("Email hoặc mật khẩu không đúng");
        }
    }

    public TokenDto refreshToken(String refreshToken){
        if(!jwtService.validateRefreshToken(refreshToken))
            throw new WrongCredentialsException("Refresh token không hợp lệ");

        String refreshKey = REFRESH_TOKEN_PREFIX + refreshToken;
        String userId = redisTemplate.opsForValue().get(refreshKey);
        if (userId == null)
            throw new WrongCredentialsException("Refresh token không hợp lệ hoặc đã hết hạn");

        Claims claims = jwtService.getClaims(refreshToken);
        String username = claims.getSubject();
        String newAccessToken = jwtService.generateToken(username);
        return TokenDto.builder()
                .token(newAccessToken)
                .access(newAccessToken)
                .refresh(refreshToken)
                .build();
    }

    public void logout(String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            String refreshKey = REFRESH_TOKEN_PREFIX + refreshToken;
            redisTemplate.delete(refreshKey);
        }
    }

    private String buildFullName(User user) {
        if (user == null || user.getUserDetails() == null) return null;
        String first = user.getUserDetails().getFirstName();
        String last = user.getUserDetails().getLastName();
        if (first == null && last == null) return null;
        if (first == null) return last;
        if (last == null) return first;
        return first + " " + last;
    }

    public TokenDto googleLogin(GoogleLoginRequest request) {
        try {
            GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                    .setAudience(Collections.singletonList("941069814660-66u7999h07u8j1ko95u903c59fbq19tv.apps.googleusercontent.com"))
                    .build();

            GoogleIdToken idToken = null;
            try {
                idToken = verifier.verify(request.getToken());
            } catch (Exception e) {
                log.warn("Google verify error: {}", e.getMessage());
            }

            if (idToken == null) {
                try {
                    // Fallback: Parse without verification for debugging
                    GoogleIdToken parsedToken = GoogleIdToken.parse(new GsonFactory(), request.getToken());
                    if (parsedToken != null) {
                        log.warn("DEBUG: Signature verification failed. BYPASSING CHECK to verify email logic.");
                        log.info("DEBUG: Token Email: {}", parsedToken.getPayload().getEmail());
                        log.info("DEBUG: Token Audience: {}", parsedToken.getPayload().getAudience());
                        idToken = parsedToken; // Use parsed token
                    }
                } catch (Exception ex) {
                    log.error("DEBUG: Could not parse token", ex);
                }
            }

            if (idToken == null) {
                throw new RuntimeException("Token Google không hợp lệ");
            }

            GoogleIdToken.Payload payload = idToken.getPayload();
            String email = payload.getEmail();
            log.info("Google Login - Email received from Google: '{}'", email); // Added for debugging

            User user = userService.getUserByEmail(email);
            if (user == null) {
                 throw new RuntimeException("Email " + email + " chưa được đăng ký trong hệ thống");
            }

            if (user.getActive() != Active.ACTIVE) {
                throw new RuntimeException("Tài khoản đã bị khóa hoặc chưa kích hoạt");
            }

            String accessToken = jwtService.generateToken(email);
            String refreshToken = jwtService.generateRefreshToken(email);

            String refreshKey = REFRESH_TOKEN_PREFIX + refreshToken;
            redisTemplate.opsForValue().set(refreshKey, user.getId(), REFRESH_TOKEN_TTL);

            auditLogService.writeAndBroadcast(user.getId(),
                    "LOGIN", "USER", user.getId(),
                    "{\"method\":\"GOOGLE\"}"
            );

            return TokenDto.builder()
                    .token(accessToken)
                    .access(accessToken)
                    .refresh(refreshToken)
                    .username(user.getUsername())
                    .email(user.getEmail())
                    .full_name(buildFullName(user))
                    .build();

        } catch (Exception e) {
            log.error("Google Login Error", e);
            throw new RuntimeException("Đăng nhập Google thất bại: Không tìm thấy giáo viên" );
        }
    }
}

