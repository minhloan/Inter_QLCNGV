package com.example.teacherservice.service.file;

import com.example.teacherservice.exception.GenericErrorResponse;
import com.example.teacherservice.model.File;
import com.example.teacherservice.repository.FileRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.util.UUID;


@RequiredArgsConstructor
@Service
public class FileServiceImpl implements FileService {

    private final FileRepository fileRepository;
    private String FOLDER_PATH;

    @Override
    public String uploadImageToFileSystem(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw GenericErrorResponse.builder()
                    .message("File is null or empty")
                    .httpStatus(HttpStatus.BAD_REQUEST)
                    .build();
        }

        String uuid = UUID.randomUUID().toString();
        String originalFilename = file.getOriginalFilename();
        String extension = "";
        
        // Extract extension from original filename
        if (originalFilename != null && originalFilename.contains(".")) {
            extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        } else {
            // Try to determine extension from content type
            String contentType = file.getContentType();
            if (contentType != null) {
                if (contentType.contains("jpeg") || contentType.contains("jpg")) {
                    extension = ".jpg";
                } else if (contentType.contains("png")) {
                    extension = ".png";
                } else if (contentType.contains("gif")) {
                    extension = ".gif";
                } else if (contentType.contains("webp")) {
                    extension = ".webp";
                } else {
                    extension = ".bin"; // Default extension
                }
            } else {
                extension = ".bin";
            }
        }
        
        java.nio.file.Path filePath = java.nio.file.Paths.get(FOLDER_PATH, uuid + extension);
        
        try {
            // Ensure parent directory exists
            Files.createDirectories(filePath.getParent());
            file.transferTo(filePath.toFile());
        } catch (IOException e) {
            System.err.println("Error saving file to: " + filePath);
            System.err.println("Error message: " + e.getMessage());
            e.printStackTrace();
            throw GenericErrorResponse.builder()
                    .message("Unable to save file to storage: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }

        File fileEntity = File.builder()
                .type(file.getContentType())
                .filePath(filePath.toString())
                .build();
        fileRepository.save(fileEntity);
        return fileEntity.getId();
    }

    @Override
    public byte[] downloadImageFromFileSystem(String id) {
        try{
            return Files.readAllBytes(new java.io.File(findFileById(id).getFilePath()).toPath());
        }catch (IOException e){
            throw GenericErrorResponse.builder()
                    .message("Unable to read file from storage")
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }

    }   @Override
    public File saveFile(MultipartFile file, String folder) {
        String uuid = UUID.randomUUID().toString();
        String filePath = FOLDER_PATH + "/" + folder + "/" + uuid;
        try{
            java.io.File directory = new java.io.File(FOLDER_PATH + "/" + folder);
            if (!directory.exists()) {
                directory.mkdirs();
            }
            file.transferTo(new java.io.File(filePath));
        } catch (IOException e) {
            throw GenericErrorResponse.builder()
                    .message("Unable to save file to storage")
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }

        File fileEntity = File.builder()
                .type(file.getContentType())
                .filePath(filePath)
                .originalFileName(file.getOriginalFilename())
                .build();
        fileRepository.save(fileEntity);
        return fileEntity;
    }

    @Override
    public Resource loadFileAsResource(String filePath) {
        try {
            java.nio.file.Path file = java.nio.file.Paths.get(filePath);
            Resource resource = new org.springframework.core.io.UrlResource(file.toUri());
            if (resource.exists() || resource.isReadable()) {
                return resource;
            } else {
                throw GenericErrorResponse.builder()
                        .message("Could not read file: " + filePath)
                        .httpStatus(HttpStatus.NOT_FOUND)
                        .build();
            }
        } catch (Exception e) {
            throw GenericErrorResponse.builder()
                    .message("Could not read file: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }

    @Override
    public void deleteImageFromFileSystem(String id) {
        if (id == null || id.isBlank()) {
            return; // Skip deletion if id is null or blank
        }
        try {
            File fileEntity = findFileById(id);
            java.io.File file = new java.io.File(fileEntity.getFilePath());
            boolean deleted = file.delete();
            if (deleted) {
                fileRepository.deleteById(id);
            } else {
                throw GenericErrorResponse.builder()
                        .message("unable to delete file from storage")
                        .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                        .build();
            }
        } catch (Exception e) {
            // If file not found or other error, just log and continue
            // Don't throw exception to avoid breaking the update process
        }
    }

    @Override
    public File findFileById(String id) {
        return fileRepository.findById(id)
                .orElseThrow(()-> GenericErrorResponse.builder()
                .message("Unable to find file")
                .httpStatus(HttpStatus.NOT_FOUND).build());
    }

    @PostConstruct
    public void init() {
        String currentPath = System.getProperty("user.dir");
        // Use Paths.get() for cross-platform compatibility
        java.nio.file.Path folderPath = java.nio.file.Paths.get(currentPath, "teacher-service", "src", "main", "resources", "attachments");
        FOLDER_PATH = folderPath.toString();
        
        System.out.println("Initializing file storage at: " + FOLDER_PATH);
        System.out.println("Current working directory: " + currentPath);

        try {
            if (!Files.exists(folderPath)) {
                System.out.println("Creating directory: " + FOLDER_PATH);
                Files.createDirectories(folderPath);
                System.out.println("Directory created successfully");
            } else {
                System.out.println("Directory already exists");
            }
            
            // Verify write permissions
            java.io.File testFile = new java.io.File(FOLDER_PATH);
            if (!testFile.canWrite()) {
                System.err.println("WARNING: No write permission for directory: " + FOLDER_PATH);
            } else {
                System.out.println("Directory has write permission");
            }
        } catch (IOException e) {
            System.err.println("Error creating directories: " + e.getMessage());
            e.printStackTrace();
            throw GenericErrorResponse.builder()
                    .message("unable to create directories: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }
}
