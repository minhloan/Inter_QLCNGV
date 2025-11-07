package com.example.teacherservice.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class VerifyOtp {
    @NotBlank @Email
    private String email;
    @NotBlank
    private String otp;
}

