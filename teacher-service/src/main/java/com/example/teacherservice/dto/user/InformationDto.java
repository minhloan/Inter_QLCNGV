package com.example.teacherservice.dto.user;

import lombok.Data;
@Data
public class InformationDto {
    private String id;
    private String username;
    private String email;
    private String phoneNumber;
    private String active;
    private String role;
    private String teacherCode;
}
