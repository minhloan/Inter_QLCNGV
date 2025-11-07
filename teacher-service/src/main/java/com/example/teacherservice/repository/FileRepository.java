package com.example.teacherservice.repository;

import com.example.teacherservice.model.File;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FileRepository extends JpaRepository<File, String> {
}
