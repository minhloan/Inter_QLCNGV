package com.example.teacherservice.model;

import com.example.teacherservice.enums.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Embeddable;
import lombok.*;

import java.util.ArrayList;
import java.util.Date;
import java.util.List;


@Embeddable
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserDetails {
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private Gender gender;
    private String aboutMe;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private Date birthDate;
    private String country;
    private String province;
    private String district;
    private String ward;
    private String house_number;
    private String imageUrl;
    private String qualification;
    private String imageCoverUrl;
    @ElementCollection
    @Builder.Default
    private List<String> skills = new ArrayList<>();
}
