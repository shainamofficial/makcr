

# Multi-Question Input Fields for AI Interview

## Problem
The system prompt says "Ask ONE question at a time" but Claude sometimes asks multiple sub-questions in one message (e.g., "What was your title? When did you start? When did you leave?"). Currently the user must answer all of them in a single free-text textarea.

## Approach

Two complementary changes:

### 1. Backend: Have Claude return structured questions
Update the JSON response schema in the system prompt to include an optional `questions` array:

```json
{
  "user_message": "...",
  "questions": [
    { "id": "title", "label": "Job title", "type": "text" },
    { "id": "start_date", "label": "Start date", "type": "date" },
    { "id": "end_date", "label": "End date", "type": "date" }
  ],
  ...
}
```

Add instructions telling Claude: "When you need multiple pieces of information, return them as structured `questions` so the UI can render individual input fields."

Supported types: `text`, `date`, `select` (with options array), `textarea`.

### 2. Frontend: Render structured input form when questions are present
- Store `pendingQuestions` state in `Interview.tsx` from the `data.questions` response field
- Create a new `MultiQuestionForm` component that renders labeled input fields for each question
- Show this form below the last AI message (inside `ChatMessages` children), replacing the standard `ChatInput` textarea
- On submit, concatenate answers into a structured message like:
  ```
  Job title: Senior Engineer
  Start date: 2023-01-15
  End date: Present
  ```
- After submission, clear `pendingQuestions` and send via the existing `handleSend`
- Fall back to the normal `ChatInput` textarea when no structured questions are present

### Files to modify
- `supabase/functions/chat/index.ts` — Add `questions` to the response schema and system prompt instructions
- `src/pages/Interview.tsx` — Store `pendingQuestions` from response, pass to ChatMessages
- `src/components/interview/MultiQuestionForm.tsx` — New component: renders dynamic form fields based on question definitions
- `src/components/interview/ChatMessages.tsx` — Render `MultiQuestionForm` when pending questions exist

### UX Details
- Each field gets a label from `question.label`
- Date fields use an `<input type="date" />`
- Select fields render a `<Select>` dropdown with provided options
- A single "Send" button submits all answers at once
- Users can still type freely in the regular ChatInput below (the form is a convenience, not mandatory)

