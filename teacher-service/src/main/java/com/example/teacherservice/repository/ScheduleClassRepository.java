package com.example.teacherservice.repository;

import com.example.teacherservice.model.ScheduleClass;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface ScheduleClassRepository extends JpaRepository<ScheduleClass, String> {
}
