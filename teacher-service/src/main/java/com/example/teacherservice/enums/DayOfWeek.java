package com.example.teacherservice.enums;

// DayOfWeek
public enum DayOfWeek {
    MONDAY(2),
    TUESDAY(3),
    WEDNESDAY(4),
    THURSDAY(5),
    FRIDAY(6),
    SATURDAY(7),
    SUNDAY(1);

    private final int dayNumber;

    DayOfWeek(int dayNumber) {
        this.dayNumber = dayNumber;
    }
    public int getDayNumber() { return dayNumber; }
}
