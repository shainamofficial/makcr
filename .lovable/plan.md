

# Fix "Invalid Date" and Missing Bullet Points in Resume Templates

## Problems

1. **"Invalid Date"**: The `fmtDate` function only handles `null`/falsy for "Present". But the AI-generated resume content or the `dates` string split can produce non-date strings (e.g., `"Present"`, `"Till Date"`, empty whitespace). Passing these to `new Date()` yields "Invalid Date".

2. **Missing bullet points**: Tailwind's Preflight CSS resets `<ul>` elements to `list-style: none` and removes padding/margin. The templates set `paddingLeft` inline but never set `listStyleType`, so bullet dots don't render.

## Fix

### Centralize `fmtDate` — new file `src/components/resumes/templates/fmtDate.ts`
Create a shared helper used by all 20 templates:
```typescript
export function fmtDate(d: string | null | undefined): string {
  if (!d) return "Present";
  const trimmed = d.trim();
  if (!trimmed) return "Present";
  const date = new Date(trimmed);
  if (isNaN(date.getTime())) return "Present";
  return date.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
```
This catches null, empty strings, non-date strings like "Present", and truly invalid dates — all return "Present".

### Fix bullet points — add `listStyleType: "disc"` to all `<ul>` elements
Every template that renders `<ul>` for work experience points needs `listStyleType: "disc"` in the inline style to override Tailwind's Preflight reset. This is a one-line addition per `<ul>` across all 20 templates.

### Files changed

| File | Change |
|------|--------|
| `src/components/resumes/templates/fmtDate.ts` | New shared date formatter with invalid-date guard |
| All 20 template files | Import shared `fmtDate`, remove local copy; add `listStyleType: "disc"` to `<ul>` styles |

