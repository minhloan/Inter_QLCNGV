package com.example.teacherservice.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpdatePasswordRequest {
    @NotBlank @Email
    private String email;

    // FE gửi "newPassword"
    @NotBlank @Size(min = 8)
    private String newPassword;

    // Tuỳ chọn (để BE vẫn hỗ trợ nhánh cũ dùng OTP trực tiếp)
    private String otp;
}

