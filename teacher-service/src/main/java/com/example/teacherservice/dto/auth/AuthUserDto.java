package com.example.teacherservice.dto.auth;

import com.example.teacherservice.enums.Role;
import lombok.Data;

import java.util.Set;
import java.util.HashSet;

@Data
public class AuthUserDto {
    private String id;
    private String username;
    private String email;
    private String password;
    private Role role;
    private Set<Role> roles = new HashSet<>();
    
    public void addRole(Role role) {
        this.roles.add(role);
        if (this.role == null) {
            this.role = role;
        }
    }
    
    public boolean hasRole(Role role) {
        return this.roles.contains(role);
    }
}