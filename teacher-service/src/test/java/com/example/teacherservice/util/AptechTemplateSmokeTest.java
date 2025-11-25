package com.example.teacherservice.util;

import org.apache.poi.xwpf.usermodel.XWPFDocument;
import org.junit.jupiter.api.Test;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class AptechTemplateSmokeTest {

    @Test
    void bm0635TemplateLoads() {
        Path template = Path.of("src/main/resources/templates/BM06.35-template.docx");
        assertDoesNotThrow(() -> loadTemplate(template));
    }

    @Test
    void bm0636TemplateLoads() {
        Path template = Path.of("src/main/resources/templates/BM06.36-template.docx");
        assertDoesNotThrow(() -> loadTemplate(template));
    }

    private void loadTemplate(Path template) throws IOException {
        try (XWPFDocument ignored = new XWPFDocument(Files.newInputStream(template))) {
            // no-op
        }
    }
}

