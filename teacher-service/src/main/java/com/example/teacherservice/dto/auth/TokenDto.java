package com.example.teacherservice.dto.auth;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TokenDto {
    private String token;
    private String access;
    private String refresh;
}

