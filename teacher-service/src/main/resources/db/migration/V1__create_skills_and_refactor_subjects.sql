-- Migration script for Skill entity refactoring
-- Author: System
-- Date: 2025-11-28
-- Description: Creates skills table, migrates data from subjects, and updates subject schema

-- Step 1: Create skills table
CREATE TABLE skills (
    id VARCHAR(255) NOT NULL PRIMARY KEY,
    skill_code VARCHAR(50) NOT NULL,
    skill_name VARCHAR(500),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    creation_timestamp DATETIME(6),
    update_timestamp DATETIME(6),
    CONSTRAINT uk_skill_code UNIQUE (skill_code)
);

-- Create indexes
CREATE INDEX idx_skill_code ON skills(skill_code);
CREATE INDEX idx_skill_is_active ON skills(is_active);

-- Step 2: Extract unique skills from subjects table and insert into skills table
INSERT INTO skills (id, skill_code, skill_name, is_active, creation_timestamp, update_timestamp)
SELECT 
    UUID() as id,
    subject_code as skill_code,
    description as skill_name,
    TRUE as is_active,
    NOW() as creation_timestamp,
    NOW() as update_timestamp
FROM (
    SELECT DISTINCT 
        subject_code,
        FIRST_VALUE(description) OVER (PARTITION BY subject_code ORDER BY creation_timestamp DESC) as description
    FROM subjects
    WHERE subject_code IS NOT NULL
) AS unique_skills;



-- Step 3: Add skill_id column to subjects table
ALTER TABLE subjects 
ADD COLUMN skill_id VARCHAR(255) AFTER id;

-- Step 4: Create index on skill_id (before adding FK constraint for better performance)
CREATE INDEX idx_skill_id ON subjects(skill_id);

-- Step 5: Populate skill_id in subjects by matching subject_code to skill_code
UPDATE subjects s
INNER JOIN skills sk ON s.subject_code = sk.skill_code
SET s.skill_id = sk.id;

-- Step 6: Add foreign key constraint
ALTER TABLE subjects
ADD CONSTRAINT fk_subject_skill FOREIGN KEY (skill_id) REFERENCES skills(id);

-- Step 7: Drop old columns (subject_code and description)
-- IMPORTANT: Backup data before running this step!
ALTER TABLE subjects DROP COLUMN subject_code;
ALTER TABLE subjects DROP COLUMN description;

-- Step 8: Drop old index
DROP INDEX idx_subject_code ON subjects;

-- Verification queries (run these after migration):
-- 1. Check all skills created
-- SELECT COUNT(*) as total_skills FROM skills;

-- 2. Check subjects have skill_id populated
-- SELECT COUNT(*) as subjects_with_skill FROM subjects WHERE skill_id IS NOT NULL;
-- SELECT COUNT(*) as subjects_without_skill FROM subjects WHERE skill_id IS NULL;

-- 3. View sample data
-- SELECT s.subject_name, sk.skill_code, sk.skill_name 
-- FROM subjects s 
-- LEFT JOIN skills sk ON s.skill_id = sk.id 
-- LIMIT 10;
