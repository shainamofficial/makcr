

# Add Job Description URL Scraping

## What

Add an option next to the job description textarea for users to paste a URL instead of (or in addition to) manually pasting text. The platform scrapes the URL and populates the textarea with the extracted job description.

## How

### 1. Connect Firecrawl
Your workspace already has a Firecrawl connection. We'll link it to this project so the edge function can use the API key.

### 2. Create edge function `supabase/functions/scrape-job-description/index.ts`
- Accepts `{ url: string }` in the request body
- Uses Firecrawl's scrape API (`formats: ['markdown']`, `onlyMainContent: true`) to extract readable text
- Returns the scraped content as plain text

### 3. Update `src/components/resumes/GenerateResumeTab.tsx`
- Add an `Input` field above/beside the textarea with placeholder "Or paste a job posting URL..."
- Add a "Fetch" button next to it
- On click, call the edge function, show a loading spinner, and populate the `jd` textarea with the scraped content
- User can then edit the scraped text before generating

## Files to change

| File | Change |
|------|--------|
| `supabase/functions/scrape-job-description/index.ts` | New edge function using Firecrawl |
| `src/components/resumes/GenerateResumeTab.tsx` | Add URL input + fetch button above textarea |

## Technical details

- Firecrawl connector is already in the workspace (connection `std_01kd7s5zhjea2tsfth5k7jh1f6`), just needs to be linked to this project
- The edge function reads `FIRECRAWL_API_KEY` from env (auto-injected by the connector)
- The scrape call uses `onlyMainContent: true` to strip navbars/footers and return just the job posting content
- URL validation happens both client-side (basic format check) and server-side

