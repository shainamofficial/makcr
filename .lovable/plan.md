

# Ideas to Make Makcr Even Better

Based on reviewing the PRD, codebase, and current feature set, here are high-impact improvements organized by category:

---

## UX & Polish

1. **Dark mode support** — The app uses `next-themes` but doesn't expose a toggle. Add a theme switcher to the navbar.

2. **Mobile career sidebar** — The `CareerSidebar` is hidden below `md` breakpoint. Add a slide-up drawer so mobile users can see their career graph during the interview.

3. **Interview resume/restart controls** — No way to pause, abandon, or restart an interview from the UI without losing context. Add explicit session controls.

4. **Better PDF export** — Currently uses `window.print()`. Switch to `html2pdf.js` or server-side rendering for cleaner, more reliable PDF output.

5. **Markdown rendering in chat** — AI responses are plain text. Use `react-markdown` to render formatted responses (bold, lists, code) in the chat.

---

## Core Feature Gaps (from PRD)

6. **Extra-curriculars & Positions of Responsibility** — The PRD defines `extra_curricular` and `position_of_responsibility` tables, but the interview AI and Profile page don't handle them at all. Add support for these in both the chat flow and profile display.

7. **Work experience points editing** — The Profile page shows work experiences but bullet points (achievements) aren't editable or even displayed in the profile UI.

8. **Resume drafts section** — The PRD specifies "in_progress" resumes should appear in a "Drafts" section on the Resume Dashboard. Currently only completed resumes are shown.

9. **Resume chat history** — Each resume has a `chat_session_id` for the gap analysis conversation. The Past Resumes tab should let users view this conversation history.

10. **Project types** — The `project_type` table exists but the interview AI and profile modals don't use it. Projects should be categorized.

---

## AI & Data Quality

11. **Smarter context management** — Instead of loading the last 50 messages raw, summarize older messages to keep context rich without hitting token limits.

12. **Real-time career sidebar updates** — Use Supabase Realtime subscriptions instead of manual `refreshKey` increments so the sidebar updates instantly when the AI extracts data.

13. **Confirmation UI** — Claude returns `pending_confirmations` but the frontend ignores them. Render these as confirmation cards (e.g., "Is this Google LLC or Alphabet Inc.?") with clickable options.

---

## Infrastructure & Reliability

14. **Error boundaries** — No React error boundaries anywhere. A single component crash takes down the whole app. Wrap page-level routes in error boundaries.

15. **Retry logic for edge functions** — Network failures to `chat` or `generate-resume` silently fail. Add automatic retry with exponential backoff for transient failures.

16. **Loading skeletons everywhere** — Several pages (Resumes, Interview) show blank states while loading. Add skeleton placeholders for better perceived performance.

---

Which of these would you like to tackle first? I'd recommend starting with the highest-impact items: **confirmation UI (#13)**, **extra-curriculars support (#6)**, and **mobile sidebar (#2)**.

