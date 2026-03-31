

# Fix: AI Interview Not Rendering Input Fields for Multi-Question Messages

## Problem
The AI sometimes asks multiple questions in a single message (e.g., "What was the team size?" and "What impact did this have?") but fails to include the structured `questions` array in its JSON response. This means the UI falls back to the plain text input instead of rendering individual input fields via `MultiQuestionForm`.

## Root Cause
This is an LLM compliance issue -- despite strong prompting, Claude occasionally returns `questions: null` when it should return structured fields. The system prompt already instructs this behavior but the AI doesn't always comply.

## Solution
Add a **client-side fallback** that detects when an assistant message contains multiple questions (by counting `?` characters or splitting on question patterns) but no `questions` array was provided. In that case, auto-generate textarea fields for each detected question.

### Changes

**File: `src/pages/Interview.tsx`**
- After receiving the AI response, if `data.questions` is null/empty but the message contains 2+ questions (detected by `?` count), extract each question line and build a synthetic `StructuredQuestion[]` array with `type: "textarea"`
- Pass these auto-generated questions to `setPendingQuestions` as usual

**File: `src/components/resumes/ResumeGapChat.tsx`**
- Apply the same fallback logic for the resume gap chat flow

**New helper: `src/lib/extract-questions.ts`**
- Export a function `extractQuestionsFromMessage(text: string): StructuredQuestion[] | null`
- Split the message into sentences/lines, find those ending with `?`
- If 2+ questions found, return an array of `{ id, label, type: "textarea", placeholder }` objects
- If 0-1 questions, return `null` (single question is fine as free-text)

### Example
AI message: "What was the size of these teams and delivery timelines?\nFor the Strike Through Pricing feature -- what impact did this have on adoption?"

Extracted questions:
```json
[
  { "id": "q_1", "label": "What was the size of these teams and delivery timelines?", "type": "textarea" },
  { "id": "q_2", "label": "What impact did the Strike Through Pricing feature have on adoption?", "type": "textarea" }
]
```

### Files changed
| File | Change |
|------|--------|
| `src/lib/extract-questions.ts` | New helper to detect and extract questions from plain text |
| `src/pages/Interview.tsx` | Use fallback when AI returns no structured questions |
| `src/components/resumes/ResumeGapChat.tsx` | Same fallback logic |

