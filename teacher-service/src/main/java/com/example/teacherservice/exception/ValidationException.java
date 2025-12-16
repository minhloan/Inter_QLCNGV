package com.example.teacherservice.exception;

import lombok.Builder;
import lombok.Getter;

import java.util.Map;

@Builder
@Getter
public class ValidationException extends RuntimeException {
    private Map<String, String> validationErrors;

    public ValidationException(Map<String, String> validationErrors) {
        super("Validation error");
        this.validationErrors = validationErrors;
    }
}

