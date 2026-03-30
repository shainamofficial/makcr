

# Improve Profile Picture Support Across All 20 Resume Templates

## Problem
- 5 templates completely ignore the profile picture props (Minimal, Compact, Academic, Corporate, Starter)
- Classic template uses absolute positioning which overlaps the header text
- Several templates could benefit from better photo-name alignment and spacing

## Plan

### 1. Add profile picture support to the 5 missing templates

Each will get a photo placed naturally in its header area, matching the template's design language:

| Template | Photo placement |
|----------|----------------|
| **Minimal** | Small circle (50px) next to name in header, flex row |
| **Compact** | Small circle (40px) left of name in header row |
| **Academic** | Small circle (55px) centered above name |
| **Corporate** | Small circle (50px) left of name in header band |
| **Starter** | Small circle (55px) centered above name |

### 2. Fix Classic template photo overlap

Replace the absolute-positioned photo with a flex layout in the header so the name and photo sit side by side without overlap.

### Files to update (6 files)

- `src/components/resumes/templates/MinimalTemplate.tsx`
- `src/components/resumes/templates/CompactTemplate.tsx`
- `src/components/resumes/templates/AcademicTemplate.tsx`
- `src/components/resumes/templates/CorporateTemplate.tsx`
- `src/components/resumes/templates/StarterTemplate.tsx`
- `src/components/resumes/templates/ClassicTemplate.tsx`

