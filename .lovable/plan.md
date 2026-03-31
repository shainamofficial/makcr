

# Fix Resume PDF Page Borders

## Problem

The current `exportElementAsPdf` function renders the captured image at the full page width (215.9mm) starting at x=0, y=0 with no margins. This causes the resume content to bleed to the very edge of the PDF page, resulting in missing or improper page borders. Additionally, multi-page positioning math is incorrect, causing content to shift on subsequent pages.

## Solution

Add consistent margins around the image on every page and fix the multi-page slicing logic so content flows cleanly across page breaks.

## File: `src/lib/export-pdf.ts`

- Define a margin (e.g. 10mm) on all sides
- Calculate usable width/height as page dimensions minus 2x margin
- Scale the image to fit within the usable width
- Fix multi-page loop: on each subsequent page, offset the image so the correct slice is visible within the usable area

### Key change

```typescript
const margin = 10; // mm
const usableWidth = pageWidth - 2 * margin;
const usableHeight = pageHeight - 2 * margin;

const imgWidth = usableWidth;
const imgHeight = (canvas.height * imgWidth) / canvas.width;

let heightLeft = imgHeight;
let position = margin;

pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
heightLeft -= usableHeight;

while (heightLeft > 0) {
  position = margin - (imgHeight - heightLeft);
  pdf.addPage();
  pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
  heightLeft -= usableHeight;
}
```

| File | Change |
|------|--------|
| `src/lib/export-pdf.ts` | Add 10mm margins, fix multi-page position math |

