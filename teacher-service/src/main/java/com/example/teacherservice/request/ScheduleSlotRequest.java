package com.example.teacherservice.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ScheduleSlotRequest {
    private Integer dayOfWeek;
    private String startTime;
    private String endTime;
}
