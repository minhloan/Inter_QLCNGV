package com.example.teacherservice.model;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity(name = "files")
@AllArgsConstructor
@NoArgsConstructor
@Data
@Builder
public class File {
    @Id
    private String id;
    private String type;
    private String filePath;
}
