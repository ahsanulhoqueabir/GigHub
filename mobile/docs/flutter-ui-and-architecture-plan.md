# GigHub Flutter Implementation Plan

This document outlines a premium architecture and UI/UX roadmap for the GigHub mobile application, tailored to the existing API structure.

## 1. UI/UX Design Vision

The goal is to create a **high-end, professional marketplace** experience that feels both modern and trustworthy.

### Design Principles

- **Aesthetic**: Minimalist Dark/Light mode support. Use "Deep Indigo" as the primary brand color with "Electric Blue" accents.
- **Glassmorphism**: Subtle frosted glass effects for cards and bottom navigation bars.
- **Micro-Animations**: Use `Lottie` for success states and `AnimatedSwitcher` for smooth screen transitions.
- **Typography**: `Inter` or `Outfit` for a modern, clean look.

### Key Screen Concepts

- **Home**: A dynamic feed with category bubbles, featured gigs (large horizontal cards), and "Recently Viewed" sections.
- **Gig Details**: Parallax image header, clear "Hire Me" sticky button, and nested tabs for (About, Reviews, FAQ).
- **Auth**: Sleek input fields with floating labels and social login integration.

---

## 2. Technical Architecture & Folder Structure

We will follow a **Feature-First Clean Architecture**. This ensures that each feature (Auth, Gigs, Orders) is self-contained.

```text
lib/
├── core/
│   ├── constants/         # App constants, API endpoints
│   ├── theme/             # Design system (Colors, Typography)
│   ├── utils/             # Formatters, Validators
│   ├── network/           # Dio client, Interceptors
│   └── common_widgets/    # Reusable Buttons, Inputs, Shimmers
├── features/
│   ├── auth/
│   │   ├── data/          # Repositories, Data sources, Models
│   │   ├── domain/        # Entities, Use cases (optional)
│   │   ├── presentation/  # Screens, Widgets, Providers
│   ├── gigs/
│   ├── jobs/
│   ├── orders/
│   └── profile/
├── services/              # Global services (Storage, Analytics)
└── main.dart
```

---

## 3. State Management (Riverpod)

We will use **Riverpod** (Generator version) for its robust dependency injection and state handling.

- **Auth State**: `AsyncNotifierProvider` to track `authenticated`, `unauthenticated`, or `loading` states.
- **Gigs Feed**: `FutureProvider` or `AsyncNotifier` with pagination logic.
- **Form State**: `StateProvider` for simple inputs or specialized `Notifiers` for complex forms (e.g., Gig Creation).

---

## 4. API & Auth Management (Mock-First Strategy)

Since the backend integration is deferred, we will use a **Mock Data Layer** to power the UI.

### Mock Data Strategy

- **Source**: `assets/data/mock_data.json` (Ref: [mock_data.json](file:///d:/planning/gighub/mobile/docs/mock_data.json))
- **Implementation**:
  - Create a `MockApiService` that loads the JSON using `rootBundle.loadString()`.
  - Repositories will switch between `MockApiService` and `DioClient` based on a global `isMockMode` flag.

### API Layer (Dio)

- **Base Client**: A singleton `Dio` instance configured with `BaseOptions`.
- **Interceptors**:
  - `AuthInterceptor`: Automatically attaches the JWT `Authorization` header to every request.
  - `LoggingInterceptor`: Detailed logs for debugging.
  - `RetryInterceptor`: For handling transient network failures.

### Auth Management

- **Storage**: `flutter_secure_storage` for saving the JWT and Refresh Token.
- **Token Refresh Flow**:
  1. If a 401 error occurs, the interceptor triggers the `/auth/refresh-token` endpoint.
  2. If successful, it updates the stored token and retries the original request.
  3. If refresh fails, it logs the user out and clears the state.

---

## 5. Implementation Roadmap (Phases)

### Phase 1: Foundation & Authentication

_See [Detailed Phase 1 Plan](file:///d:/planning/gighub/mobile/docs/phase-1-setup-auth.md) for step-by-step implementation and testing._

- [ ] **Step 1: Project Setup**: Initialize Flutter, add dependencies (`dio`, `flutter_riverpod`, `flutter_secure_storage`, `freezed`).
- [ ] **Step 2: Core Design System**: Define `AppTheme`, colors, and reusable UI components (Buttons, TextFields).
- [ ] **Step 3: Auth Infrastructure**: Implement `AuthRepository` and the `AuthInterceptor`.
- [ ] **Step 4: UI Implementation**: Build Login, Register, and Forgot Password screens with validation.

### Phase 2: Gig & Job Marketplace

_See [Detailed Phase 2 Plan](file:///d:/planning/gighub/mobile/docs/phase-2-gigs-jobs.md) for step-by-step implementation and testing._

- [ ] **Step 1: Models & Data**: Generate models for `Gig`, `Category`, and `User`.
- [ ] **Step 2: Home Feed**: Implement category filtering and search functionality.
- [ ] **Step 3: Gig Details**: Build the detail view with image carousels and seller info.
- [ ] **Step 4: Gig Creation**: A multi-step form for sellers to post new services (integrating with `/upload` API).

### Phase 3: Orders, Payments & Escrow

_See [Detailed Phase 3 Plan](file:///d:/planning/gighub/mobile/docs/phase-3-orders-payments.md) for step-by-step implementation and testing._

- [ ] **Step 1: Order Flow**: Implement "Hire" logic and order tracking UI.
- [ ] **Step 2: Payment Integration**: Setup UI for payment selection (Stripe/Paypal logic placeholders).
- [ ] **Step 3: Escrow Management**: UI for viewing funds in escrow and release requests.
- [ ] **Step 4: Proposal System**: UI for buyers to post jobs and sellers to send proposals.

### Phase 4: Social, Notifications & Polish

_See [Detailed Phase 4 Plan](file:///d:/planning/gighub/mobile/docs/phase-4-chat-notifications-polish.md) for step-by-step implementation and testing._

- [ ] **Step 1: Real-time Chat**: UI for messaging between buyer and seller.
- [ ] **Step 2: Notifications**: Integration with Firebase Cloud Messaging (FCM) or local polling.
- [ ] **Step 3: Profile & Reviews**: User profile management and rating system.
- [ ] **Step 4: Performance & UX**: Add shimmers for loading states, offline caching with `Isar` or `Hive`, and final UI polish.

---

## 6. Development Guidelines

- **Commits**: Use conventional commits (e.g., `feat: auth screen`, `fix: token refresh`).
- **Testing**: Prioritize Unit Tests for Repositories and Widget Tests for core components.
- **Responsiveness**: Use `LayoutBuilder` or `Sizer` to ensure the UI looks great on all screen sizes.
