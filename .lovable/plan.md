

# Live Template Previews with Full-Size Preview Modal

## Changes

### `src/components/resumes/GenerateResumeTab.tsx`

1. **Live thumbnail previews**: Replace the placeholder `FileText` icon (and `preview_image_url` fallback) with a miniature live render of each template component using dummy data and CSS scaling (`transform: scale(0.13)`, `transform-origin: top left`, container ~160px tall, `overflow: hidden`, `pointer-events: none`).

2. **Click behavior**: Single click selects the template (existing). Add a small "Preview" eye icon button in the top-right corner of each card. Clicking it opens a full-size modal of that template with dummy data.

3. **Preview modal state**: Add `previewingTemplate` state (template name or null). When set, render `ResumePreviewModal` with dummy data and that template name. On close, clear the state.

4. **Dummy data constant**: Define a small `SAMPLE_RESUME_DATA: ResumeData` constant at the top of the file with a sample name, one work experience, one education entry, a few skills — enough to show the template's visual style.

### Visual result
- Each template card shows a scaled-down live render of the actual template
- An eye/expand icon button on each card opens a full-size modal preview
- Clicking the card body still selects the template for generation

