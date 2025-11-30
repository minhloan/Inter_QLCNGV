package com.example.teacherservice.controller;

import com.example.teacherservice.model.Skill;
import com.example.teacherservice.service.skill.SkillService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/v1/teacher/skill")
public class SkillController {

    private final SkillService skillService;

    /**
     * GET /v1/teacher/skill - Get all skills
     */
    @GetMapping
    public ResponseEntity<List<Skill>> getAllSkills() {
        List<Skill> skills = skillService.getAllSkills();
        return ResponseEntity.ok(skills);
    }

    /**
     * GET /v1/teacher/skill/{id} - Get skill by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<Skill> getSkillById(@PathVariable String id) {
        Skill skill = skillService.getSkillById(id);
        return ResponseEntity.ok(skill);
    }

    /**
     * POST /v1/teacher/skill - Create new skill
     */
    @PostMapping
    public ResponseEntity<Skill> createSkill(@RequestBody Skill skill) {
        Skill created = skillService.createSkill(skill);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /v1/teacher/skill/{id} - Update skill
     */
    @PutMapping("/{id}")
    public ResponseEntity<Skill> updateSkill(@PathVariable String id, @RequestBody Skill skill) {
        Skill updated = skillService.updateSkill(id, skill);
        return ResponseEntity.ok(updated);
    }

    /**
     * DELETE /v1/teacher/skill/{id} - Delete skill
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSkill(@PathVariable String id) {
        skillService.deleteSkill(id);
        return ResponseEntity.noContent().build();
    }

    /**
     * PATCH /v1/teacher/skill/{id}/toggle-new - Toggle isNew flag
     */
    @PatchMapping("/{id}/toggle-new")
    public ResponseEntity<Skill> toggleIsNew(
            @PathVariable String id,
            @RequestBody Map<String, Boolean> request
    ) {
        Boolean isNew = request.get("isNew");
        if (isNew == null) {
            throw new IllegalArgumentException("isNew field is required");
        }
        Skill updated = skillService.toggleIsNew(id, isNew);
        return ResponseEntity.ok(updated);
    }
}
