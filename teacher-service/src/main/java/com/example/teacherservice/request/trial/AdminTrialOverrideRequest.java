package com.example.teacherservice.request.trial;

import com.example.teacherservice.enums.TrialConclusion;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AdminTrialOverrideRequest {
    private TrialConclusion finalResult;
    private String resultNote;
}
