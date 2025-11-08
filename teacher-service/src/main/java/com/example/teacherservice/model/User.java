package com.example.teacherservice.model;

import com.example.teacherservice.enums.Active;
import com.example.teacherservice.enums.Role;
import com.example.teacherservice.enums.TeacherStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.Set;
import java.util.HashSet;
import java.util.List;

@Entity(name = "users")
@AllArgsConstructor
@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {
    @Column(nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;

    @Column(unique = true, nullable = false, updatable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role primaryRole = Role.TEACHER; // Role chính

    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Enumerated(EnumType.STRING)
    private Active active = Active.ACTIVE;

    @Embedded
    @Builder.Default
    private UserDetails userDetails = new UserDetails();

    @Column(name = "last_login")
    private LocalDateTime lastLogin;

    @Column(name = "avatar_file_id", length = 64)
    private String avatarFileId;

    @Column(name = "teacher_code", length = 20, unique = true)
    private String teacherCode;

    @Enumerated(EnumType.STRING)
    @Column(name = "teacher_status")
    private TeacherStatus teacherStatus;
}
