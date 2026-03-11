

# Fix: Persist Structured Questions Across Navigation

## Problem
When the AI returns structured input questions (MultiQuestionForm), they're stored only in React state (`pendingQuestions`). Navigating away loses them. On return, messages reload from DB but the questions are gone.

## Solution
Store the questions JSON alongside the assistant message in the `chat_message` table, then restore them when loading messages.

### 1. Edge Function — `supabase/functions/chat/index.ts`
When saving the assistant message, include questions in `structured_data_extracted`:
```ts
await supabaseAdmin.from("chat_message").insert({
  chat_session_id: sessionId,
  role: "assistant",
  content: parsed.user_message,
  structured_data_extracted: {
    extractedData: parsed.extracted_data,
    questions: parsed.questions,
  },
});
```

### 2. Interview Page — `src/pages/Interview.tsx`
After loading messages in `initSession`, check the **last assistant message** for stored questions:
```ts
const msgs = await loadMessages(existing.id);
// Restore pending questions from last assistant message
const lastAssistant = [...msgs].reverse().find(m => m.role === "assistant");
if (lastAssistant?.structured_data_extracted?.questions) {
  setPendingQuestions(lastAssistant.structured_data_extracted.questions);
}
```

Also update the AI message creation in `handleSend` to match the new shape:
```ts
structured_data_extracted: {
  extractedData: data.extractedData ?? null,
  questions: data.questions ?? null,
},
```

### 3. ResumeGapChat — `src/components/resumes/ResumeGapChat.tsx`
Same pattern: after loading messages, check last assistant message for questions and restore `pendingQuestions`.

### 4. Redeploy
Redeploy the `chat` edge function.

