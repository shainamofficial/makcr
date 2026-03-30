

# Fix Hero Layout + Group Work Experiences by Company

## Problem
1. The Hero layout is visually weak -- it's just a gradient box around the same `ProfileHeader` component, with no real "hero" feel (no larger typography, no visual impact)
2. Work experiences with the same company appear as separate cards/entries everywhere (profile layouts and resume templates), instead of being grouped under one company heading with multiple roles

## Plan

### 1. Redesign HeroLayout component
**File**: `src/components/profile/layouts/HeroLayout.tsx`

- Replace the simple gradient wrapper with a proper hero design:
  - Full-width gradient banner with larger avatar (size 28/32), bigger name typography (text-4xl), and email/badge inline
  - Summary text displayed prominently inside the banner area
  - Remove the generic `ProfileHeader` reuse -- inline a hero-specific header with photo upload support (reuse the upload logic, but custom layout)
  - Subtle decorative elements (e.g. a pattern or accent shape)
- Keep the two-column body grid but add card styling to the sidebar column

### 2. Group work experiences by company in profile
**File**: `src/components/profile/WorkExperienceSection.tsx`

- Add a `groupByCompany` utility that groups `data` entries by `company.id`
- Render each company as a single Card with the company name as the heading
- Under each company, list the individual roles (title, date range, bullet points) with edit/delete buttons per role
- The "Add" button stays at the section level

### 3. Group work experiences by company in resume templates
**Files**: All 19 template files in `src/components/resumes/templates/`

- Create a shared utility `src/components/resumes/templates/groupWorkByCompany.ts`:
  ```
  groupWorkByCompany(workExperiences) → { company, roles: { title, start_date, end_date, points }[] }[]
  ```
- Update each template to use this utility, rendering company name once with roles nested underneath
- The `ResumeData` type stays unchanged -- grouping is a display-time transformation

### 4. Group work experiences in resume data transformation
**File**: `src/components/resumes/GenerateResumeTab.tsx`

- No changes needed to the data type -- grouping happens at render time in the templates

### Files changed
| File | Change |
|------|--------|
| `src/components/profile/layouts/HeroLayout.tsx` | Full redesign with hero-style header |
| `src/components/profile/WorkExperienceSection.tsx` | Group roles under same company |
| `src/components/resumes/templates/groupWorkByCompany.ts` | New shared grouping utility |
| All 19 resume template files | Use grouped rendering for work experience |

