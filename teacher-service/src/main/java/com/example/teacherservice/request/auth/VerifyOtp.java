package com.example.teacherservice.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

@Data
public class VerifyOtp {
    @NotBlank @Email
    private String email;

    // đúng 6 số
    @NotBlank
    @Pattern(regexp = "\\d{6}")
    private String otp;
}

