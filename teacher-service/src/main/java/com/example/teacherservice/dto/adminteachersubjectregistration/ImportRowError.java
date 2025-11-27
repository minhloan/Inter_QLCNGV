package com.example.teacherservice.dto.adminteachersubjectregistration;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ImportRowError {
    private int rowIndex;
    private String message;
}