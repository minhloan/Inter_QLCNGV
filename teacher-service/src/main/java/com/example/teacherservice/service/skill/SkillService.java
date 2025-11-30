package com.example.teacherservice.service.skill;

import com.example.teacherservice.model.Skill;
import java.util.List;

public interface SkillService {
    
    List<Skill> getAllSkills();
    
    Skill getSkillById(String id);
    
    Skill createSkill(Skill skill);
    
    Skill updateSkill(String id, Skill skill);
    
    void deleteSkill(String id);
    
    Skill toggleIsNew(String id, Boolean isNew);
}
