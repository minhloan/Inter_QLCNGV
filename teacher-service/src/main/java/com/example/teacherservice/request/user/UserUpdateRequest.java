package com.example.teacherservice.request.user;

import com.example.teacherservice.model.UserDetails;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UserUpdateRequest {
    @NotBlank(message = "Id is required")
    private String id;
    private String email;
    private String username;
    private String password;
    private String status;
    private UserDetails userDetails;
}

