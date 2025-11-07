package com.example.teacherservice.service.file;

import com.example.teacherservice.model.File;
import org.springframework.web.multipart.MultipartFile;

public interface FileService {
    String uploadImageToFileSystem(MultipartFile file);
    byte[] downloadImageFromFileSystem(String id);
    void deleteImageFromFileSystem(String id);
    File findFileById(String id);
}
