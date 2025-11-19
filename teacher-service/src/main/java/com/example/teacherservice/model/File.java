package com.example.teacherservice.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "files", indexes = {
    @Index(name = "idx_type", columnList = "type"),
    @Index(name = "idx_uploaded_by", columnList = "uploaded_by")
})
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
@Builder
public class File extends BaseEntity {
    @Column(name = "type", length = 100)
    private String type;
    
    @Column(name = "file_path", length = 255)
    private String filePath;
    
    @Column(name = "file_name", length = 255)
    private String fileName;
    
    @Column(name = "size_bytes")
    private Long sizeBytes;
    
    @Column(name = "checksum", length = 128)
    private String checksum;

    @Column(name = "original_file_name", length = 255)
    private String originalFileName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;
}
