package com.example.teacherservice.service.auth;

import com.example.teacherservice.dto.auth.AuthUserDto;
import com.example.teacherservice.enums.Role;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Objects;
import java.util.stream.Collectors;
import java.util.stream.Stream;

public class CustomUserDetails implements UserDetails {
    private final AuthUserDto user;

    public CustomUserDetails(AuthUserDto user) {
        this.user = user;
    }

    public String getProfileUsername() {
        return user.getUsername();
    }

    public String getEmail() {
        return user.getEmail();
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        Stream<Role> stream;
        if (user.getRoles() != null && !user.getRoles().isEmpty()) {
            stream = user.getRoles().stream();
        } else {
            Role r = user.getRole() != null ? user.getRole() : Role.TEACHER;
            stream = Stream.of(r);
        }
        return stream
                .filter(Objects::nonNull)
                .map(role -> new SimpleGrantedAuthority("ROLE_" + role.name()))
                .collect(Collectors.toList());
    }

    public String getId(){
        return user.getId();
    }

    @Override
    public String getPassword() {
        return user.getPassword();
    }

    @Override
    public String getUsername() {
        return user.getEmail();
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}

