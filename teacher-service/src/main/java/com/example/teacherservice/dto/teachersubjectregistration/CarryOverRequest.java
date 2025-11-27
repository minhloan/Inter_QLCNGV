package com.example.teacherservice.dto.teachersubjectregistration;

import com.example.teacherservice.enums.Quarter;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CarryOverRequest {
    private Integer targetYear;
    private Quarter quarter;
    private String reasonForCarryOver;
}