package com.example.teacherservice.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenDto {
    private String token;
    private String access;
    private String refresh;

    // Extra user info for frontend display
    private String username;
    private String email;
    private String full_name;
}

