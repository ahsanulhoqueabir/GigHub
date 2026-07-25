# 8. Web App Structure (`web/`)

> Next.js (App Router) project that serves three roles at once: the **public marketing/marketplace website**, the **admin panel**, and the **REST API backend** consumed by both the website and the mobile app.

## 8.1 Directory Layout

```text
web/
├── app/
│   ├── (footer)/              # Static content pages: about, contact, help, privacy, safety, terms, logo-story
│   ├── admin/                 # Admin panel UI (role-gated)
│   │   ├── ad-banners/, hero-banners/, announcements/, categories/, departments/, users/
│   │   ├── escrow/             # + escrow/disputes, escrow/[id]
│   │   ├── system/             # System configuration
│   │   └── visualizer/         # Live DB schema visualizer (reads web/lib/schema-parser.ts)
│   ├── api/                    # REST API — see 05-api-reference.md for the full endpoint list
│   ├── gigs/[slug]/, gigs/[slug]/order/    # Public gig detail + order flow
│   ├── jobs/[slug]/, jobs/[slug]/apply/    # Public job detail + apply flow
│   ├── chat/                   # Web chat UI
│   ├── login/, signup/         # Auth pages
│   └── profile/                # Logged-in user dashboard
│       ├── gigs/, gigs/create/, gigs/[id]/
│       ├── jobs/, jobs/create/, jobs/[id]/
│       ├── incoming-proposals/, applied-jobs/
│       ├── orders/[id]/
│       ├── escrow/, wallet/
│
├── components/
│   ├── admin/                  # Admin-only components (incl. visualizer/)
│   └── ...                     # Shadcn/Radix-based shared UI
│
├── services/                   # *.service.ts — business logic layer between routes and Supabase/RPC
├── lib/
│   ├── validations/             # Route-local Zod schema shims (*.schema.ts)
│   ├── firebase/                 # Firebase Admin init + topic push/subscribe helpers
│   └── schema-parser.ts          # Parses web/schema/*.sql for the admin Schema Visualizer
├── store/                       # Zustand stores for the web frontend
├── config/                      # Env config (env.config.ts, etc.)
├── schema/                      # PostgreSQL/Supabase SQL migrations — see 03-database-schema.md
├── data/schema/                 # Design-time ER diagram / use-case source material
├── bruno/                       # Bruno API collection (manual endpoint testing)
├── types/                       # Web-local TS types
└── package.json
```

## 8.2 Layering Convention

```
route.ts (app/api/**)   → parse & validate request (Zod), enforce auth via withAuth(), call service, shape response
service (services/*.ts) → business logic; talks to Supabase client and/or invokes RPC stored procedures
validations (lib/validations/*.ts) → endpoint-local Zod schemas layered on @gig-hub/types
schema (schema/*.sql)   → source of truth for tables/enums/RLS/triggers/stored procedures
```

This mirrors the mobile app's layering (§2.5) so both clients treat the API the same way: thin, validated, role-gated HTTP endpoints in front of a service layer that never trusts client-supplied business rules for financial operations (those always go through Postgres RPC transactions).

## 8.3 Admin Panel Modules

| Module                      | Route                                     | Backing table(s)                                                         |
| --------------------------- | ----------------------------------------- | ------------------------------------------------------------------------ |
| Analytics dashboard         | `/admin`                                  | Aggregated via `998_get_admin_dashboard_data`                            |
| User governance             | `/admin/users`                            | `profile`                                                                |
| Departments                 | `/admin/departments`                      | `department`                                                             |
| Categories                  | `/admin/categories`                       | `category`                                                               |
| Hero banners                | `/admin/hero-banners`                     | `hero_banners`                                                           |
| Ad banners                  | `/admin/ad-banners`                       | `ad_banners`                                                             |
| Announcements               | `/admin/announcements`                    | `announcements` (+ FCM topic push)                                       |
| System configuration        | `/admin/system`                           | `system_config` (singleton)                                              |
| Escrow oversight & disputes | `/admin/escrow`, `/admin/escrow/disputes` | `escrow`                                                                 |
| Schema visualizer           | `/admin/visualizer`                       | Reads `web/schema/*.sql` directly (dev/ops tool, not tied to a DB table) |

## 8.4 Public Website Surfaces

| Area                | Route(s)                                                                      | Notes                                                                                           |
| ------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Homepage            | `/`                                                                           | Hero banners, ad banners, announcements, featured gigs/jobs (`/api/site-data`, `/api/homepage`) |
| Gigs                | `/gigs`, `/gigs/[slug]`, `/gigs/[slug]/order`                                 | Browse, detail, order placement                                                                 |
| Jobs                | `/jobs`, `/jobs/[slug]`, `/jobs/[slug]/apply`                                 | Browse, detail, proposal submission                                                             |
| Static/footer pages | `/about`, `/contact`, `/help`, `/privacy`, `/safety`, `/terms`, `/logo-story` | Marketing/legal content                                                                         |
| Auth                | `/login`, `/signup`                                                           |                                                                                                 |
| Profile dashboard   | `/profile/**`                                                                 | Gigs, jobs, orders, proposals, escrow, wallet management (own-account, non-admin)               |
| Chat                | `/chat`                                                                       | Web chat UI, same backend as mobile                                                             |

## 8.5 Notable Implementation Details

- **`withAuth({ allowedRoles })`** middleware is the single auth gate reused across every protected route — public routes are the explicit exception, not the default.
- **Firebase Admin** (`lib/firebase/admin.ts`, lazy-initialized from service-account env vars) + `send-topic-notification.ts` implement fire-and-forget push so Firebase latency/outage never affects API response times or the DB write.
- **Schema Visualizer** (`components/admin/visualizer/SchemaVisualizerContainer.tsx` + `lib/schema-parser.ts`) parses the live `web/schema/*.sql` files to render the DB structure inside the admin UI — useful for verifying this documentation stays in sync with reality.
- **Bruno collection** (`web/bruno/`) — a checked-in API client collection for manually exercising endpoints during development (alternative to Postman).
