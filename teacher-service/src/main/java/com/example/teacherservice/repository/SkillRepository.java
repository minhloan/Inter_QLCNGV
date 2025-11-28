package com.example.teacherservice.repository;

import com.example.teacherservice.model.Skill;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SkillRepository extends JpaRepository<Skill, String> {

    Optional<Skill> findBySkillCode(String skillCode);

    Optional<Skill> findBySkillCodeIgnoreCase(String skillCode);

    List<Skill> findAllByIsActiveTrue();

    List<Skill> findAllByOrderBySkillCodeAsc();

    boolean existsBySkillCode(String skillCode);
}
