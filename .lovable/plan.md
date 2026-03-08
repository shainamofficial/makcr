

# QA Assessment — Bugs and Fixes

## Bug 1: Console Warning — Badge ref forwarding (Active in preview)
The console shows: `Function components cannot be given refs` for the `Badge` component in `Index.tsx`. The roadmap cards use `Badge` inside elements that try to pass a ref, but Badge doesn't use `forwardRef`.

**Fix**: Update `src/components/ui/badge.tsx` to use `React.forwardRef`.

---

## Bug 2: Resume upload escape sequences
In `Interview.tsx` lines 262-264, `handleResumeUploaded` sends the resume text with literal `\\\\` (escaped backslashes) instead of actual newlines:
```
`[RESUME_UPLOAD] File: ${fileName}\\\\
\\\\
${resumeText}`
```
This means the AI receives literal backslash characters instead of newlines, corrupting the resume parsing.

**Fix**: Replace `\\\\` with `\n` in the template literal.

---

## Bug 3: `onResumeFile` prop still accepted but never used
`ChatInput` still accepts `onResumeFile` prop and renders a hidden file input + paperclip button when provided. Although `Interview.tsx` no longer passes it, the dead code path remains and could be accidentally re-enabled.

**Fix**: Remove the `onResumeFile` prop and related file handling code from `ChatInput`.

---

## Bug 4: `generate-resume` double message insertion
In `GenerateResumeTab.tsx` lines 157-176, the JD message is inserted directly into `chat_message` via Supabase AND then sent to the `chat` edge function, which also saves it. This creates duplicate user messages in the gap analysis chat.

**Fix**: Remove the direct `supabase.from("chat_message").insert()` call; let the edge function handle message persistence.

---

## Bug 5: `ResumeGapChat` sends to `chat` edge function (interview AI) instead of a resume-focused prompt
The `ResumeGapChat` component sends messages to the same `chat` edge function that powers the career interview. The system prompt is designed for career graph building, not resume gap analysis. The AI will try to extract career data and ask interview questions instead of analyzing resume gaps.

**Fix**: This is a design issue. Either create a separate edge function for resume gap analysis, or add a `mode` parameter to the `chat` function that switches the system prompt based on `session_type`. For now, flag this as a known limitation.

---

## Bug 6: Education delete doesn't cascade to `extra_curricular` and `position_of_responsibility`
In `EducationSection.tsx` line 32, deleting an education record doesn't first delete associated `extra_curricular` and `position_of_responsibility` records. If the database doesn't have `ON DELETE CASCADE` foreign keys, this will fail silently or throw a FK constraint error.

**Fix**: Delete `extra_curricular` and `position_of_responsibility` records before deleting the education record, similar to how `WorkExperienceSection` deletes points first.

---

## Bug 7: `TemplatePreviewsAdmin` route has no auth protection
In `App.tsx` line 49, `/admin/template-previews` is publicly accessible with no `ProtectedRoute` wrapper and no admin role check.

**Fix**: Wrap in `ProtectedRoute` at minimum. Ideally add admin role verification.

---

## Bug 8: `loadMessages` has no row limit
In `chat-service.ts` line 23-30, `loadMessages` fetches all messages with no `.limit()`. For long interviews, this could return hundreds of messages and slow down the UI.

**Fix**: Add `.limit(200)` or implement pagination.

---

## Bug 9: `CareerSidebar` silently swallows fetch errors
All four queries in `CareerSidebar.tsx` (lines 44-69) use `.then()` without `.catch()`. Any Supabase error is silently ignored, potentially showing stale or empty data.

**Fix**: Add `.catch(console.error)` to each query chain, or convert to `useQuery` for automatic error handling.

---

## Summary

| # | Bug | Severity | Effort |
|---|-----|----------|--------|
| 1 | Badge ref warning | Low | Trivial |
| 2 | Resume upload escape sequences | High | Trivial |
| 3 | Dead `onResumeFile` code in ChatInput | Low | Small |
| 4 | Double message in resume generation | Medium | Small |
| 5 | Gap chat uses interview AI prompt | Medium | Medium |
| 6 | Education delete FK cascade | Medium | Small |
| 7 | Unprotected admin route | Medium | Trivial |
| 8 | No message limit on loadMessages | Low | Trivial |
| 9 | CareerSidebar silent errors | Low | Small |

