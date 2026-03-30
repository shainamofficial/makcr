

# Mobile Responsiveness Audit & Fixes

## Current State
The app is **already well-handled for mobile** across most screens. The Navbar has a hamburger menu, Interview uses a Drawer for the sidebar, pages use responsive padding, and grids collapse to single columns. Only a few minor issues need fixing.

## Issues Found

### 1. ResumePreviewModal -- not mobile-friendly
The modal uses `max-w-[9in]` with no mobile adaptation. On small screens, the resume preview will overflow or be unusably small. The sticky toolbar buttons may also be cramped.

### 2. ResumeGapChat dialog -- horizontal margin issue
Uses `mx-2 sm:mx-auto` on DialogContent which can fight with the dialog's default centering. The height `h-[90vh] sm:h-[80vh]` is fine but needs safe-area padding for mobile keyboards.

### 3. GenerateResumeTab -- template grid thumbnails
The template preview thumbnails use a fixed `scale(0.12)` with `width: 8.5in` which causes a large invisible overflow area. On mobile, the card layout works but the preview eye button (opacity on hover) is inaccessible on touch devices.

### 4. PastResumesTab -- draft card layout
Draft cards use `flex items-center justify-between` which can squeeze content on narrow screens when buttons are wide.

### 5. MultiQuestionForm -- left margin on mobile
Uses `ml-11` which pushes the form too far right on small screens, reducing usable width.

## Plan

### File: `src/components/resumes/ResumePreviewModal.tsx`
- Add responsive width: use `w-[95vw] sm:max-w-[9in]` so it fills mobile screens
- Make toolbar buttons stack or shrink on mobile
- Add horizontal scroll or scale-down wrapper for the resume content on small screens

### File: `src/components/resumes/ResumeGapChat.tsx`  
- Remove `mx-2` from DialogContent (dialog already centers itself)
- Add `pb-[env(safe-area-inset-bottom)]` to the input area for iOS keyboard

### File: `src/components/resumes/GenerateResumeTab.tsx`
- Make template preview eye button always visible on mobile (no hover-only opacity)
- Ensure template grid cards don't overflow on small screens

### File: `src/components/resumes/PastResumesTab.tsx`
- Change draft card to `flex-col sm:flex-row` layout so title and button stack on mobile

### File: `src/components/interview/MultiQuestionForm.tsx`
- Reduce left margin on mobile: `ml-2 sm:ml-11`

### File: `src/components/profile/WorkExperienceSection.tsx`
- Ensure action buttons (edit/delete) don't get too cramped -- use `flex-wrap` on the actions row for very narrow screens

