
-- Step 1: Delete duplicate work_experience_points, keeping the oldest per (work_experience_id, details)
DELETE FROM work_experience_points
WHERE id NOT IN (
  SELECT DISTINCT ON (work_experience_id, details) id
  FROM work_experience_points
  ORDER BY work_experience_id, details, created_at ASC
);

-- Step 2: Add unique constraint to prevent future duplicates
ALTER TABLE work_experience_points
ADD CONSTRAINT unique_work_exp_point UNIQUE (work_experience_id, details);
