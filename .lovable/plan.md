

# Fix: Profile Picture in PDF Export + Upload Flow on Resume Generation

## Three changes

### 1. Fix PDF export to include profile pictures

**Problem**: `html2canvas` silently drops cross-origin images (Supabase signed URLs). The profile picture never appears in the downloaded PDF.

**Solution**: In `src/lib/export-pdf.ts`, before calling `html2canvas`, find all `<img>` elements in the target container and convert their `src` to base64 data URLs by fetching the image and converting the blob. This inlines the image data and bypasses CORS.

### 2. Add profile picture upload on Profile page

**File**: `src/components/profile/ProfileHeader.tsx`

- Make the avatar clickable with a camera/upload icon overlay on hover
- On click, open a hidden file input (accept JPG/PNG/WebP, max 5 MB)
- Upload using the existing `uploadProfilePicture()` from `src/lib/chat-service.ts`
- Invalidate the `["profile"]` query to refresh the avatar immediately

### 3. Profile picture confirmation/upload step before resume generation

**File**: `src/components/resumes/GenerateResumeTab.tsx`

When the user toggles "Include profile picture" ON and clicks Generate Resume:

- **If user has a profile picture**: Show a confirmation dialog displaying their current photo with "Use this photo" / "Upload new" / "Cancel" options
- **If user has no profile picture**: Show an upload dialog prompting them to upload one before proceeding

Create a new component `src/components/resumes/ProfilePicConfirmDialog.tsx`:
- Uses the `Dialog` component
- Shows the current profile pic (if exists) with confirm/replace/cancel buttons
- Or shows a file upload zone if no pic exists
- On confirm/upload success, proceeds with resume generation
- Reuses `uploadProfilePicture()` from `src/lib/chat-service.ts`

**Flow in GenerateResumeTab**:
- `handleGenerate` checks `includePhoto` flag
- If `includePhoto` is true, open `ProfilePicConfirmDialog` instead of immediately generating
- Dialog resolves (confirm or upload complete) → proceeds with the existing generation flow
- If `includePhoto` is false, skip the dialog entirely

## Files to change

| File | Change |
|------|--------|
| `src/lib/export-pdf.ts` | Pre-fetch images and convert to base64 before html2canvas |
| `src/components/profile/ProfileHeader.tsx` | Add clickable avatar with file upload overlay |
| `src/components/resumes/ProfilePicConfirmDialog.tsx` | New dialog for confirm/upload photo before generation |
| `src/components/resumes/GenerateResumeTab.tsx` | Integrate the dialog into the generate flow |

