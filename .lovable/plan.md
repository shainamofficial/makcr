

# Fix URL Pills & Add Section Order Customization

## Two Issues

1. **URL pills misaligned** — The `UrlPill` component uses `display: inline-block` with `marginTop: 4` causing vertical misalignment. The wrapper `div` doesn't have proper flex alignment, so pills float awkwardly relative to project text.

2. **No section ordering control** — Users can't choose whether Projects, Work Experience, Education, or Skills come first/second/third.

## Solution

### Part 1: Fix UrlPill across all 20 templates

Replace the current pill pattern with a properly aligned flex-wrap container and cleaner pill styling:

```tsx
function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 3,
      padding: "1px 8px", borderRadius: 9999, 
      border: `1px solid ${color}`, color, fontSize: 9,
      lineHeight: "18px", verticalAlign: "middle",
    }}>
      {"↗ "}{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </span>
  );
}
```

And the wrapper changes from `<div style={{ marginTop: 4 }}>` to:

```tsx
<div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
```

This fix applies to all 20 template files.

### Part 2: Add section ordering to ResumeData + templates

**`src/components/resumes/templates/types.ts`** — Add optional `sectionOrder` prop:
```ts
sectionOrder?: string[];  // e.g. ["summary","projects","work","education","skills"]
```

Default order: `["summary", "work", "projects", "education", "skills"]`

**All 20 templates** — Refactor each template's body sections into a map of named render functions, then iterate `sectionOrder` to render them in order:

```tsx
const sections: Record<string, () => JSX.Element | null> = {
  summary: () => summary ? <section>...</section> : null,
  work: () => grouped.length > 0 ? <section>...</section> : null,
  projects: () => projects.length > 0 ? <section>...</section> : null,
  education: () => education.length > 0 ? <section>...</section> : null,
  skills: () => Object.keys(groupedSkills).length > 0 ? <section>...</section> : null,
};
const order = sectionOrder ?? ["summary", "work", "projects", "education", "skills"];
// render: order.map(key => sections[key]?.())
```

**`src/components/resumes/GenerateResumeTab.tsx`** — Add a drag-to-reorder or simple up/down arrow UI for section ordering:
- Default order state: `["summary", "projects", "work", "education", "skills"]` (projects before work by default)
- Each item shows a label with up/down buttons to reorder
- Pass `sectionOrder` into `transformResumeContent` and through to `ResumeData`
- Also pass it to `SAMPLE_RESUME_DATA` for template previews

## Files Changed

| File | Change |
|------|--------|
| `src/components/resumes/templates/types.ts` | Add `sectionOrder?: string[]` |
| All 20 template files | Fix UrlPill alignment + render sections via `sectionOrder` |
| `src/components/resumes/GenerateResumeTab.tsx` | Add section order UI + pass to resume data |

