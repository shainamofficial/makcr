

# Add "Skip and Generate Resume" Button to Resume Gap Analysis

## Change

Add a "Skip & Generate Resume" button in the bottom input area of `ResumeGapChat` that's always visible during the conversation (when not loading and not already complete). This lets users bypass remaining questions and go straight to resume generation.

## File: `src/components/resumes/ResumeGapChat.tsx`

- Import `SkipForward` icon from lucide-react
- In the bottom input section, add a "Skip & Generate Resume" button that calls `onGenerateResume` directly
- Show it alongside the text input (when no pending questions) and below the form (when pending questions are showing)
- Hide it when `isComplete` is true (the full-width "Generate Resume Now" button already shows) or during initial loading

### Layout
- When **text input** is showing: add a secondary/outline button next to the send button
- When **multi-question form** is showing: show the skip button in the bottom bar (currently empty in that state)
- Always use `variant="outline"` to differentiate from the primary generate button

