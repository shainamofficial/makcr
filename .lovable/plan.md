

# Add "Till Date" / "Currently Working Here" Toggle to Work Experience

## Change

Add a "Currently working here" checkbox next to the End Date field in `WorkExperienceModal.tsx`. When checked, the end date input is disabled and cleared (storing `null` in the database, which already renders as "Present" in the UI via `formatRange`).

## File: `src/components/profile/WorkExperienceModal.tsx`

1. Add a `currentlyWorking` boolean state, initialized from `!editing.end_date` when editing an entry that has a start date but no end date
2. Add a Checkbox + Label ("Currently working here") below the end date field
3. When checked: clear `endDate` state, disable the end date input
4. When unchecked: re-enable the end date input
5. On save: if `currentlyWorking` is true, set `end_date: null` in the payload (already handled, just ensure endDate state is empty)

No database changes needed -- `end_date` is already nullable and the `WorkExperienceSection` already displays "Present" when `end_date` is null.

