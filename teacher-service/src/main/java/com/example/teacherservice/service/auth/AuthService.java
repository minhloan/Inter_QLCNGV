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
import com.example.teacherservice.service.user.UserService;
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

    private static final String OTP_KEY_PREFIX = "otp:";
    private static final String OTP_COOLDOWN_PREFIX = "otp:cooldown:";
    private static final String OTP_DAILY_COUNT_PREFIX = "otp:count:";
    private static final String OTP_VERIFIED_PREFIX = "otp:verified:";

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
                return TokenDto.builder()
                        .token(jwtService.generateToken(loginRequest.getEmail()))
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
                    return TokenDto.builder()
                            .token(jwtService.generateToken(loginRequest.getEmail()))
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
}

