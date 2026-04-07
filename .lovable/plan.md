

# Fix "Failed to construct 'URL': Invalid URL" on Profile Page

## Root Cause

In `src/components/profile/ProjectsSection.tsx` line 76, `new URL(url).hostname` is called on every project URL. If any URL in the database is malformed (empty string, missing protocol, etc.), this throws an unhandled error that bubbles up to the ErrorBoundary and crashes the entire Profile page.

## Fix

Wrap the `new URL()` call in a try-catch helper that falls back to displaying the raw URL string when parsing fails.

## Changes

| File | Change |
|------|--------|
| `src/components/profile/ProjectsSection.tsx` | Replace `new URL(url).hostname` with a safe helper: `try { return new URL(url).hostname } catch { return url }` |

