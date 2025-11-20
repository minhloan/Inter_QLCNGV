package com.example.teacherservice.controller;

import com.example.teacherservice.model.File;
import com.example.teacherservice.service.file.FileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/v1/teacher/file")
@RequiredArgsConstructor
public class StorageController {
    private final FileService fileService;

    @PostMapping("/upload")
    public ResponseEntity<String> uploadImageToFIleSystem(@RequestPart("image") MultipartFile file) {
        return ResponseEntity.ok()
                .body(fileService.uploadImageToFileSystem(file));
    }

    @GetMapping("/download/{id}")
    public ResponseEntity<?> downloadImageFromFileSystem(@PathVariable String id) {
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf("image/png"))
                .body(fileService.downloadImageFromFileSystem(id));
    }

    @DeleteMapping("/delete/{id}")
    public ResponseEntity<Void> deleteImageFromFileSystem(@PathVariable String id) {
        fileService.deleteImageFromFileSystem(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/get/{id}")
    ResponseEntity<byte[]> getImageById(@PathVariable String id) {
      File file = fileService.findFileById(id);
      byte[] imageData = fileService.downloadImageFromFileSystem(id);
      return ResponseEntity.ok()
                .contentType(MediaType.valueOf(file.getType()))
                .body(imageData);
    }

    @PostMapping("/upload-trial-report")
    public ResponseEntity<String> uploadTrialReport(@RequestPart("file") MultipartFile file, @RequestPart("trialId") String trialId) {
        String fileId = fileService.uploadImageToFileSystem(file);
        return ResponseEntity.ok(fileId);
    }

    @GetMapping("/download-trial-report/{id}")
    public ResponseEntity<byte[]> downloadTrialReport(@PathVariable String id) {
        File file = fileService.findFileById(id);
        byte[] fileData = fileService.downloadImageFromFileSystem(id);
        String filename = file.getFileName() != null ? file.getFileName() : file.getId();
        return ResponseEntity.ok()
                .contentType(MediaType.valueOf(file.getType()))
                .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                .body(fileData);
    }
}
