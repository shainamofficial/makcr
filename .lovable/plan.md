

# Fix Hero Layout Alignment and Overflow

## Problem
The hero banner has text overflow and alignment issues at the current viewport (1000px). The `text-5xl` name can spill, the flex layout breaks at the `sm` breakpoint (~640px) leaving an awkward middle ground, and the banner padding is too generous for medium screens.

## Changes

**File**: `src/components/profile/layouts/HeroLayout.tsx`

1. **Fix text overflow** -- add `break-words` / `overflow-hidden` on the name heading and constrain it with `min-w-0` on the flex child
2. **Reduce font sizes** -- use `text-3xl sm:text-4xl` instead of `text-4xl sm:text-5xl` to prevent spill at medium widths
3. **Fix flex alignment** -- change `sm:items-end` to `sm:items-center` for better vertical centering of avatar with text
4. **Tighten padding** -- reduce from `p-10 sm:p-14` to `p-8 sm:p-10` so content has more room
5. **Add `min-w-0`** to the `flex-1` text container to prevent flex children from overflowing
6. **Constrain summary width** -- keep `max-w-2xl` but also add `w-full` and `overflow-hidden` for safety

