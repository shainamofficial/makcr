

# QA Assessment: Makcr Platform Bugs and Issues

After thoroughly reviewing all pages, components, edge functions, and data flows, here are the identified bugs and recommended fixes:

---

## Critical Bugs

### 1. Duplicate resume upload handler in Interview.tsx
The `Interview` page has **two competing resume upload paths**: the `ResumeUpload` component (which calls `PARSE_FN_URL` internally) AND `handleResumeFile` on the `ChatInput` paperclip button (which also calls `PARSE_FN_URL`). The `ChatInput` paperclip handler sets `isTyping=true` but bypasses the `ResumeUpload` progress bar entirely, meaning a file uploaded via the paperclip will show the typing indicator (bounce dots) instead of the progress bar -- and that indicator disappears on tab switch (the original bug). Additionally, `handleResumeFile` doesn't validate file type or size before sending.

**Fix**: Remove the `onResumeFile` prop from `ChatInput` when `showResumeUpload` is true, or route the paperclip upload through the same module-level persistent progress system in `ResumeUpload`. Add file validation to `handleResumeFile`.

### 2. Chat messages sent to Claude include raw `[RESUME_UPLOAD]` text in history
When the user uploads a resume, the full resume text is stored as a `chat_message` with role "user". On subsequent messages, the chat function loads the last 50 messages and sends them ALL to Claude. A long resume could easily consume most of the 2048 max_tokens budget or hit API limits, causing truncation or failures.

**Fix**: Either truncate resume content in history before sending to Claude, or tag resume messages and summarize/exclude them from the rolling context window.

### 3. `structured_data_extracted` stored as stringified JSON, not native JSONB
In `chat/index.ts` line 491, `parsed.extracted_data` is wrapped in `JSON.stringify()` before inserting into the `structured_data_extracted` JSONB column. This stores a JSON string inside a JSONB column (double-encoded), making it harder to query.

**Fix**: Pass `parsed.extracted_data` directly without `JSON.stringify()`.

---

## Medium Bugs

### 4. `isEmpty` check in Profile page has a race condition
`useProfileData` computes `isEmpty` based on all four queries' data being empty. However, `loading` only checks `profileQuery.isLoading || workQuery.isLoading` -- the education, skills, and projects queries might still be loading. A user could briefly see the "empty profile" screen while those queries are in flight.

**Fix**: Include all query loading states in the `loading` check.

### 5. Footer year is hardcoded to 2025
In `Index.tsx` line 176: `© 2025 Makcr`. The current date is 2026.

**Fix**: Use `new Date().getFullYear()`.

### 6. "Settings" button in Navbar does nothing
Both desktop dropdown and mobile sheet have a "Settings" button that has no `onClick` handler and no navigation.

**Fix**: Either implement a settings page/modal or remove the button to avoid confusion.

### 7. `ResumeUpload` module-level state leaks across sessions
The `activeUpload` module-level variable persists for the lifetime of the SPA. If a user logs out and another logs in (or the same user navigates away and back much later), stale upload state could cause unexpected behavior.

**Fix**: Clear `activeUpload` on auth state change or route change away from `/interview`.

### 8. No error handling for Supabase storage upload failure in `parse-resume`
In `parse-resume/index.ts`, the storage upload result is not checked for errors -- it silently proceeds even if the upload fails. This means the file may not be stored for reference.

**Fix**: Log or return a warning if the storage upload fails.

### 9. DOCX text extraction is naive
The DOCX extraction in `parse-resume` just strips XML tags from raw bytes (`rawText.replace(/<[^>]+>/g, " ")`). DOCX is a ZIP file, so the raw bytes decoded as UTF-8 will contain a lot of binary garbage. The fallback to Claude with a substring of base64 also won't work well.

**Fix**: Use Claude's document processing for DOCX files the same way as PDF (base64 + document type), or use a proper DOCX parsing library.

---

## Minor Issues

### 10. Chat message limit of 50 could lose context
The chat function loads only the last 50 messages. For a thorough initial interview, users may exceed this, causing the AI to lose earlier context.

**Fix**: Increase the limit or implement a summarization strategy for older messages.

### 11. No loading/error states for CareerSidebar
The sidebar fetches data but shows no loading indicator and silently swallows errors (`.then()` with no `.catch()`).

**Fix**: Add error handling and a skeleton loading state.

### 12. `Profile` page imports `ResumeUpload` but never uses it
Line 13 of `Profile.tsx` imports `ResumeUpload` but it's never rendered.

**Fix**: Remove the unused import.

### 13. Print-based PDF export is not ideal
`ResumePreviewModal` uses `window.print()` for PDF download. This opens the browser's print dialog and relies on the user's print settings, which may not produce clean output.

**Fix**: Consider using a library like `html2pdf.js` or `react-to-print` for more reliable PDF generation.

### 14. No mobile visibility for CareerSidebar
The sidebar is hidden on screens below `md` breakpoint with no alternative way to view the career graph summary on mobile during the interview.

**Fix**: Add a collapsible drawer or bottom sheet for mobile users.

---

## Summary of Priority Fixes

| Priority | Issue | Effort |
|----------|-------|--------|
| High | #1 Duplicate resume upload paths | Medium |
| High | #2 Resume text bloating Claude context | Medium |
| High | #3 Double-encoded JSONB data | Small |
| Medium | #4 Profile isEmpty race condition | Small |
| Medium | #9 Broken DOCX extraction | Medium |
| Low | #5 Hardcoded year | Trivial |
| Low | #6 Dead Settings button | Small |
| Low | #12 Unused import | Trivial |

Shall I proceed with implementing fixes for any or all of these?

