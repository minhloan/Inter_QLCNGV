package com.example.teacherservice.exception;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.lang.NonNull;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.validation.FieldError;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GeneralExceptionHandler extends ResponseEntityExceptionHandler {

    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  @NonNull HttpHeaders headers,
                                                                  @NonNull HttpStatus status,
                                                                  @NonNull WebRequest request) {
        System.out.println("Validation failed for request");
        System.out.println("Errors: " + ex.getBindingResult().getAllErrors());
        
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors()
                .forEach(x -> errors.put(((FieldError) x).getField(), x.getDefaultMessage()));
        return ResponseEntity.badRequest().body(errors);
    }
    
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                                                                  @NonNull HttpHeaders headers,
                                                                  @NonNull HttpStatus status,
                                                                  @NonNull WebRequest request) {
        System.out.println("HttpMessageNotReadableException: " + ex.getMessage());
        Map<String, String> errors = new HashMap<>();
        errors.put("error", "Invalid request content. Please check your input format.");
        return ResponseEntity.badRequest().body(errors);
    }

    @ExceptionHandler(GenericErrorResponse.class)
    public ResponseEntity<?> genericError(GenericErrorResponse exception) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", exception.getMessage());
        return new ResponseEntity<>(errors, exception.getHttpStatus());
    }

    @ExceptionHandler(NotFoundException.class)
    public ResponseEntity<?> notFoundException(NotFoundException exception) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", exception.getMessage());
        return new ResponseEntity<>(errors, HttpStatus.NOT_FOUND);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<?> unauthorizedException(UnauthorizedException exception) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", exception.getMessage());
        return new ResponseEntity<>(errors, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(WrongCredentialsException.class)
    public ResponseEntity<?> wrongCredentialsException(WrongCredentialsException exception) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", exception.getMessage());
        return new ResponseEntity<>(errors, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<?> accessDeniedException(AccessDeniedException exception) {
        Map<String, String> errors = new HashMap<>();
        errors.put("error", exception.getMessage());
        return new ResponseEntity<>(errors, HttpStatus.FORBIDDEN);
    }
    
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> illegalArgumentException(IllegalArgumentException exception) {
        Map<String, String> errors = new HashMap<>();
        String message = exception.getMessage();
        errors.put("error", message);
        
        if (message != null && message.contains("Email already exists")) {
            return new ResponseEntity<>(errors, HttpStatus.CONFLICT);
        }
        
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(ValidationException.class)
    public ResponseEntity<?> handleValidationException(ValidationException exception) {
        Map<String, String> errors = exception.getValidationErrors();
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
        
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<?> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        Map<String, String> errors = new HashMap<>();
        String message = ex.getMessage();

        // Check for duplicate entry in general (email or other unique constraints)
        if (message != null && message.contains("Duplicate entry")) {
            if (message.contains("email") || message.contains("Email")) {
                errors.put("error", "Email already exists");
            } else {
                errors.put("error", "Duplicate entry. This value already exists");
            }
            return new ResponseEntity<>(errors, HttpStatus.CONFLICT);
        }
        
        // Generic constraint violation
        errors.put("error", "Data integrity violation: " + (message != null ? message : "Invalid data"));
        return new ResponseEntity<>(errors, HttpStatus.CONFLICT);
    }
    
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<?> handleRuntimeException(RuntimeException ex) {
        System.out.println("RuntimeException caught: " + ex.getMessage());
        ex.printStackTrace();
        
        Map<String, String> errors = new HashMap<>();
        String message = ex.getMessage();
        
        if (message != null && message.contains("Authorization") && message.contains("missing or invalid")) {
            errors.put("error", "Authorization header is missing or invalid");
            return new ResponseEntity<>(errors, HttpStatus.UNAUTHORIZED);
        }
        
        errors.put("error", message);
        return new ResponseEntity<>(errors, HttpStatus.BAD_REQUEST);
    }
    
    @ExceptionHandler(Exception.class)
    public final ResponseEntity<?> handleAllException(Exception ex) {
        System.out.println("Exception caught: " + ex.getClass().getName());
        System.out.println("Exception message: " + ex.getMessage());
        ex.printStackTrace();
        
        Map<String, String> errors = new HashMap<>();
        String message = ex.getMessage();
        if (message == null || message.isEmpty()) {
            message = "An unexpected error occurred: " + ex.getClass().getSimpleName();
        }
        errors.put("error", message);
        return new ResponseEntity<>(errors, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}

