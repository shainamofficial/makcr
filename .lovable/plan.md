

# Fix Clickable Links in PDF & Improve A4 Margins

## Problems

1. **Links not clickable in PDF** — `html2canvas` rasterizes the DOM into a flat image, destroying all interactivity. Links become pixels. This is a fundamental limitation — the only fix is to overlay invisible PDF link annotations on top of the image using `jsPDF.link()`.

2. **Margins/sizing for A4** — Templates use `width: "8.5in"` (US Letter) and the PDF export uses Letter dimensions (215.9 × 279.4mm). Standard A4 (210 × 297mm) is narrower and taller. Templates need to target A4 and the export needs A4 dimensions with proper margins.

## Solution

### Part 1: Make project URL pills clickable in the PDF

After rendering the html2canvas image onto the PDF, scan the source DOM for all URL pill elements, calculate their position relative to the container, convert to PDF coordinates, and add invisible `jsPDF.link()` rectangles on top. This makes the links clickable in the downloaded PDF.

**`src/lib/export-pdf.ts`** changes:
- After `addImage`, query all `[data-pdf-url]` elements from the source DOM
- Calculate each element's bounding rect relative to the container
- Map pixel coordinates → PDF mm coordinates (accounting for scale, margins, and page offsets)
- Call `pdf.link(x, y, w, h, { url })` for each

**All 20 templates** — add `data-pdf-url={url}` attribute to each `UrlPill` span so the export function can discover them and their target URLs.

### Part 2: Switch to A4 sizing

**`src/lib/export-pdf.ts`**:
- Change page format from `"letter"` to `"a4"`
- Update dimensions: `pageWidth = 210`, `pageHeight = 297`
- Increase margin from `10` to `15mm` for better aesthetics

**All 20 templates** — change container `width` from `"8.5in"` to `"210mm"` (or `"8.27in"`) and `minHeight` from `"11in"` to `"297mm"` (or `"11.69in"`), and adjust internal padding to `"15mm"` or equivalent for consistent margins.

### Part 3: Refined UrlPill component

Update the shared `UrlPill` pattern across all templates to include the `data-pdf-url` attribute and use `<a>` tag for on-screen clickability too:

```tsx
function UrlPill({ url, color }: { url: string; color: string }) {
  return (
    <a href={url} target="_blank" rel="noopener noreferrer"
       data-pdf-url={url}
       style={{
         display: "inline-flex", alignItems: "center", gap: 3,
         padding: "1px 8px", borderRadius: 9999,
         border: `1px solid ${color}`, color, fontSize: 9,
         lineHeight: "18px", verticalAlign: "middle",
         textDecoration: "none",
       }}>
      {"↗ "}{url.replace(/^https?:\/\//, "").replace(/\/$/, "")}
    </a>
  );
}
```

## Files Changed

| File | Change |
|------|--------|
| `src/lib/export-pdf.ts` | Switch to A4, 15mm margins, add link overlay logic scanning `[data-pdf-url]` elements |
| All 20 template files | Change container to A4 dimensions, update padding, change `UrlPill` to `<a>` with `data-pdf-url` |

