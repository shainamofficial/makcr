

# Never Skip Work Experience or Education Entries

## Problem

The `generate-resume` edge function's system prompt instructs Claude to "tailor the resume content to match the job description," which causes it to omit work experiences or education entries it considers irrelevant to the target role. Users expect all their career data to appear.

## Solution

Add explicit instructions to the system prompt in the edge function telling the AI to include **every** work experience and education entry from the career graph, without omitting any.

## File: `supabase/functions/generate-resume/index.ts`

Update the `INSTRUCTIONS` section of the system prompt (around line 126-131) to add:

```
6. You MUST include ALL work experiences from the career graph. Do NOT skip or omit any company or role.
7. You MUST include ALL education entries from the career graph. Do NOT skip or omit any institution or degree.
8. You may reorder or adjust bullet points for relevance, but every position and degree must appear.
```

This is a single-line change to the prompt string — no template or frontend changes needed.

| File | Change |
|------|--------|
| `supabase/functions/generate-resume/index.ts` | Add instructions to never skip work/education entries |

