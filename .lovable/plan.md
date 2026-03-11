

# Fix: OAuth Redirecting to localhost:3000

## Root Cause

Your Supabase project's **Site URL** is set to `http://localhost:3000`. After Google OAuth completes, Supabase redirects the user back to this Site URL with the access token — which fails because the app is running on `lovable.app`, not localhost.

## Required Changes

### 1. Supabase Dashboard Configuration (Manual — you do this)

Go to **Authentication → URL Configuration** in your Supabase dashboard:

- **Site URL**: Set to `https://makcr.lovable.app`
- **Redirect URLs**: Add these entries:
  - `https://makcr.lovable.app/**`
  - `https://id-preview--c204dd32-0cc1-49cd-a33f-8c64076fc823.lovable.app/**`

### 2. Code Change — `src/contexts/AuthContext.tsx`

Update `signInWithGoogle` to handle three environments:

1. **Iframe (Lovable preview editor)**: Keep existing popup flow
2. **Published domain / custom domain**: Use `skipBrowserRedirect: true` + manual `window.location.href` redirect to bypass auth-bridge interference
3. **Standard Lovable domain (non-iframe)**: Use normal OAuth flow

This ensures the redirect works correctly regardless of where the app is loaded.

