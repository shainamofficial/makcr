

# Add 17 New Resume Templates (Total: 20)

## Overview
Create 17 new resume template React components following the same pattern as the existing 3 (Classic, Modern, Minimal). Each takes `ResumeData` props and renders a US Letter (8.5x11in) layout with inline styles. Then register them in the index and add them to the database.

## New Templates

Based on the most popular and effective resume designs used across top career platforms (Indeed, Canva, Zety, Novoresume, etc.):

| # | Name | Style Description |
|---|------|-------------------|
| 4 | **Executive** | Dark navy header band, serif font, gold accents. For senior roles. |
| 5 | **Professional** | Clean two-column, blue accent color bar on left, sans-serif. |
| 6 | **Creative** | Coral/orange accent, playful section dividers, rounded skill badges. |
| 7 | **Elegant** | Thin borders, muted gold/tan accents, generous whitespace. |
| 8 | **Bold** | Large bold headings, black accent blocks, high contrast. |
| 9 | **Tech** | Monospace code-style header, green terminal accent, dark theme header. |
| 10 | **Academic** | Traditional academic CV style, detailed education-first layout. |
| 11 | **Compact** | Dense single-column, smaller fonts, fits maximum content. |
| 12 | **Two-Column** | Equal two-column split, left for experience, right for skills/education. |
| 13 | **Timeline** | Vertical timeline line down the left with dot markers per entry. |
| 14 | **Infographic** | Skill bars, colored section icons, visual data representation. |
| 15 | **Corporate** | Conservative gray/navy, structured grid, no frills. |
| 16 | **Starter** | Entry-level focused, education-first, highlights projects. |
| 17 | **Nordic** | Scandinavian design: lots of whitespace, light blue accents, clean. |
| 18 | **Manhattan** | Sophisticated dark sidebar, white main area, strong typography. |
| 19 | **Diamond** | Diamond-shaped skill indicators, teal accent, geometric section borders. |
| 20 | **Ribbon** | Colored ribbon banners for section headers, warm earth tones. |

## Files to Create (17 new files)
- `src/components/resumes/templates/ExecutiveTemplate.tsx`
- `src/components/resumes/templates/ProfessionalTemplate.tsx`
- `src/components/resumes/templates/CreativeTemplate.tsx`
- `src/components/resumes/templates/ElegantTemplate.tsx`
- `src/components/resumes/templates/BoldTemplate.tsx`
- `src/components/resumes/templates/TechTemplate.tsx`
- `src/components/resumes/templates/AcademicTemplate.tsx`
- `src/components/resumes/templates/CompactTemplate.tsx`
- `src/components/resumes/templates/TwoColumnTemplate.tsx`
- `src/components/resumes/templates/TimelineTemplate.tsx`
- `src/components/resumes/templates/InfographicTemplate.tsx`
- `src/components/resumes/templates/CorporateTemplate.tsx`
- `src/components/resumes/templates/StarterTemplate.tsx`
- `src/components/resumes/templates/NordicTemplate.tsx`
- `src/components/resumes/templates/ManhattanTemplate.tsx`
- `src/components/resumes/templates/DiamondTemplate.tsx`
- `src/components/resumes/templates/RibbonTemplate.tsx`

## Files to Modify

### `src/components/resumes/templates/index.ts`
- Import all 17 new templates
- Update `getTemplateComponent()` with name matching for each
- Export all templates

### Database: `resume_template` table
- Insert 17 new rows with name, description, `is_active: true`

## Pattern
Each template follows the exact same contract:
- Default export function taking `ResumeData` props
- 8.5in x 11in container with inline styles
- Sections: header/name, contact, summary, work experience, education, skills, projects
- `fmtDate()` helper for date formatting
- Optional `includePhoto` + `profilePictureUrl` support

