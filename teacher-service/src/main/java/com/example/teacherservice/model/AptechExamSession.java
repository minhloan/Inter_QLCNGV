package com.example.teacherservice.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "aptech_exam_sessions", indexes = {
    @Index(name = "idx_exam_date", columnList = "exam_date")
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AptechExamSession extends BaseEntity {
    @Column(name = "exam_date", nullable = false)
    private LocalDate examDate;

    @Column(name = "exam_time")
    private LocalTime examTime;

    @Column(name = "room", length = 50)
    private String room;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;
}

