

## Problem

The interview completes (session topic = "completed"), but **zero data is written to the database**. All tables (work_experience, education, skills, projects, company) have 0 rows. This is why both Profile and Resumes pages show empty/insufficient data states.

### Root Cause

The `chat` edge function attempts to write `extracted_data` from Claude's responses directly into DB tables (lines 234-291), but this fails silently because:

1. **Schema mismatch**: Claude returns fields like `company_name`, `job_title`, `is_current` — but the actual DB columns are `company_id` (FK), `title`, etc.
2. **Foreign key lookups never happen**: The `requires_lookup` field in Claude's response is defined but completely ignored in the code. Work experience requires a `company_id` FK, education requires `institution_id`, `degree_id`, `discipline_id` FKs — none of these are resolved.
3. **Silent failures**: All DB insert errors are caught and logged with `console.error` but never surface to the user or retry.

Evidence from the DB: the structured_data_extracted in chat messages contains data like `{"company_name":"Nivoda","job_title":"Group Product Manager"}` which doesn't match the `work_experience` table schema at all.

## Plan

### 1. Rewrite the data extraction logic in `supabase/functions/chat/index.ts`

Replace the naive switch/insert block (lines 234-291) with a proper entity resolution pipeline:

**For each extracted_data entry:**
- **company**: Upsert by name → return `id`
- **institution**: Upsert by name → return `id`  
- **degree**: Upsert by name → return `id`
- **discipline**: Upsert by name → return `id`
- **skill**: Upsert by name → return `id`
- **work_experience**: First resolve `company_id` via company name lookup/create, then map AI fields (`job_title`→`title`, `company_name`→lookup) and insert with proper FKs
- **work_experience_points**: Resolve `work_experience_id` by matching title+company, then insert
- **education**: Resolve `institution_id`, `degree_id`, `discipline_id` via lookups, then insert
- **user_skill_mapping**: Resolve `skill_id` via skill name lookup/create, then insert
- **project**: Insert directly with `user_id`

**Helper functions to add:**
- `findOrCreateCompany(supabase, name)` → returns UUID
- `findOrCreateInstitution(supabase, name, type)` → returns UUID
- `findOrCreateDegree(supabase, name)` → returns UUID
- `findOrCreateDiscipline(supabase, name)` → returns UUID
- `findOrCreateSkill(supabase, name, category)` → returns UUID

Each does: SELECT by name (case-insensitive) → if not found, INSERT → return id.

### 2. Update the system prompt to standardize Claude's output field names

Add explicit field name mappings in the system prompt so Claude returns consistent, predictable field names that align with our processing logic:

```
For extracted_data, use these exact field structures:
- work_experience: { company_name, title, start_date, end_date, description }
- work_experience_points: { work_experience_title, company_name, details, impact }
- education: { institution_name, institution_type, degree_name, discipline_name, start_date, end_date }
- user_skill_mapping: { skill_name, category, proficiency, years_of_experience }
- project: { title, description, project_urls, start_date, end_date }
```

### 3. Add duplicate prevention

Before inserting work_experience, check if a record with the same `user_id + company_id + title + start_date` already exists. Same for education and skills. This prevents the duplicates the AI keeps creating (visible in the extracted_data — it re-extracts the same work experience multiple times).

### 4. Update the `user` profile table

When the interview reaches "completed" status, update the user's `first_name`, `last_name`, and `profile_summary` if Claude extracted them during the conversation. Currently nothing writes to the `user` table.

### Technical Summary

- **File changed**: `supabase/functions/chat/index.ts` (major rewrite of lines 234-291, plus helper functions and system prompt update)
- **No DB schema changes needed** — the tables are correct, the edge function just isn't using them properly
- **Edge function redeploy** required after changes

