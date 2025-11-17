package com.example.teacherservice.response;

import lombok.*;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeachingEligibilityResponse {
    private boolean eligible;
    private List<String> missingConditions;
}