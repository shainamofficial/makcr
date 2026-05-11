# Fix Sign-In Doing Nothing on makcr.lovable.app

## Root Cause

On the published site, clicking "Sign in" calls `signInWithGoogle` in `src/contexts/AuthContext.tsx`. The non-iframe branch calls `supabase.auth.signInWithOAuth({ ..., skipBrowserRedirect: true })` and then does `window.location.href = data.url`. If Supabase returns an error (most commonly because `https://makcr.lovable.app/profile` is not in the allowed Redirect URLs), the code silently returns — no toast, no console message, no redirect. To the user the button "does nothing".

There are two things to fix: a config issue in Supabase (you), and a code issue (me).

## Part 1 — You: whitelist the published URL in Supabase

Open Authentication → URL Configuration and make sure the following are set:

- **Site URL**: `https://makcr.lovable.app`
- **Redirect URLs** (add all):
  - `https://makcr.lovable.app/**`
  - `https://id-preview--c204dd32-0cc1-49cd-a33f-8c64076fc823.lovable.app/**`
  - `http://localhost:*/**`

Without `makcr.lovable.app` in this list, Supabase rejects the OAuth start and the button silently fails.

## Part 2 — Me: surface errors and harden the flow

Changes to `src/contexts/AuthContext.tsx`:

1. Wrap `signInWithGoogle` in try/catch and show a `toast` with the error message instead of returning silently in both the iframe and non-iframe branches.
2. Log the error to the console for debugging.
3. For the published-site branch, also fall back to `skipBrowserRedirect: false` if the manual redirect fails to fire within 1s (defensive).
4. Add a small inline check: if `data?.url` is falsy after a successful call, surface "Could not start Google sign-in" toast.

No other files change. Auth wiring in `Navbar.tsx` and `Index.tsx` stays the same.

## Files Changed

| File | Change |
|------|--------|
| `src/contexts/AuthContext.tsx` | Add try/catch + toast error feedback in `signInWithGoogle`; log errors; surface missing-URL case |

## Technical Notes

- Uses existing `@/hooks/use-toast` already imported elsewhere in the app.
- No database or edge function changes.
- After Part 1 is done in Supabase, the published-site flow should redirect to Google immediately on click.
