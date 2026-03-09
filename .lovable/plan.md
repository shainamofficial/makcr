

# Fix Resume Gap Analysis Chat

## Problems Identified

There are three issues preventing the gap analysis from working:

### 1. Initial user message (JD) is never persisted
In `GenerateResumeTab.handleGenerate()`, the job description is sent directly to the chat edge function, but never saved to the `chat_message` table. The edge function only saves the **assistant** response (line 506-511). So when `ResumeGapChat` opens and loads messages from DB, the user's initial message is missing from history.

### 2. Initial AI response is not displayed
After `handleGenerate()` calls the edge function and gets back the AI's first response, it doesn't do anything with it — the response is discarded. When `ResumeGapChat` opens and loads messages, it should find the assistant message (saved by the edge function), but there may be a race condition where the chat dialog opens before the edge function finishes saving.

### 3. System prompt is interview-only
The chat edge function uses a career interviewer system prompt regardless of `session_type`. When `session_type` is `"resume_generation"`, it should use a gap analysis prompt that compares the user's career graph against the job description and asks targeted questions about missing qualifications.

## Plan

### A. `src/components/resumes/GenerateResumeTab.tsx`
- **Save the initial user message** to `chat_message` before calling the edge function
- **Wait for the edge function response** before opening the chat dialog (move `setChatOpen(true)` to after the response)
- This ensures ResumeGapChat loads with both the user message and AI response already in the DB

### B. `supabase/functions/chat/index.ts`
- Add a **conditional system prompt** based on `currentSession?.session_type`
- When `session_type === "resume_generation"`, use a gap analysis prompt that:
  - Analyzes the job description against the user's career graph
  - Identifies gaps in skills, experience, or qualifications
  - Asks targeted questions to fill those gaps (max 3-5 questions)
  - Uses `current_topic` value `"resume_ready"` when done (matching the existing check in ResumeGapChat)
- Keep the existing interview prompt for `session_type === "initial_interview"`

### C. `src/components/resumes/ResumeGapChat.tsx`
- Add a small loading state on initial mount (while messages are being fetched) to avoid showing an empty chat briefly

### Files to modify
- `src/components/resumes/GenerateResumeTab.tsx` — save user message, reorder async flow
- `supabase/functions/chat/index.ts` — add resume_generation system prompt
- `src/components/resumes/ResumeGapChat.tsx` — initial loading state

