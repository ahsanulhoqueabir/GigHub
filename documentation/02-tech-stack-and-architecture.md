# 2. Tech Stack & System Architecture

## 2.1 Tech Stack

### Web (`web/` — Next.js)

| Layer              | Technology                                                   |
| ------------------ | ------------------------------------------------------------ |
| Framework          | Next.js (App Router), React                                  |
| UI                 | Shadcn UI, Radix UI, Tailwind CSS v4, Framer Motion          |
| State management   | Zustand                                                      |
| Database & Auth    | Supabase (PostgreSQL + Supabase Auth + Realtime Broadcast)   |
| File storage       | Cloudflare R2 (all files)                                    |
| Image CDN          | Cloudinary (banners, gig images, avatars only)               |
| Push notifications | Firebase Cloud Messaging (`firebase-admin`, topic messaging) |
| Payments           | SSLCommerz                                                   |
| Shared types       | `@gig-hub/types` (Zod schemas + TS types)                    |

### Mobile (`app/` — Expo)

| Layer              | Technology                                                     |
| ------------------ | -------------------------------------------------------------- |
| Framework & engine | React Native 0.81.5, Expo v54, React 19                        |
| Routing            | Expo Router v6 (file-based, Stack + Tabs)                      |
| Styling            | NativeWind v4 (Tailwind CSS v3), dark-mode-first design system |
| State management   | Zustand v5 + AsyncStorage hydration                            |
| Backend client     | Axios REST client + Supabase JS v2                             |
| Gestures/animation | React Native Reanimated v4, React Native Gesture Handler       |
| Media              | Expo Image, Expo Image Picker, Expo Document Picker            |
| Notifications      | `expo-notifications`, `expo-device`                            |
| Validation         | Zod (`@gig-hub/types`)                                         |

### Shared

- **`npm-types/`** — standalone package `@gig-hub/types`, published as a `.tgz`/npm dependency and consumed by both `web/` and `app/`. Contains `src/validations/*.schema.ts` (Zod schemas — the single source of truth for request/response shapes) and `src/types/{db,business}` (derived TypeScript types).

## 2.2 High-Level Architecture

```mermaid
graph TB
    subgraph Clients
        WEB["Next.js Web App<br/>(web/app/**)"]
        MOBILE["Expo Mobile App<br/>(app/app/**)"]
    end

    subgraph "CDN & Edge"
        CF["Cloudflare CDN<br/>(R2-backed static assets, files)"]
        CL["Cloudinary CDN<br/>(image optimization)"]
    end

    subgraph "Next.js API (web/app/api/**)"
        API["REST API Routes"]
        MID["withAuth middleware<br/>(session verification, role gating)"]
    end

    subgraph Supabase
        PG[("PostgreSQL<br/>(tables + RPC stored procedures)")]
        SB_AUTH["Supabase Auth<br/>(Email/Password, sessions)"]
        SB_RT["Realtime Broadcast<br/>(chat)"]
    end

    subgraph Storage
        R2[("Cloudflare R2<br/>(all uploads: docs, gig images, attachments)")]
    end

    subgraph "External Services"
        SSL["SSLCommerz<br/>(payment gateway)"]
        FCM["Firebase Cloud Messaging<br/>(topic push: announcements)"]
    end

    subgraph Shared
        TYPES["@gig-hub/types<br/>(npm-types/) — Zod schemas + TS types"]
    end

    WEB --> CF
    WEB --> CL
    WEB --> API
    MOBILE --> API
    MOBILE --> CL
    MOBILE --> FCM

    API --> MID
    MID --> SB_AUTH
    API --> PG
    API --> SB_RT
    API --> R2
    API --> SSL
    API --> FCM

    WEB -. types .-> TYPES
    MOBILE -. types .-> TYPES
    API -. types .-> TYPES
```

**Key principle:** the mobile app never talks to Supabase or R2/Cloudinary directly for writes — it always goes through the Next.js API in `web/app/api/**`, which owns auth verification, business rules, and calls Postgres RPC (stored procedures) for anything financial (orders, escrow, wallet). This keeps all money-moving logic in one place (the database transaction), regardless of which client initiated the request.

## 2.3 Deployment Topology (target)

```mermaid
graph TB
    subgraph "Vercel"
        NEXT_WEB["Next.js Web App<br/>(Server Components)"]
        NEXT_API["Next.js API Routes<br/>(Serverless Functions)"]
    end

    subgraph "Supabase Cloud"
        SB_DB[("PostgreSQL — Managed")]
        SB_AUTH2["Auth Service"]
        SB_RT2["Realtime Broadcast"]
    end

    subgraph Cloudflare
        R2_BUCKET[("R2 Object Storage")]
        CF_EDGE["CDN Edge"]
    end

    subgraph Cloudinary
        CL_IMG["Image Optimization & Transforms"]
    end

    subgraph SSLCommerz
        SSL_GW["Payment Gateway & Webhooks"]
    end

    subgraph "App Stores"
        PLAY["Google Play (AAB)"]
        APK["Direct APK distribution<br/>(arm64-v8a / armeabi-v7a / universal)"]
    end

    NEXT_API -->|Auth & DB| SB_DB
    NEXT_API -->|Auth & DB| SB_AUTH2
    NEXT_API -->|Chat| SB_RT2
    NEXT_API -->|Upload| R2_BUCKET
    NEXT_API -->|Optimize| CL_IMG
    NEXT_API -->|Payment| SSL_GW
    NEXT_WEB -->|Client requests| NEXT_API
    R2_BUCKET -->|Origin pull| CF_EDGE
    R2_BUCKET -->|Image source| CL_IMG

    MOBILE_BUILD["Expo EAS Build"] --> PLAY
    MOBILE_BUILD --> APK
```

See [10-deployment.md](./10-deployment.md) for build/release details (EAS profiles, environment variables, CI).

## 2.4 Backend Layering Convention (`web/`)

```
web/app/api/**/route.ts   → thin HTTP handlers: parse+validate (Zod), call service, shape response, wrap in withAuth()
web/services/*.service.ts → business logic: talks to Supabase client / calls RPC stored procedures
web/lib/validations/*.ts  → local Zod schema shims (route-internal, layered on top of @gig-hub/types)
web/schema/*.sql           → source of truth for DB tables, enums, RLS, triggers, stored procedures
web/store/*.ts             → Zustand stores for the Next.js *web frontend* (not the API)
```

## 2.5 Mobile Layering Convention (`app/`)

```
app/app/**              → Expo Router file-based screens (Stack + Tabs)
app/store/*.store.ts     → Zustand stores: session, domain data, pagination, optimistic updates
app/lib/**               → API clients (Axios), notification handling, utility helpers
app/components/**        → Reusable UI, feature-scoped component folders (gigs/, jobs/, orders/, home/)
app/types/**             → TypeScript types (db/ mirrors Supabase entities, business/ is app-specific)
```
