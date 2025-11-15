package com.example.teacherservice.dto.log;

import com.example.teacherservice.dto.user.UserDto;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@JsonInclude(JsonInclude.Include.NON_NULL)
public class AuditLogDto {
    private String id;
    private String action;
    private String entity;
    private UserDto actorUser;
    private LocalDateTime creationTimestamp;
}