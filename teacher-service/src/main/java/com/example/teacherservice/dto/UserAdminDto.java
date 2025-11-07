package com.example.teacherservice.dto;

import lombok.Data;


@Data
public class UserAdminDto {
    private String id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String gender;
    private String aboutMe;
    private String birthDate;
    private String imageUrl;
    private String active;
    private String roleName;
}
