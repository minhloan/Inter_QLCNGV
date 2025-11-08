package com.example.teacherservice.service.file;

import com.example.teacherservice.exception.GenericErrorResponse;
import com.example.teacherservice.model.File;
import com.example.teacherservice.repository.FileRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
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
        String uuid = UUID.randomUUID().toString();
        String filePath = FOLDER_PATH + "/" + uuid;
        try{
            file.transferTo(new java.io.File(filePath));
        } catch (IOException e) {
            throw GenericErrorResponse.builder()
                    .message("Unable to save file to storage")
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }

        fileRepository.save(File.builder()
                .type(file.getContentType())
                .filePath(filePath).build()
        );
        return uuid;
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

    }

    @Override
    public void deleteImageFromFileSystem(String id) {
        java.io.File file = new java.io.File(findFileById(id).getFilePath());
        boolean deleted = file.delete();
        if (deleted) fileRepository.deleteById(id);
        else
            throw GenericErrorResponse.builder()
                    .message("unable to delete file from storage")
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
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
        FOLDER_PATH = currentPath + "/teacher-service/src/main/resources/attachments";

        try {
            java.nio.file.Path path = java.nio.file.Paths.get(FOLDER_PATH);
            if (!Files.exists(path)) {
                Files.createDirectories(path);
            }
        } catch (IOException e) {
            throw GenericErrorResponse.builder()
                    .message("unable to create directories: " + e.getMessage())
                    .httpStatus(HttpStatus.INTERNAL_SERVER_ERROR)
                    .build();
        }
    }
}
