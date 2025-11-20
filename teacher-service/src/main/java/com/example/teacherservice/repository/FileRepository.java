package com.example.teacherservice.repository;

import com.example.teacherservice.model.File;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface FileRepository extends JpaRepository<File, String> {
    Optional<File> findByFilePath(String filePath);
}
