package com.example.teacherservice.repository;

import com.example.teacherservice.enums.Active;
import com.example.teacherservice.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByEmail(String email);
    Optional<User> findByUsername(String username);
    List<User> findAllByActive(Active active);
    boolean existsByEmailIgnoreCase(String email);
}

