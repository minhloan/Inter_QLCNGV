package com.example.teacherservice.util;

import org.apache.poi.ss.usermodel.*;

public class ExcelUtils {

    public static String getString(Row row, Integer index) {
        try {
            if (index == null) return null;
            Cell cell = row.getCell(index);
            if (cell == null) return null;

            return switch (cell.getCellType()) {
                case STRING -> cell.getStringCellValue().trim();
                case NUMERIC -> String.valueOf((int) cell.getNumericCellValue());
                default -> String.valueOf(cell);
            };

        } catch (Exception e) {
            return null;
        }
    }

    public static Integer getInt(Row row, Integer index) {
        try {
            if (index == null) return null;
            Cell cell = row.getCell(index);
            if (cell == null) return null;

            return switch (cell.getCellType()) {
                case NUMERIC -> (int) cell.getNumericCellValue();
                case STRING -> Integer.parseInt(cell.getStringCellValue());
                default -> null;
            };

        } catch (Exception e) {
            return null;
        }
    }
}
