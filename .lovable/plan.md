

# Modernize All 20 Resume Templates

## Problems Identified

1. **Word spacing collapse** -- All templates use inline `fontFamily` but lack explicit `wordSpacing`, causing words to run together (especially in PDF export via html2canvas).
2. **Projects section is weak** -- Most templates show project URLs as plain text or omit them entirely. No visual emphasis on portfolio links/apps.
3. **Dated aesthetics** -- Serif fonts (Georgia, Times New Roman), heavy HR rules, basic layouts. No modern design patterns like gradient accents, pill badges, subtle shadows, or clean sans-serif typography.

## Solution

Rewrite all 20 template files with these consistent improvements, while keeping each template's unique visual identity.

### Global fixes (applied to every template)

- Add `wordSpacing: "0.05em"` on the root container `div` to prevent word collapse
- Add `lineHeight: 1.5` minimum on all body text
- Switch default fonts from serif to modern sans-serif (Inter, system-ui) except where serif is intentional (Elegant, Academic)
- Ensure all `<li>` elements have `marginBottom: 2` for breathing room

### Projects section overhaul (applied to every template)

- Show each project as a mini-card with title, description, and clickable link pills
- URLs rendered as styled pill badges with a link icon character, colored in the template's accent color
- If no URLs, gracefully fall back to just title + description
- Projects section moved higher in layout order (after Experience, before Education) in most templates

### Template-by-template modernization

| Template | Key Design Changes |
|----------|-------------------|
| **Classic** | Drop Georgia for Inter. Replace HR rules with thin accent-colored lines. Clean single-column. |
| **Modern** | Keep two-column sidebar. Refresh sidebar color to a modern slate-blue. Add gradient header strip. |
| **Minimal** | Ultra-clean with generous whitespace. Thin weight headings. Muted accent line. |
| **Executive** | Keep navy header but modernize with a subtle gradient. Gold accent updated to a warm amber. |
| **Professional** | Keep sidebar but lighten background. Add rounded skill pills instead of plain text. |
| **Creative** | Keep coral accent. Add rounded project cards with shadows. Gradient divider. |
| **Elegant** | Keep centered layout + serif font (Playfair Display feel). Refined gold accent. |
| **Bold** | Keep heavy typography. Modernize with dark accent bar and clean geometric section dividers. |
| **Tech** | Keep terminal aesthetic. Modernize with a refined dark header. Projects show as "repo cards." |
| **Academic** | Keep serif for academic feel. Cleaner section dividers. Publication-style project entries with URLs. |
| **Compact** | Tighten layout but improve readability. Micro-pill skills. |
| **TwoColumn** | Keep split layout. Add subtle column separator. Project cards in left column. |
| **Timeline** | Keep timeline dots. Modernize dot/line styling with gradient. |
| **Infographic** | Keep sidebar with skill bars. Remove emoji headers, use clean icons via text. Modernize colors. |
| **Nordic** | Keep light background. Emphasize whitespace. Thin blue accent line. |
| **Manhattan** | Keep dark sidebar. Refresh accent from red to a modern rose. Project link pills in main column. |
| **Diamond** | Keep teal + diamond indicators. Add dashed borders for project cards. |
| **Ribbon** | Keep ribbon headers. Modernize warm palette. Add URL pills in projects. |
| **Starter** | Keep green accent. Education-first layout. Prominent project showcase for new grads. |
| **Corporate** | Keep structured layout. Add subtle background cards for sections. Clean navy palette. |

### Project URL rendering pattern (shared across all templates)

```text
[Project Title]         bold, 12px
Description text        11px, muted color
[🔗 github.com/user/repo] [🔗 myapp.com]   ← accent-colored pills, 10px
```

Each URL pill: `display: inline-block`, `padding: 2px 8px`, `borderRadius: 12`, `border: 1px solid accent`, `color: accent`, `fontSize: 10`, `marginRight: 6`, `marginTop: 4`.

## Files Changed

| File | Change |
|------|--------|
| `src/components/resumes/templates/ClassicTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/ModernTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/MinimalTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/ExecutiveTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/ProfessionalTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/CreativeTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/ElegantTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/BoldTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/TechTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/AcademicTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/CompactTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/TwoColumnTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/TimelineTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/InfographicTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/CorporateTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/StarterTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/NordicTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/ManhattanTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/DiamondTemplate.tsx` | Full rewrite |
| `src/components/resumes/templates/RibbonTemplate.tsx` | Full rewrite |

No changes to `types.ts`, `index.ts`, `groupWorkByCompany.ts`, `fmtDate.ts`, or `ResumePreview.tsx` -- all templates keep the same `ResumeData` props interface.

