-- Migration: Add OCR fields to aptech_exams table
-- Date: 2025-11-26
-- Purpose: Store OCR extraction results for verification and debugging

ALTER TABLE aptech_exams 
ADD COLUMN IF NOT EXISTS ocr_raw_text TEXT,
ADD COLUMN IF NOT EXISTS ocr_extracted_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS ocr_subject_code VARCHAR(100);

-- Add comment for documentation
COMMENT ON COLUMN aptech_exams.ocr_raw_text IS 'Full OCR extracted text from certificate image for debugging';
COMMENT ON COLUMN aptech_exams.ocr_extracted_name IS 'Teacher name extracted from OCR for verification';
COMMENT ON COLUMN aptech_exams.ocr_subject_code IS 'Subject code/name extracted from OCR for verification';
