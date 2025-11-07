package com.example.teacherservice.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter @Setter
public class ForgotPassword {
    @NotBlank(message = "Email is required")
    @Email(message = "Invalid email format")
    private String email;
}

