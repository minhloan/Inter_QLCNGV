package com.example.teacherservice.util;

import org.apache.poi.ss.usermodel.Cell;
import org.apache.poi.ss.usermodel.DataFormatter;
import org.apache.poi.ss.usermodel.FormulaEvaluator;
import org.apache.poi.ss.usermodel.Row;

public class ExcelUtils {

    private static final DataFormatter FORMATTER = new DataFormatter();

    public static String getString(Row row, Integer index) {
        try {
            if (index == null) return null;
            Cell cell = row.getCell(index);
            if (cell == null) return null;

            FormulaEvaluator evaluator = row.getSheet().getWorkbook()
                    .getCreationHelper()
                    .createFormulaEvaluator();

            String value = FORMATTER.formatCellValue(cell, evaluator);
            return value != null ? value.trim() : null;

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
