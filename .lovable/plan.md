

# Save Profile Display Templates

## What
Let users choose and save different visual layouts for their profile page — similar to how they pick resume templates, but for the profile view itself. For example: a "Classic" card-grid layout (current), a "Timeline" layout, a "Minimal" layout, etc.

## How

### 1. Create profile layout templates (client-side)
Build 3-4 layout variants as React components, each rendering the same profile data differently:

| Layout | Description |
|--------|-------------|
| **Classic** (current) | Card grid for work/education, badge chips for skills |
| **Timeline** | Vertical chronological timeline with a left border and dots |
| **Minimal** | Clean single-column, no cards, just text sections with subtle dividers |
| **Hero** | Large gradient banner header, two-column body (experience left, skills/education right) |

### 2. Add a `profile_layout` column to the `user` table
A simple text column (default `'classic'`) storing the user's chosen layout. No new table needed.

### 3. Update Profile page
- Add a small layout picker (icon buttons or dropdown) in the top-right of the profile page
- When the user selects a layout, save it to their profile and re-render with the chosen template
- Each layout component receives the same props (profile, work, education, skills, projects)

### 4. New files and changes

| File | Change |
|------|--------|
| `src/components/profile/layouts/ClassicLayout.tsx` | Extract current layout into its own component |
| `src/components/profile/layouts/TimelineLayout.tsx` | New timeline-style layout |
| `src/components/profile/layouts/MinimalLayout.tsx` | New minimal layout |
| `src/components/profile/layouts/HeroLayout.tsx` | New hero/two-column layout |
| `src/components/profile/LayoutPicker.tsx` | Small UI to switch between layouts |
| `src/pages/Profile.tsx` | Add layout picker, render selected layout component |
| **Migration** | `ALTER TABLE "user" ADD COLUMN profile_layout text NOT NULL DEFAULT 'classic'` |
| `src/hooks/useProfileData.ts` | Include `profile_layout` in profile query (already fetched via `select *`) |

### Technical notes
- All layout components share a common `ProfileLayoutProps` interface containing `profile`, `workData`, `educationData`, `skillsData`, `projectsData`
- The existing section components (WorkExperienceSection, EducationSection, etc.) are reused inside layouts — only the arrangement and styling wrapper changes
- Layout preference is saved via the existing `useUpdateProfile` mutation
- No new RLS policies needed — uses the existing `user` table update policy

