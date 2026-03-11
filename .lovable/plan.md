

# Fix: AI Not Returning Structured Question Fields

## Problem
The system prompt already instructs Claude to return a `questions` array for multi-field inputs, and the Interview page already renders `MultiQuestionForm` when it receives them. However, two issues exist:

1. **Claude inconsistently returns `questions`**: The prompt says "you SHOULD return" which is weak. It needs stronger enforcement — e.g., "you MUST return" with clearer rules about when to use it.
2. **ResumeGapChat doesn't support structured questions at all**: It only has a plain text input — no `MultiQuestionForm` rendering even if the backend returns questions.

## Changes

### A. `supabase/functions/chat/index.ts` — Strengthen prompt instructions

In both the interview and resume gap system prompts:
- Change "you SHOULD return" to "you MUST return" for the `questions` field
- Add explicit instruction: "NEVER ask multiple questions in `user_message` without providing a corresponding `questions` array. If your message asks for more than one piece of information, you MUST include a `questions` array."
- Add a few more examples to reinforce the pattern
- In the resume gap prompt, add the same `questions` field documentation that the interview prompt has

### B. `src/components/resumes/ResumeGapChat.tsx` — Add MultiQuestionForm support

- Import `MultiQuestionForm` and its `StructuredQuestion` type
- Add `pendingQuestions` state (`StructuredQuestion[] | null`)
- After receiving AI response, check for `data.questions` and set `pendingQuestions`
- Render `MultiQuestionForm` below messages when `pendingQuestions` is set
- When user submits the form, clear `pendingQuestions` and send the formatted answer

### Files to modify
- `supabase/functions/chat/index.ts` — stronger prompt wording for questions
- `src/components/resumes/ResumeGapChat.tsx` — add structured questions UI

