package com.example.teacherservice.dto.auth;

import lombok.Builder;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Builder
public class UpdatePasswordRequest {
    private String email;

    private String otp;

    private String newPassword;
}

