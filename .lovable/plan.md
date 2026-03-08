

## Add Resume Upload Option to AI Interview

**Overview**: Add a "Upload Resume" button to the interview chat that lets users upload a PDF/DOCX resume. The file gets parsed in an edge function, and the extracted text is sent to the AI which then asks clarifying questions about each section.

### Changes

**1. New Edge Function: `supabase/functions/parse-resume/index.ts`**
- Accepts a resume file (PDF) via multipart form data
- Uses the `pdf-parse` library (or raw text extraction) to extract text content from the uploaded file
- Returns the extracted text to the client
- Auth: validates JWT like the chat function

**2. Update `supabase/config.toml`**
- Add `[functions.parse-resume]` with `verify_jwt = false`

**3. New Component: `src/components/interview/ResumeUpload.tsx`**
- Similar pattern to `PhotoUpload.tsx` — drag-and-drop or file picker
- Accepts PDF and DOCX files (max 10MB)
- Shows upload progress and file name preview
- On upload: calls `parse-resume` edge function, then sends extracted text to the chat AI via `handleSend` with a prefixed message like `[RESUME_UPLOAD] <extracted text>`
- Has a "Skip" / dismiss option

**4. Update `src/pages/Interview.tsx`**
- Add a `showResumeUpload` state, initially `true` for new `initial_interview` sessions (shown alongside the first AI message)
- Pass `handleResumeUploaded` callback that:
  1. Calls the parse-resume edge function with the file
  2. Sends the extracted resume text to the chat function as a special message
- Once uploaded or dismissed, hide the upload widget

**5. Update `src/components/interview/ChatInput.tsx`**
- Add a paperclip/attachment icon button next to the textarea
- Clicking it opens a file picker for resume upload (PDF/DOCX)
- This provides a persistent way to upload a resume at any point during the interview, not just at the start

**6. Update `supabase/functions/chat/index.ts`**
- Update the system prompt to handle resume upload messages:
  - When a message starts with `[RESUME_UPLOAD]`, the AI should parse the resume content, map it to career graph sections (work experience, education, skills, projects), extract structured data, and then ask clarifying questions section by section
  - Add instruction: "When receiving a resume upload, systematically go through each section, confirm what was extracted, ask about missing details (dates, metrics, achievements), and fill gaps"

### Flow
1. User starts interview → sees "Upload your resume to get started faster" option + normal chat
2. User uploads resume PDF → frontend sends to `parse-resume` function → gets text back
3. Frontend sends text to chat function with `[RESUME_UPLOAD]` prefix
4. AI reads resume, extracts structured data, then asks clarifying questions one section at a time
5. User can also choose to skip and do the manual interview flow

### Technical Notes
- For PDF parsing in Deno edge functions, we'll use a lightweight approach: fetch the file content and use a Deno-compatible PDF text extractor (`pdf-parse` via esm.sh or similar)
- The resume file itself is uploaded to the existing `resumes` storage bucket for reference
- No database schema changes needed

