package com.example.teacherservice.dto.user;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;
import java.util.List;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserInformationDto {
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
    private String qualification;
    private List<String> skills;
    private String country;
    private String province;
    private String district;
    private String ward;
    private String house_number;
}
