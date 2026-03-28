
Fix the PDF export by isolating the printable content instead of printing the whole page.

1. Replace `window.print()` in:
- `src/components/resumes/ResumePreview.tsx`
- `src/components/resumes/ResumePreviewModal.tsx`

with a dedicated PDF/export flow that targets only the active resume container.

2. Add a unique export wrapper around the real resume preview
- Give the actual rendered resume a dedicated ref or element id
- Export only that node
- Do not rely on global `.resume-page` print rules

3. Switch to canvas/PDF generation
- Use `html2canvas` + `jsPDF` (or `html2pdf.js`) so only the selected preview is captured
- Generate the PDF from the mounted preview modal/content, not from the full `/resumes` page
- Keep letter-size output and multi-page handling for long resumes

4. Preserve UI behavior
- Keep the existing “Download as PDF” button
- Add a small loading state while the PDF is being prepared
- Ensure both flows work:
  - generated resume preview
  - sample template preview opened from the template gallery

5. Leave sample templates visible in the page UI, but exclude them from export
- The issue comes from `GenerateResumeTab.tsx` rendering many hidden thumbnail/sample resumes, each using `.resume-page`
- With targeted export, those sample cards will no longer be included
- Optionally, as extra safety, add an export-specific class instead of depending on global `.resume-page` print CSS

6. Clean up print styling
- Keep `src/index.css` print rules only as fallback if needed
- Remove any assumption that all `.resume-page` elements on the screen should be printable
- Scope future print/export styling to the dedicated preview container only

Technical details

Current root cause:
- `window.print()` prints the full document
- `src/index.css` makes every `.resume-page` visible during print
- `GenerateResumeTab.tsx` renders many sample template cards using real resume markup, so they are also printed

Files to update:
- `src/components/resumes/ResumePreview.tsx`
- `src/components/resumes/ResumePreviewModal.tsx`
- likely `src/index.css`
- possibly a small shared PDF helper under `src/lib/` if you want reuse

Expected result:
- Downloaded PDF contains only the resume the user opened
- No sample/template gallery resumes appear
- Export works reliably from modal/preview contexts, including inside Lovable preview
