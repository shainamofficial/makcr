

# Paginated Chat Messages with Scroll-to-Load-More

## Overview
Load only the last 20 messages initially, then load older messages when the user scrolls to the top of the chat.

## Changes

### 1. `src/lib/chat-service.ts` — Add paginated loading function

Add `loadRecentMessages(sessionId, limit, offset)` that fetches messages ordered by `created_at DESC` with limit/offset, then reverses the result for chronological display. Keep the existing `loadMessages` for backward compatibility (used by ResumeGapChat).

### 2. `src/pages/Interview.tsx` — Use paginated loader

- Replace `loadMessages(existing.id)` call with `loadRecentMessages(existing.id, 20)` 
- Track `hasMoreMessages` and `oldestLoadedTimestamp` state
- Pass `onLoadMore` callback and `hasMore` flag to `ChatMessages`

### 3. `src/components/interview/ChatMessages.tsx` — Infinite scroll up

- Accept `onLoadMore?: () => void` and `hasMore?: boolean` props
- Add a `topRef` with `IntersectionObserver` — when visible, call `onLoadMore`
- Show a small spinner at the top while loading older messages
- Preserve scroll position after prepending older messages (save `scrollHeight` before load, restore after)

### Files changed
| File | Change |
|------|--------|
| `src/lib/chat-service.ts` | Add `loadRecentMessages` with limit/offset |
| `src/pages/Interview.tsx` | Use paginated load, track pagination state, pass `onLoadMore` |
| `src/components/interview/ChatMessages.tsx` | Add scroll-up detection + "load more" trigger |

