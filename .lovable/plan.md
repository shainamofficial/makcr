

# Remove Hero Layout

## Changes

1. **Delete** `src/components/profile/layouts/HeroLayout.tsx`

2. **`src/components/profile/layouts/types.ts`** -- Remove `"hero"` from `ProfileLayoutType` union

3. **`src/components/profile/LayoutPicker.tsx`** -- Remove the hero entry (Sparkles icon) from the `layouts` array, remove `Sparkles` import

4. **`src/pages/Profile.tsx`** -- Remove `HeroLayout` import and its entry from `layoutComponents`

5. **Migration safety** -- If any user has `profile_layout = 'hero'` saved, the fallback `|| ClassicLayout` in `Profile.tsx` already handles it gracefully

