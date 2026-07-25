# 7. Mobile App Structure (`app/`)

> React Native + Expo Router v6 application. Full architecture/feature detail also lives in [`app/README.md`](../README.md) — this document summarizes and cross-references it, plus verifies directory contents against the current repo.

## 7.1 Directory Layout

```text
app/
├── app/                      # Expo Router file-based routes
│   ├── (auth)/               # Auth stack
│   │   ├── login.tsx
│   │   └── signup.tsx
│   ├── (tabs)/                # Main tab navigator
│   │   ├── index.tsx          # Home (featured gigs/jobs, banners)
│   │   ├── explore.tsx        # Search & filter marketplace
│   │   ├── orders.tsx         # Buyer & seller order dashboard
│   │   └── chat.tsx           # Active conversations list
│   ├── admin/                 # Admin portal (role-gated)
│   │   ├── index.tsx          # Analytics dashboard
│   │   └── users.tsx          # User management
│   ├── announcements/
│   │   ├── index.tsx          # Paginated announcements list
│   │   └── [id].tsx           # Announcement detail
│   ├── chat/[conversationId].tsx  # Real-time chat room
│   ├── gig/[slug].tsx         # Gig detail page
│   ├── job/[slug].tsx         # Job detail page
│   ├── order/[id].tsx         # Order detail & delivery screen
│   ├── unauthorized.tsx       # Guard page
│   ├── index.tsx              # Entry / splash redirect
│   └── _layout.tsx            # Root layout: auth init, notification listeners
│
├── components/
│   ├── ui/                    # Buttons, Cards, Inputs, Badges, Toast
│   ├── home/                  # Banners, search bar, category scroller
│   ├── gigs/                  # Gig cards, package selectors, media preview
│   ├── jobs/                  # Job cards, proposal dialogs
│   └── orders/                # Status pills, deliverables, SwipeableOrderCard
│
├── store/                     # Zustand state stores (see §7.2)
├── lib/                       # API clients, notification handling, utilities
├── types/
│   ├── db/                    # Supabase entity types (Gig, Job, Order, Escrow, ...)
│   └── business/              # App-specific types (User, Chat, File, R2)
├── docs/                      # ANDROID_BUILD_GUIDE.md (release/build process)
├── documentation/             # ← this directory (whole-project documentation)
├── android/                   # Native Android project (generated/config)
├── assets/, constants/, config/, scripts/
├── app.json, eas.json         # Expo/EAS configuration
└── package.json
```

## 7.2 Zustand Stores (`store/`)

| Store | Responsibility |
|---|---|
| `auth.store.ts` | Session init, AsyncStorage hydration, auth headers, active user profile |
| `gigs.store.ts` | Marketplace gig listing state, filters, pagination |
| `jobs.store.ts` | Job board state, filters, pagination |
| `job-proposals.store.ts` | Proposal submission & management |
| `orders.store.ts` | Order creation, deliverables, status transitions (`pending`, `in_progress`, `delivered`, `completed`, `cancelled`, `disputed`) |
| `escrow.store.ts` | Escrow balance sync with order lifecycle events |
| `chat.store.ts` | Active conversations, message thread state, message dispatch |
| `wallet.store.ts` | Financial balance, deposit/withdrawal history |
| `categories.store.ts` | Category tree for filters/pickers |
| `profile.store.ts` | Own profile edit state |
| `file-upload.store.ts` | R2 signed-upload orchestration |
| `announcements.store.ts` | Paginated announcements + detail fetch, `activeDetailId` tracking for notification-tap dedup |
| `notifications.store.ts` | Permission status, FCM topic subscription state |
| `toast.store.ts` | In-app toast queue (also used for foreground push notifications) |
| `users.store.ts` | Admin: user list/management |
| `admin-dashboard.store.ts` | Admin: analytics/system metrics |
| `home.store.ts` | Homepage aggregate (`site-data`): banners, announcements, featured content |

## 7.3 Notification Pipeline (`lib/notifications/`)

| File | Responsibility |
|---|---|
| `register.ts` | `requestNotificationPermission()` — creates Android channel, requests permission, never throws, bails on simulators |
| `subscribe.ts` | `subscribeToAnnouncementsTopic()` — gets FCM token, calls `/api/push/subscribe`, dedupes via AsyncStorage, retries once |
| `listeners.ts` | `useNotificationListeners()` — foreground banner + in-app toast, background tap handling, cold-start recovery via `getLastNotificationResponseAsync()` |
| `handle-response.ts` | `navigateFromNotificationResponse()` — reads `data.announcementId`/`data.screen`, dedupes by notification `request.identifier`, no-ops if already on that screen, deferred `router.push` |

## 7.4 Notable Cross-Cutting Behaviors

- **No direct Supabase/R2 access from the client** — all data access goes through the Next.js API (`web/app/api/**`); the mobile app only talks to R2 directly for the actual file bytes after receiving a signed upload URL.
- **Ownership guards mirrored client-side** — e.g. UI prevents a seller from ordering their own gig or bidding on their own job, matching the server-side RPC checks (defense in depth, not the actual security boundary).
- **`activeDetailId` pattern** — screens that can be reached both by normal navigation and by a notification tap report their own "currently open" id to the relevant store, so a duplicate/late notification tap becomes a no-op instead of a redundant navigation.
- **Type safety** — all API request/response shapes are validated against `@gig-hub/types` Zod schemas shared with the backend, so a backend contract change surfaces as a compile-time type error in the app.

## 7.5 Build & Release

See [`app/docs/ANDROID_BUILD_GUIDE.md`](../docs/ANDROID_BUILD_GUIDE.md) and [10-deployment.md](./10-deployment.md) for EAS build profiles and APK/AAB distribution.
