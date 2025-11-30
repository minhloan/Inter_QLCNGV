package com.example.teacherservice.service.skill;

import com.example.teacherservice.exception.NotFoundException;
import com.example.teacherservice.model.Skill;
import com.example.teacherservice.repository.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SkillServiceImpl implements SkillService {

    private final SkillRepository skillRepository;

    @Override
    public List<Skill> getAllSkills() {
        return skillRepository.findAll();
    }

    @Override
    public Skill getSkillById(String id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Skill not found with id: " + id));
    }

    @Override
    @Transactional
    public Skill createSkill(Skill skill) {
        // Validate skill code is unique
        if (skill.getSkillCode() != null) {
            skillRepository.findBySkillCode(skill.getSkillCode()).ifPresent(existing -> {
                throw new IllegalArgumentException("Skill code already exists: " + skill.getSkillCode());
            });
        }
        
        // Set defaults
        if (skill.getIsActive() == null) {
            skill.setIsActive(true);
        }
        if (skill.getIsNew() == null) {
            skill.setIsNew(false);
        }
        
        return skillRepository.save(skill);
    }

    @Override
    @Transactional
    public Skill updateSkill(String id, Skill skill) {
        Skill existing = getSkillById(id);
        
        // Update fields
        if (skill.getSkillCode() != null) {
            // Check if new code conflicts with another skill
            skillRepository.findBySkillCode(skill.getSkillCode()).ifPresent(other -> {
                if (!other.getId().equals(id)) {
                    throw new IllegalArgumentException("Skill code already exists: " + skill.getSkillCode());
                }
            });
            existing.setSkillCode(skill.getSkillCode());
        }
        
        if (skill.getSkillName() != null) {
            existing.setSkillName(skill.getSkillName());
        }
        
        if (skill.getIsActive() != null) {
            existing.setIsActive(skill.getIsActive());
        }
        
        if (skill.getIsNew() != null) {
            existing.setIsNew(skill.getIsNew());
        }
        
        return skillRepository.save(existing);
    }

    @Override
    @Transactional
    public void deleteSkill(String id) {
        Skill skill = getSkillById(id);
        skillRepository.delete(skill);
    }

    @Override
    @Transactional
    public Skill toggleIsNew(String id, Boolean isNew) {
        Skill skill = getSkillById(id);
        skill.setIsNew(isNew);
        return skillRepository.save(skill);
    }
}
