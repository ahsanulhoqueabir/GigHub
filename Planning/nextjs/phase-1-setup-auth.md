# Next.js Phase 1 — Project Setup, Auth & Profile UI

> **Duration Estimate:** 2 weeks
> **Dependencies:** Backend Phase 1 complete
> **Outcomes:** Working auth flow, profile pages, project structure, design system

---

## Phase Overview

Set up the Next.js 14 (App Router) project with a clean architecture, integrate authentication with the NestJS backend, build profile pages, and establish the design system and shared UI components.

---

## Project Structure

```
gighub-web/
├── app/
│   ├── (auth)/                     # Auth group (no sidebar layout)
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── layout.tsx              # Auth layout (centered card)
│   ├── (main)/                     # Main app group (with sidebar/navbar)
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── gigs/                   # Phase 2
│   │   │   ├── page.tsx            # Browse gigs
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx        # Gig detail
│   │   │   ├── create/
│   │   │   │   └── page.tsx        # Create gig
│   │   │   └── me/
│   │   │       └── page.tsx        # My gigs
│   │   ├── jobs/                   # Phase 2
│   │   │   ├── page.tsx
│   │   │   ├── [slug]/
│   │   │   │   └── page.tsx
│   │   │   ├── create/
│   │   │   │   └── page.tsx
│   │   │   └── me/
│   │   │       └── page.tsx
│   │   ├── orders/                 # Phase 3
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── chat/                   # Phase 4
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   │   ├── profile/
│   │   │   ├── page.tsx            # My profile (edit)
│   │   │   └── settings/
│   │   │       └── page.tsx
│   │   ├── notifications/          # Phase 4
│   │   │   └── page.tsx
│   │   ├── bookmarks/              # Phase 4
│   │   │   └── page.tsx
│   │   ├── wallet/                 # Phase 3
│   │   │   └── page.tsx
│   │   └── layout.tsx              # Main layout (navbar + sidebar)
│   ├── u/                          # Public profiles
│   │   └── [username]/
│   │       └── page.tsx
│   ├── layout.tsx                  # Root layout
│   ├── page.tsx                    # Landing page
│   ├── not-found.tsx
│   └── globals.css
├── components/
│   ├── ui/                         # Shadcn/ui base components
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   ├── Sidebar.tsx
│   │   ├── Footer.tsx
│   │   └── MobileNav.tsx
│   ├── auth/
│   │   ├── LoginForm.tsx
│   │   ├── RegisterForm.tsx
│   │   └── SocialLoginButton.tsx
│   ├── profile/
│   │   ├── ProfileCard.tsx
│   │   ├── ProfileEditForm.tsx
│   │   ├── AvatarUpload.tsx
│   │   └── SkillsInput.tsx
│   ├── gigs/                       # Phase 2
│   ├── jobs/                       # Phase 2
│   ├── orders/                     # Phase 3
│   ├── chat/                       # Phase 4
│   ├── reviews/                    # Phase 4
│   └── shared/
│       ├── CategoryBadge.tsx
│       ├── RatingStars.tsx
│       ├── PriceTag.tsx
│       ├── UserAvatar.tsx
│       ├── EmptyState.tsx
│       ├── LoadingSpinner.tsx
│       ├── Pagination.tsx
│       ├── SearchBar.tsx
│       └── FileUpload.tsx
├── lib/
│   ├── api/
│   │   ├── client.ts              # Axios/fetch client with JWT interceptor
│   │   ├── auth.ts                # Auth API functions
│   │   ├── profiles.ts            # Profile API functions
│   │   ├── gigs.ts                # Phase 2
│   │   ├── jobs.ts                # Phase 2
│   │   ├── proposals.ts           # Phase 2
│   │   ├── orders.ts              # Phase 3
│   │   ├── payments.ts            # Phase 3
│   │   ├── chat.ts                # Phase 4
│   │   ├── notifications.ts       # Phase 4
│   │   ├── reviews.ts             # Phase 4
│   │   ├── bookmarks.ts           # Phase 4
│   │   └── upload.ts              # Upload API functions
│   ├── hooks/
│   │   ├── useAuth.ts
│   │   ├── useProfile.ts
│   │   ├── useSocket.ts           # Phase 4
│   │   └── useNotifications.ts    # Phase 4
│   ├── store/                     # Zustand stores
│   │   ├── auth-store.ts
│   │   ├── profile-store.ts
│   │   ├── notification-store.ts  # Phase 4
│   │   └── chat-store.ts         # Phase 4
│   ├── utils/
│   │   ├── cn.ts                  # Class name utility
│   │   ├── format.ts             # Date, currency, number formatters
│   │   └── validation.ts         # Form validation schemas (Zod)
│   └── types/
│       ├── auth.ts
│       ├── profile.ts
│       ├── gig.ts                 # Phase 2
│       ├── job.ts                 # Phase 2
│       ├── order.ts               # Phase 3
│       ├── chat.ts                # Phase 4
│       ├── review.ts              # Phase 4
│       └── api.ts                 # Common API response types
├── public/
│   ├── images/
│   └── icons/
├── middleware.ts                   # Auth middleware (protect routes)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Task Checklist

### 1.1 Project Initialization

- [ ] **1.1.1** Create Next.js 14 project with App Router:
  ```bash
  npx create-next-app@latest gighub-web --typescript --tailwind --eslint --app --src-dir=false
  ```
- [ ] **1.1.2** Install core dependencies:
  ```
  shadcn/ui (init), zustand, axios, zod, react-hook-form, @hookform/resolvers
  lucide-react, date-fns, socket.io-client (Phase 4), next-themes
  ```
- [ ] **1.1.3** Configure Tailwind with custom GigHub theme:
  ```
  Colors: primary (brand blue), secondary, accent, success, warning, error
  Fonts: Inter (body), Plus Jakarta Sans (headings)
  Breakpoints: sm (640), md (768), lg (1024), xl (1280)
  ```
- [ ] **1.1.4** Initialize shadcn/ui and install base components:
  ```
  button, input, label, card, dialog, dropdown-menu, avatar, badge,
  tabs, select, textarea, toast, skeleton, separator, sheet
  ```
- [ ] **1.1.5** Set up environment variables:
  ```
  NEXT_PUBLIC_API_URL=http://localhost:3000/v1
  NEXT_PUBLIC_WS_URL=http://localhost:3000
  NEXT_PUBLIC_FIREBASE_API_KEY=...
  NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
  NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
  ```
- [ ] **1.1.6** Create the directory structure as defined above

### 1.2 API Client Layer

- [ ] **1.2.1** Create base API client (`lib/api/client.ts`):
  - Axios instance with base URL from env
  - Request interceptor: attach JWT from store/cookie
  - Response interceptor: handle 401 → auto-refresh token
  - Error handling: parse API error format

  ```typescript
  const apiClient = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });
  apiClient.interceptors.request.use(/* attach token */);
  apiClient.interceptors.response.use(/* handle errors, refresh */);
  ```

- [ ] **1.2.2** Create auth API functions (`lib/api/auth.ts`):

  ```typescript
  register(data: RegisterInput): Promise<AuthResponse>
  login(data: LoginInput): Promise<AuthResponse> // provider: 'password'
  loginWithProvider(provider: 'google' | 'github' | 'microsoft' | 'apple', firebaseIdToken: string): Promise<AuthResponse>
  refreshToken(refreshToken: string): Promise<TokenResponse>
  logout(): Promise<void>
  forgotPassword(email: string): Promise<void>
  resetPassword(data: ResetPasswordInput): Promise<void>
  ```

- [ ] **1.2.3** Create profile API functions (`lib/api/profiles.ts`):

  ```typescript
  getMyProfile(): Promise<Profile>
  updateMyProfile(data: UpdateProfileInput): Promise<Profile>
  getPublicProfile(username: string): Promise<PublicProfile>
  uploadAvatar(file: File): Promise<{ url: string }>
  updateFCMToken(token: string): Promise<void>
  ```

- [ ] **1.2.4** Create upload API functions (`lib/api/upload.ts`):
  ```typescript
  uploadImage(file: File, folder: string): Promise<UploadResponse>
  uploadFile(file: File, folder: string): Promise<UploadResponse>
  deleteFile(key: string): Promise<void>
  ```

### 1.3 TypeScript Types

- [ ] **1.3.1** Define API response types (`lib/types/api.ts`):

  ```typescript
  interface ApiResponse<T> {
    success: boolean;
    data: T;
    meta?: PaginationMeta;
  }
  interface ApiError {
    code: string;
    message: string;
    details?: any[];
  }
  interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  }
  ```

- [ ] **1.3.2** Define auth types (`lib/types/auth.ts`):

  ```typescript
  interface AuthResponse {
    access_token: string;
    refresh_token: string;
    expires_in: number;
    profile: Profile;
  }
  interface RegisterInput {
    email: string;
    password: string;
    display_name: string;
    username: string;
  }
  interface LoginInput {
    provider: "password";
    email: string;
    password: string;
  }
  interface ProviderLoginInput {
    provider: "google" | "github" | "microsoft" | "apple";
    firebase_id_token: string;
  }
  ```

  Provider validation matrix (must match backend):
  - `password` => send `{ provider, email, password }`
  - `google|github|microsoft|apple` => send `{ provider, firebase_id_token }`
  - Never mix password fields with `firebase_id_token` in the same payload

- [ ] **1.3.3** Define profile types (`lib/types/profile.ts`):
  ```typescript
  interface Profile {
    id: string;
    display_name: string;
    username: string;
    email: string;
    avatar: string | null;
    bio: string | null;
    skills: string[];
    availability_status: "available" | "busy" | "offline";
    is_verified: boolean;
    role: "student" | "admin";
    total_earnings: number;
    avg_rating: number;
    total_reviews: number;
    created_at: string;
  }
  ```

### 1.4 Auth State Management

- [ ] **1.4.1** Create Zustand auth store (`lib/store/auth-store.ts`):

  ```typescript
  interface AuthStore {
    user: Profile | null;
    accessToken: string | null;
    refreshToken: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (response: AuthResponse) => void;
    logout: () => void;
    updateProfile: (profile: Partial<Profile>) => void;
    setTokens: (access: string, refresh: string) => void;
    initialize: () => Promise<void>; // check stored tokens on mount
  }
  ```

  - Persist tokens in httpOnly cookies (via API route) or localStorage
  - On mount: check if valid token exists, fetch profile if yes

- [ ] **1.4.2** Create auth hook (`lib/hooks/useAuth.ts`):
  - Wrapper around auth store with convenience methods
  - `isAuthenticated`, `user`, `login()`, `logout()`, `register()`

- [ ] **1.4.3** Create Next.js middleware (`middleware.ts`):
  - Protect routes under `(main)` — redirect to `/login` if no token
  - Allow public routes: `/`, `/login`, `/register`, `/u/[username]`, `/gigs`, `/jobs`
  - Redirect authenticated users away from auth pages

### 1.5 Auth UI Pages

- [ ] **1.5.1** Create auth layout (`app/(auth)/layout.tsx`):
  - Centered card layout with GigHub branding
  - Responsive: full-width on mobile, max-w-md on desktop
  - Background pattern or illustration

- [ ] **1.5.2** Create Login page (`app/(auth)/login/page.tsx`):
  - Email/password form with validation (Zod + react-hook-form)
  - "Continue with Google" button
  - "Don't have an account? Register" link
  - "Forgot password?" link
  - Loading state, error display
  - On success: redirect to `/dashboard`

- [ ] **1.5.3** Create Register page (`app/(auth)/register/page.tsx`):
  - Fields: display_name, username, email, password, confirm_password
  - Real-time username availability check (debounced)
  - Password strength indicator
  - "Continue with Google" button
  - "Already have an account? Login" link
  - On success: redirect to profile setup or dashboard

- [ ] **1.5.4** Create Forgot Password page
- [ ] **1.5.5** Implement Google OAuth flow:
  - Use Firebase JS SDK (`firebase/auth`) Google provider flow
  - On Google sign-in: send `{ provider: 'google', firebase_id_token }` to backend `/auth/login`
  - Handle new user flow vs returning user

- [ ] **1.5.6** Create `SocialLoginButton` component:
  - Google branded button with icon
  - Loading state

### 1.6 Layout Components

- [ ] **1.6.1** Create root layout (`app/layout.tsx`):
  - HTML meta, fonts, theme provider
  - Toast provider (sonner or shadcn toast)
  - Auth initialization on mount

- [ ] **1.6.2** Create main layout (`app/(main)/layout.tsx`):
  - Navbar (top) + optional sidebar
  - Mobile: bottom navigation bar or hamburger menu
  - Content area with max-width container

- [ ] **1.6.3** Create `Navbar` component:
  - Logo (left)
  - Search bar (center) — Phase 2
  - Navigation links: Gigs, Jobs
  - Right side: notifications icon (with badge), chat icon (with badge), user avatar dropdown
  - User dropdown: Profile, Dashboard, Settings, Logout

- [ ] **1.6.4** Create `MobileNav` component:
  - Bottom tab bar: Home, Gigs, Jobs, Chat, Profile
  - Active state indicator

- [ ] **1.6.5** Create `Footer` component:
  - About, Contact, Terms, Privacy links
  - "Made for JnU" tagline

### 1.7 Profile UI

- [ ] **1.7.1** Create `ProfileEditForm` component:
  - Edit display_name, username, bio, skills, availability_status
  - Avatar upload with preview
  - Skills input (tag-style with autocomplete)
  - Form validation with Zod

- [ ] **1.7.2** Create `AvatarUpload` component:
  - Click to upload or drag-and-drop
  - Image crop/preview before upload
  - Upload to R2 via `/upload/image`
  - Show current avatar or placeholder

- [ ] **1.7.3** Create `SkillsInput` component:
  - Tag-style input (type and press Enter to add)
  - Remove individual tags
  - Autocomplete from common skills list
  - Max 15 skills

- [ ] **1.7.4** Create My Profile page (`app/(main)/profile/page.tsx`):
  - Profile edit form
  - Preview of public profile
  - Save changes with loading state

- [ ] **1.7.5** Create Profile Settings page (`app/(main)/profile/settings/page.tsx`):
  - Notification preferences
  - Change password
  - Account management

- [ ] **1.7.6** Create Public Profile page (`app/u/[username]/page.tsx`):
  - Server-side rendered (SEO)
  - Display: avatar, name, username, bio, skills, rating, reviews
  - Tabs: Gigs (Phase 2), Reviews (Phase 4)
  - "Contact" button → starts pre-order chat

### 1.8 Shared Components

- [ ] **1.8.1** Create `UserAvatar` — displays avatar with fallback initials
- [ ] **1.8.2** Create `RatingStars` — displays 1–5 star rating
- [ ] **1.8.3** Create `CategoryBadge` — colored badge for categories
- [ ] **1.8.4** Create `PriceTag` — formatted BDT price display
- [ ] **1.8.5** Create `EmptyState` — illustration + message for empty lists
- [ ] **1.8.6** Create `LoadingSpinner` — consistent loading indicator
- [ ] **1.8.7** Create `Pagination` — page navigation component
- [ ] **1.8.8** Create `FileUpload` — reusable file upload with progress

### 1.9 Utility Functions

- [ ] **1.9.1** Create formatters (`lib/utils/format.ts`):
  - `formatPrice(amount)` → "৳1,000"
  - `formatDate(date)` → "Mar 11, 2026"
  - `formatRelativeTime(date)` → "2 hours ago"
  - `formatRating(rating)` → "4.8"

- [ ] **1.9.2** Create validation schemas (`lib/utils/validation.ts`):
  - `loginSchema`, `registerSchema`, `profileUpdateSchema`
  - Reusable field validators (email, username, password)

### 1.10 Testing

- [ ] **1.10.1** Set up testing: Vitest + React Testing Library
- [ ] **1.10.2** Test LoginForm: form submission, validation errors, loading state
- [ ] **1.10.3** Test RegisterForm: field validation, username check, submission
- [ ] **1.10.4** Test auth store: login, logout, token refresh
- [ ] **1.10.5** Test middleware: redirect logic for protected/public routes
- [ ] **1.10.6** Test profile edit form: field updates, avatar upload

---

## Pages Delivered in This Phase

| Route               | Page                       | Status |
| ------------------- | -------------------------- | ------ |
| `/`                 | Landing Page (placeholder) | 🔲     |
| `/login`            | Login                      | 🔲     |
| `/register`         | Register                   | 🔲     |
| `/forgot-password`  | Forgot Password            | 🔲     |
| `/dashboard`        | Dashboard (placeholder)    | 🔲     |
| `/profile`          | Edit Profile               | 🔲     |
| `/profile/settings` | Settings                   | 🔲     |
| `/u/[username]`     | Public Profile             | 🔲     |

---

## Definition of Done

- [ ] Project structure established and clean
- [ ] Shadcn/ui components installed and themed
- [ ] API client with JWT interceptor working
- [ ] Auth flow complete: register, login, Google, logout
- [ ] Token refresh working transparently
- [ ] Route protection via middleware
- [ ] Profile edit and avatar upload working
- [ ] Public profile page rendering (SSR)
- [ ] All shared components built and documented
- [ ] Responsive on mobile and desktop
- [ ] All tests passing
