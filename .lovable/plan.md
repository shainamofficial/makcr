

# Fix PDF Page Breaks (Line Repetition) & Clickable Links

## Root Cause Analysis

### 1. Line Repetition Across Pages
The current approach renders the entire resume as **one large image**, then places that same full image on every page with a negative Y offset to simulate pagination:
```
position = margin - (imgHeight - heightLeft);
pdf.addImage(imgData, "PNG", margin, position, imgWidth, imgHeight);
```
This causes content near page boundaries to appear on **both** pages -- the bottom of page N and the top of page N+1 show the same lines.

**Fix**: Slice the source canvas into page-sized chunks. Each chunk becomes its own cropped image placed at the top of its respective page. No overlap possible.

### 2. Links Not Clickable
Two issues:
- `containerRef` points to `.resume-preview-container` (the scroll wrapper), not the actual template element passed to `html2canvas`. When the dialog is scrolled, `getBoundingClientRect()` returns viewport-relative coordinates that don't match the canvas coordinate space.
- The template is nested inside an extra `<div className="min-w-[8.5in]...">` wrapper, creating a mismatch between what's captured and what's measured.

**Fix**: Move `containerRef` to the actual template element and collect link coordinates before any scroll offset interferes.

## Changes

### File: `src/lib/export-pdf.ts`
Replace the multi-page loop with canvas-slicing:

```typescript
// For each page, crop a horizontal strip from the full canvas
const pxPerPage = (usableHeight / imgHeight) * canvas.height;

let pageIndex = 0;
let srcY = 0;

while (srcY < canvas.height) {
  const sliceHeight = Math.min(pxPerPage, canvas.height - srcY);
  
  // Create a temp canvas for this page's slice
  const pageCanvas = document.createElement("canvas");
  pageCanvas.width = canvas.width;
  pageCanvas.height = sliceHeight;
  const ctx = pageCanvas.getContext("2d")!;
  ctx.drawImage(canvas, 0, srcY, canvas.width, sliceHeight, 0, 0, canvas.width, sliceHeight);
  
  const pageImg = pageCanvas.toDataURL("image/png");
  const sliceHeightMm = (sliceHeight * imgWidth) / canvas.width;
  
  if (pageIndex > 0) pdf.addPage();
  pdf.addImage(pageImg, "PNG", margin, margin, imgWidth, sliceHeightMm);
  
  srcY += pxPerPage;
  pageIndex++;
}
```

For links, adjust Y coordinate calculation to account for which page-slice the link falls in, using the same `pxPerPage` math.

### File: `src/components/resumes/ResumePreviewModal.tsx`
Move `containerRef` from the scroll wrapper to the inner template wrapper so coordinates align with what `html2canvas` captures:

```tsx
<div className="resume-preview-container overflow-x-auto">
  <div ref={containerRef} className="min-w-[8.5in] origin-top-left sm:origin-top sm:min-w-0">
    <Template {...data} />
  </div>
</div>
```

## Files Changed

| File | Change |
|------|--------|
| `src/lib/export-pdf.ts` | Replace full-image offset pagination with canvas-slicing per page; fix link coordinate mapping for sliced pages |
| `src/components/resumes/ResumePreviewModal.tsx` | Move `containerRef` to inner template wrapper |

