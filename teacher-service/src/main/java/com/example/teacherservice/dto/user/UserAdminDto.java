package com.example.teacherservice.dto.user;

import lombok.Data;
import java.util.List;


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
    private String imageCoverUrl;
    private String active;
    private String roleName;
    private String country;
    private String province;
    private String district;
    private String ward;
    private String house_number;
    private String qualification;
    private List<String> skills;
}
