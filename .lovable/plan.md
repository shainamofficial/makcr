

## Fix: Chat Edge Function Auth Error

**Problem**: The chat edge function crashes with `supabase.auth.getClaims is not a function` (line 32). This method doesn't exist in the Supabase JS client. Every message sent in the AI interview fails.

**Fix**: Replace `supabase.auth.getClaims(token)` with `supabase.auth.getUser(token)`, which is the correct method to validate a JWT and extract the user ID.

### Change in `supabase/functions/chat/index.ts`

Replace lines 31-39:
```typescript
// Before (broken):
const token = authHeader.replace("Bearer ", "");
const { data: claimsData, error: claimsError } = await supabase.auth.getClaims(token);
if (claimsError || !claimsData?.claims) { ... }
const userId = claimsData.claims.sub as string;

// After (fixed):
const { data: { user }, error: userError } = await supabase.auth.getUser(
  authHeader.replace("Bearer ", "")
);
if (userError || !user) {
  return 401 Unauthorized response;
}
const userId = user.id;
```

This is a one-line conceptual fix — swap the non-existent `getClaims` for `getUser` and adjust the destructuring. The edge function then needs to be redeployed.

