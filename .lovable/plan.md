

# Deduplicate Work Experience Points — DB Cleanup + Prevention

## Problem
There are confirmed duplicate rows in `work_experience_points` where the same `(work_experience_id, details)` combination appears multiple times (up to 4x). This causes duplicate bullet points in the profile view.

## Solution

### 1. Delete duplicate rows from the database
Run a SQL migration that keeps only one row per `(work_experience_id, details)` pair — the oldest one (smallest `created_at`) — and deletes the rest.

```sql
DELETE FROM work_experience_points
WHERE id NOT IN (
  SELECT DISTINCT ON (work_experience_id, details) id
  FROM work_experience_points
  ORDER BY work_experience_id, details, created_at ASC
);
```

### 2. Add a unique constraint to prevent future duplicates
```sql
ALTER TABLE work_experience_points
ADD CONSTRAINT unique_work_exp_point UNIQUE (work_experience_id, details);
```

### 3. Client-side dedup safeguard in `useProfileData.ts`
Deduplicate `work_experience_points` by `id` in the `workQuery` result, so even if edge cases occur, the UI never shows duplicates.

### Files changed
| File | Change |
|------|--------|
| Migration SQL | Delete duplicates + add unique constraint |
| `src/hooks/useProfileData.ts` | Deduplicate points in workQuery after fetch |

