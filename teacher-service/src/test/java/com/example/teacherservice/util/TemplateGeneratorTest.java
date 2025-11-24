package com.example.teacherservice.util;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

import java.io.IOException;

@SpringBootTest
public class TemplateGeneratorTest {

    @Test
    public void generateTemplates() throws IOException {
        TemplateGenerator generator = new TemplateGenerator();
        
        // Generate BM06.39 template
        String basePath = "src/main/resources/templates/";
        generator.generateBM0639Template(basePath + "BM06.39-template.docx");
        System.out.println("✓ Đã tạo BM06.39-template.docx");
        
        // Generate BM06.41 template
        generator.generateBM0641Template(basePath + "BM06.41-template.doc");
        System.out.println("✓ Đã tạo BM06.41-template.doc");
        
        System.out.println("\n✓ Hoàn thành! Mở file trong Word để chỉnh sửa format nếu cần.");
    }
}

