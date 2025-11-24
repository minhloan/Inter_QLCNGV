package com.example.teacherservice.model;

import com.example.teacherservice.enums.Active;
import com.example.teacherservice.enums.Role;
import jakarta.persistence.*;
import lombok.*;

import java.util.Set;
import java.util.HashSet;

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

    @Column(unique = true, nullable = false)
    private String email;

    @Enumerated(EnumType.STRING)
    private Role primaryRole = Role.TEACHER; 

    @Column(name = "teacher_code", length = 20, unique = true)
    private String teacherCode;

    @Column(name = "academic_rank", length = 255)
    private String academicRank; // Học hàm/Học vị (chức vụ)

    @Enumerated(EnumType.STRING)
    private Active active = Active.ACTIVE;

    @ElementCollection(targetClass = Role.class, fetch = FetchType.EAGER)
    @Enumerated(EnumType.STRING)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Column(name = "role", columnDefinition = "VARCHAR(50)")
    @Builder.Default
    private Set<Role> roles = new HashSet<>();

    @Embedded
    @Builder.Default
    private UserDetails userDetails = new UserDetails();
}
