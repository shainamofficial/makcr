

# Replace URL Pills with Inline Text Links & Fix PDF Clickability

## Problems

1. **Pills look bad** — Bordered pill badges with `↗` arrows take up too much space, misalign vertically, and look cluttered next to project descriptions.
2. **Links not clickable in PDF** — The coordinate mapping in `export-pdf.ts` converts link positions from mm back to px then back to mm, introducing rounding errors. The `collectPdfLinks` function calculates coordinates in mm (via `scaleX/scaleY`), but then the overlay code converts them back to px — double conversion breaks positioning.

## Solution

### 1. Replace UrlPill with inline underlined text

Instead of pill badges, render project URLs as simple **underlined text** appended after the project description, like professional resumes do:

```
ProjectName — Description text here. github.com/user/repo · demo.example.com
```

Each URL is a subtle, colored, underlined `<a>` tag (no border, no pill shape, no ↗ icon). This is cleaner, takes less space, and reads naturally.

### 2. Fix PDF link coordinate math

The bug: `collectPdfLinks` returns coordinates already in **PDF mm** (scaled by `imgWidth/containerRect.width`). But the overlay loop then treats `link.y` as mm and converts it *again* through `(linkYInImage / imgHeight) * canvas.height` — a mm→px conversion that produces wrong values.

**Fix**: Collect link positions in **pixel space** (relative to container, in CSS pixels), then convert to PDF coordinates once during the overlay step. This single-conversion approach eliminates the double-mapping error.

## Files Changed

| File | Change |
|------|--------|
| `src/lib/export-pdf.ts` | Fix `collectPdfLinks` to return CSS-pixel coordinates; fix overlay loop to do a single px→mm conversion per link |
| All 20 template files | Replace `UrlPill` component with inline underlined `<a>` tags after project description, keeping `data-pdf-url` attribute |

### Template URL rendering (all 20 files)

Before:
```tsx
<div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
  {p.urls.map((u, j) => <UrlPill key={j} url={u} color={accent} />)}
</div>
```

After:
```tsx
// URLs rendered inline after description
<p style={{ fontSize: 11, margin: "2px 0 0", lineHeight: 1.6 }}>
  {p.description}
  {p.urls?.length > 0 && (
    <span style={{ marginLeft: 6 }}>
      {p.urls.map((u, j) => (
        <span key={j}>
          {j > 0 && " · "}
          <a href={u} target="_blank" rel="noopener noreferrer" data-pdf-url={u}
             style={{ color: accent, textDecoration: "underline", fontSize: 10 }}>
            {u.replace(/^https?:\/\//, "").replace(/\/$/, "")}
          </a>
        </span>
      ))}
    </span>
  )}
</p>
```

### PDF export fix (`export-pdf.ts`)

```typescript
// collectPdfLinks returns CSS-pixel positions (not mm)
function collectPdfLinks(element: HTMLElement, containerRect: DOMRect): PdfLinkRect[] {
  const links: PdfLinkRect[] = [];
  const els = element.querySelectorAll<HTMLElement>("[data-pdf-url]");
  for (const el of els) {
    const url = el.getAttribute("data-pdf-url");
    if (!url) continue;
    const rect = el.getBoundingClientRect();
    links.push({
      url,
      x: rect.left - containerRect.left,  // CSS pixels
      y: rect.top - containerRect.top,      // CSS pixels
      w: rect.width,
      h: rect.height,
    });
  }
  return links;
}

// In overlay loop — single conversion from CSS px → PDF mm
const pdfLinks = collectPdfLinks(element, containerRect);
const cssToMmX = imgWidth / containerRect.width;   // mm per CSS px
const cssToMmY = imgHeight / containerRect.height;
const cssPxPerPage = containerRect.height * (usableHeight / imgHeight);

for (const link of pdfLinks) {
  const pageIdx = Math.floor(link.y / cssPxPerPage);
  const yOnPage = link.y - pageIdx * cssPxPerPage;
  const linkX = margin + link.x * cssToMmX;
  const linkY = margin + yOnPage * cssToMmY;
  const linkW = link.w * cssToMmX;
  const linkH = link.h * cssToMmY;

  if (pageIdx < pdf.getNumberOfPages()) {
    pdf.setPage(pageIdx + 1);
    pdf.link(linkX, linkY, linkW, linkH, { url: link.url });
  }
}
```

