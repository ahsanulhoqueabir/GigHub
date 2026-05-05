# Flutter Phase 1 — Project Setup, Auth & Profile

> **Duration Estimate:** 2 weeks
> **Dependencies:** Backend Phase 1 complete
> **Outcomes:** Flutter project structure, state management, auth flow, profile screens, design system

---

## Phase Overview

Set up the Flutter project with clean architecture, implement authentication (email/password + Google), and establish a **Mock Data Service** to power the UI using `mock_data.json`. This allows for full UI/UX validation without an active backend.

---

## Project Structure

```
gighub_app/
├── lib/
│   ├── main.dart                      # App entry point
│   ├── app.dart                       # MaterialApp configuration
│   ├── core/
│   │   ├── config/
│   │   │   ├── app_config.dart        # Environment config (API URLs)
│   │   │   ├── app_theme.dart         # ThemeData (light + dark)
│   │   │   └── app_router.dart        # GoRouter configuration
│   │   ├── constants/
│   │   │   ├── api_constants.dart     # API endpoints as constants
│   │   │   ├── app_colors.dart        # Brand colors
│   │   │   ├── app_sizes.dart         # Spacing, radius, etc.
│   │   │   └── app_strings.dart       # Static strings / labels
│   │   ├── network/
│   │   │   ├── api_client.dart        # Dio HTTP client with interceptors
│   │   │   ├── api_exceptions.dart    # Custom exception classes
│   │   │   ├── auth_interceptor.dart  # JWT attach + refresh interceptor
│   │   │   └── api_response.dart      # Generic response wrapper
│   │   ├── storage/
│   │   │   ├── secure_storage.dart    # flutter_secure_storage for tokens
│   │   │   └── local_storage.dart     # SharedPreferences / Hive for cache
│   │   └── utils/
│   │       ├── validators.dart        # Form field validators
│   │       ├── formatters.dart        # Date, currency formatters
│   │       ├── debouncer.dart         # Debounce utility
│   │       └── extensions.dart        # Dart extensions (String, DateTime)
│   ├── data/
│   │   ├── models/
│   │   │   ├── auth_model.dart        # AuthResponse, TokenPair
│   │   │   ├── profile_model.dart     # Profile, ProfileSummary
│   │   │   ├── category_model.dart    # Category
│   │   │   ├── gig_model.dart         # Phase 2
│   │   │   ├── job_model.dart         # Phase 2
│   │   │   ├── proposal_model.dart    # Phase 2
│   │   │   ├── order_model.dart       # Phase 3
│   │   │   ├── transaction_model.dart # Phase 3
│   │   │   ├── conversation_model.dart # Phase 4
│   │   │   ├── message_model.dart     # Phase 4
│   │   │   ├── notification_model.dart # Phase 4
│   │   │   ├── review_model.dart      # Phase 4
│   │   │   └── pagination_model.dart  # Generic pagination
│   │   ├── repositories/
│   │   │   ├── auth_repository.dart
│   │   │   ├── profile_repository.dart
│   │   │   ├── category_repository.dart
│   │   │   ├── gig_repository.dart    # Phase 2
│   │   │   ├── job_repository.dart    # Phase 2
│   │   │   ├── proposal_repository.dart # Phase 2
│   │   │   ├── order_repository.dart  # Phase 3
│   │   │   ├── payment_repository.dart # Phase 3
│   │   │   ├── chat_repository.dart   # Phase 4
│   │   │   ├── notification_repository.dart # Phase 4
│   │   │   ├── review_repository.dart # Phase 4
│   │   │   ├── bookmark_repository.dart # Phase 4
│   │   │   └── upload_repository.dart
│   │   └── providers/
│   │       ├── auth_provider.dart     # Riverpod providers for auth
│   │       ├── profile_provider.dart
│   │       └── category_provider.dart
│   ├── presentation/
│   │   ├── screens/
│   │   │   ├── splash/
│   │   │   │   └── splash_screen.dart
│   │   │   ├── auth/
│   │   │   │   ├── login_screen.dart
│   │   │   │   ├── register_screen.dart
│   │   │   │   └── forgot_password_screen.dart
│   │   │   ├── home/
│   │   │   │   └── home_screen.dart   # Bottom nav shell
│   │   │   ├── dashboard/
│   │   │   │   └── dashboard_screen.dart
│   │   │   ├── profile/
│   │   │   │   ├── my_profile_screen.dart
│   │   │   │   ├── edit_profile_screen.dart
│   │   │   │   ├── public_profile_screen.dart
│   │   │   │   └── settings_screen.dart
│   │   │   ├── gigs/               # Phase 2
│   │   │   ├── jobs/               # Phase 2
│   │   │   ├── orders/             # Phase 3
│   │   │   ├── wallet/             # Phase 3
│   │   │   ├── chat/               # Phase 4
│   │   │   ├── notifications/      # Phase 4
│   │   │   └── bookmarks/          # Phase 4
│   │   ├── widgets/
│   │   │   ├── common/
│   │   │   │   ├── gh_app_bar.dart
│   │   │   │   ├── gh_button.dart
│   │   │   │   ├── gh_text_field.dart
│   │   │   │   ├── gh_loading.dart
│   │   │   │   ├── gh_empty_state.dart
│   │   │   │   ├── gh_error_state.dart
│   │   │   │   ├── gh_avatar.dart
│   │   │   │   ├── gh_badge.dart
│   │   │   │   ├── gh_rating_stars.dart
│   │   │   │   ├── gh_price_tag.dart
│   │   │   │   ├── gh_category_chip.dart
│   │   │   │   ├── gh_file_upload.dart
│   │   │   │   └── gh_shimmer.dart    # Skeleton loading
│   │   │   ├── auth/
│   │   │   │   ├── login_form.dart
│   │   │   │   ├── register_form.dart
│   │   │   │   └── social_login_button.dart
│   │   │   └── profile/
│   │   │       ├── profile_card.dart
│   │   │       ├── avatar_picker.dart
│   │   │       └── skills_input.dart
│   │   └── theme/
│   │       ├── app_theme_data.dart
│   │       ├── color_scheme.dart
│   │       └── text_styles.dart
│   └── services/
│       ├── notification_service.dart    # FCM + local notifications
│       ├── socket_service.dart          # Socket.IO manager (Phase 4)
│       └── image_picker_service.dart    # Camera/gallery picker
├── assets/
│   ├── images/
│   ├── icons/
│   └── fonts/
├── test/
│   ├── unit/
│   ├── widget/
│   └── integration/
├── pubspec.yaml
├── analysis_options.yaml
└── .env
```

---

## Task Checklist

### 1.1 Project Initialization

- [ ] **1.1.1** Create Flutter project:
  ```bash
  flutter create --org com.gighub gighub_app
  ```
- [ ] **1.1.2** Configure `pubspec.yaml` — add dependencies:

  ```yaml
  dependencies:
    flutter_riverpod: ^2.x # State management
    riverpod_annotation: ^2.x
    go_router: ^14.x # Routing
    dio: ^5.x # HTTP client
    socket_io_client: ^2.x # WebSocket (Phase 4)
    flutter_secure_storage: ^9.x # Token storage
    shared_preferences: ^2.x # Local settings
    json_annotation: ^4.x # JSON serialization
    freezed_annotation: ^2.x # Immutable models
    firebase_core: ^3.x # Firebase
    firebase_auth: ^5.x # Firebase Auth (email/password + social providers)
    firebase_messaging: ^15.x # FCM push (Phase 4)
    flutter_local_notifications: ^17.x
    image_picker: ^1.x # Camera/gallery
    cached_network_image: ^3.x # Image caching
    shimmer: ^3.x # Skeleton loading
    flutter_svg: ^2.x # SVG icons
    intl: ^0.19.x # Date/number formatting
    url_launcher: ^6.x # Open URLs
    webview_flutter: ^4.x # Payment WebView (Phase 3)
    path_provider: ^2.x
    connectivity_plus: ^6.x # Network check

  dev_dependencies:
    build_runner: ^2.x
    json_serializable: ^6.x
    freezed: ^2.x
    riverpod_generator: ^2.x
    flutter_lints: ^4.x
    mockito: ^5.x
    mocktail: ^1.x
  ```

- [ ] **1.1.3** Set up environment config:
  - `.env.development`: API_URL, WS_URL
  - `.env.production`: production URLs
  - `app_config.dart` to load from env

- [ ] **1.1.4** Create the directory structure as defined above
- [ ] **1.1.5** Set up code generation:
  ```bash
  dart run build_runner build --delete-conflicting-outputs
  ```

### 1.2 Theme & Design System

- [ ] **1.2.1** Define color scheme (`presentation/theme/color_scheme.dart`):

  ```dart
  // Brand colors
  static const primary = Color(0xFF2563EB);    // Blue
  static const secondary = Color(0xFF7C3AED);  // Purple
  static const accent = Color(0xFF06B6D4);     // Cyan
  static const success = Color(0xFF22C55E);
  static const warning = Color(0xFFF59E0B);
  static const error = Color(0xFFEF4444);
  // Light & dark variants
  ```

- [ ] **1.2.2** Define text styles (`presentation/theme/text_styles.dart`):
  - headlineLarge, headlineMedium, headlineSmall
  - titleLarge, titleMedium, titleSmall
  - bodyLarge, bodyMedium, bodySmall
  - labelLarge, labelMedium, labelSmall
  - Fonts: Inter (body), Plus Jakarta Sans (headings)

- [ ] **1.2.3** Create `AppThemeData` with light and dark `ThemeData`:
  - Material 3 design
  - Custom colorScheme, textTheme, inputDecorationTheme
  - Card, AppBar, BottomNavigationBar, ElevatedButton themes

- [ ] **1.2.4** Build common widgets:
  - `GhButton` — primary, secondary, outlined, text variants + loading state
  - `GhTextField` — with label, hint, error, prefix/suffix icon, obscure
  - `GhLoading` — centered CircularProgressIndicator with optional message
  - `GhEmptyState` — illustration + message + optional CTA
  - `GhErrorState` — error message + retry button
  - `GhAvatar` — CachedNetworkImage with fallback initials
  - `GhBadge` — colored small badge with text
  - `GhRatingStars` — display 1-5 stars with half-star support
  - `GhPriceTag` — "৳1,000" formatted display
  - `GhCategoryChip` — colored chip for categories
  - `GhShimmer` — skeleton loader for content placeholders

### 1.3 Networking Layer

- [ ] **1.3.1** Create Dio API client (`core/network/api_client.dart`):

  ```dart
  class ApiClient {
    late final Dio _dio;

    ApiClient() {
      _dio = Dio(BaseOptions(
        baseUrl: AppConfig.apiUrl,
        connectTimeout: Duration(seconds: 10),
        receiveTimeout: Duration(seconds: 10),
        headers: {'Content-Type': 'application/json'},
      ));
      _dio.interceptors.add(AuthInterceptor());
      _dio.interceptors.add(LogInterceptor());
    }

    Future<ApiResponse<T>> get<T>(String path, {Map<String, dynamic>? params});
    Future<ApiResponse<T>> post<T>(String path, {dynamic data});
    Future<ApiResponse<T>> patch<T>(String path, {dynamic data});
    Future<ApiResponse<T>> delete<T>(String path);
    Future<ApiResponse<T>> upload<T>(String path, {required File file, String field = 'file'});
  }
  ```

- [ ] **1.3.2** Create auth interceptor (`core/network/auth_interceptor.dart`):
  - Attach `Authorization: Bearer <token>` to every request
  - On 401 response: attempt token refresh
  - On refresh success: retry original request
  - On refresh fail: logout, redirect to login
  - Queue concurrent requests during refresh

- [ ] **1.3.3** Create API exceptions:

  ```dart
  class ApiException implements Exception {
    final String code;
    final String message;
    final int? statusCode;
  }
  class UnauthorizedException extends ApiException { ... }
  class NetworkException extends ApiException { ... }
  class ServerException extends ApiException { ... }
  ```

- [ ] **1.3.4** Create generic API response wrapper:
  ```dart
  class ApiResponse<T> {
    final bool success;
    final T? data;
    final PaginationMeta? meta;
    final ApiException? error;
  }
  ```

### 1.4 Data Models

- [ ] **1.4.1** Create auth models (`data/models/auth_model.dart`):

  ```dart
  @freezed
  class AuthResponse with _$AuthResponse {
    factory AuthResponse({
      required String accessToken,
      required String refreshToken,
      required int expiresIn,
      required Profile profile,
    }) = _AuthResponse;
    factory AuthResponse.fromJson(Map<String, dynamic> json) => _$AuthResponseFromJson(json);
  }

  @freezed
  class RegisterInput with _$RegisterInput { ... }
  @freezed
  class LoginInput with _$LoginInput {
    const factory LoginInput.password({
      required String provider, // 'password'
      required String email,
      required String password,
    }) = _PasswordLoginInput;

    const factory LoginInput.provider({
      required String provider, // 'google' | 'github' | 'microsoft' | 'apple'
      required String firebaseIdToken,
    }) = _ProviderLoginInput;
  }
  ```

  Provider validation matrix (must match backend):
  - `password` => send `{ provider, email, password }`
  - `google|github|microsoft|apple` => send `{ provider, firebase_id_token }`
  - Never send mixed payload fields in one request

- [ ] **1.4.2** Create profile models (`data/models/profile_model.dart`):

  ```dart
  @freezed
  class Profile with _$Profile {
    factory Profile({
      required String id,
      required String displayName,
      required String username,
      required String email,
      String? avatar,
      String? bio,
      required List<String> skills,
      required String availabilityStatus,
      required bool isVerified,
      required String role,
      required double totalEarnings,
      required double avgRating,
      required int totalReviews,
      required DateTime createdAt,
    }) = _Profile;
  }

  @freezed
  class ProfileSummary with _$ProfileSummary { ... }
  ```

- [ ] **1.4.3** Create pagination model:

  ```dart
  @freezed
  class PaginatedResponse<T> with _$PaginatedResponse<T> {
    factory PaginatedResponse({
      required List<T> data,
      required PaginationMeta meta,
    }) = _PaginatedResponse;
  }

  @freezed
  class PaginationMeta with _$PaginationMeta {
    factory PaginationMeta({
      required int page,
      required int limit,
      required int total,
      required int totalPages,
    }) = _PaginationMeta;
  }
  ```

- [ ] **1.4.4** Create category model

### 1.5 Repositories

- [ ] **1.5.1** Create auth repository (`data/repositories/auth_repository.dart`):

  ```dart
  class AuthRepository {
    final ApiClient _client;

    Future<AuthResponse> register(RegisterInput input);
    Future<AuthResponse> login(LoginInput input); // provider: 'password'
    Future<AuthResponse> loginWithProvider(String provider, String firebaseIdToken);
    Future<AuthResponse> refreshToken(String refreshToken);
    Future<void> logout();
    Future<void> forgotPassword(String email);
  }
  ```

- [ ] **1.5.2** Create profile repository:

  ```dart
  class ProfileRepository {
    Future<Profile> getMyProfile();
    Future<Profile> updateMyProfile(UpdateProfileInput input);
    Future<Profile> getPublicProfile(String username);
    Future<String> uploadAvatar(File file);
    Future<void> updateFcmToken(String token);
  }
  ```

- [ ] **1.5.3** Create upload repository:
  ```dart
  class UploadRepository {
    Future<String> uploadImage(File file, String folder);
    Future<String> uploadFile(File file, String folder);
  }
  ```

### 1.6 State Management (Riverpod)

- [ ] **1.6.1** Create auth providers (`data/providers/auth_provider.dart`):

  ```dart
  @riverpod
  class AuthNotifier extends _$AuthNotifier {
    @override
    AsyncValue<AuthState> build() => const AsyncValue.loading();

    Future<void> login(LoginInput input);
    Future<void> register(RegisterInput input);
    Future<void> loginWithProvider(String provider);
    Future<void> logout();
    Future<void> initialize(); // check stored tokens
  }

  @freezed
  class AuthState with _$AuthState {
    factory AuthState.authenticated({required Profile profile}) = _Authenticated;
    factory AuthState.unauthenticated() = _Unauthenticated;
    factory AuthState.loading() = _Loading;
  }
  ```

- [ ] **1.6.2** Create profile providers:

  ```dart
  @riverpod
  class ProfileNotifier extends _$ProfileNotifier {
    @override
    AsyncValue<Profile> build();
    Future<void> updateProfile(UpdateProfileInput input);
    Future<void> updateAvatar(File file);
  }
  ```

- [ ] **1.6.3** Wire up token persistence:
  - On login: save tokens to flutter_secure_storage
  - On app start: read tokens, validate, restore auth state
  - On logout: clear tokens, clear profile cache

### 1.7 Navigation (GoRouter)

- [ ] **1.7.1** Configure GoRouter (`core/config/app_router.dart`):

  ```dart
  final router = GoRouter(
    initialLocation: '/splash',
    redirect: (context, state) {
      final isAuth = ref.read(authProvider).isAuthenticated;
      final isAuthRoute = state.matchedLocation.startsWith('/auth');

      if (!isAuth && !isAuthRoute) return '/auth/login';
      if (isAuth && isAuthRoute) return '/home';
      return null;
    },
    routes: [
      GoRoute(path: '/splash', builder: (_, __) => SplashScreen()),
      // Auth routes (no bottom nav)
      GoRoute(path: '/auth/login', builder: (_, __) => LoginScreen()),
      GoRoute(path: '/auth/register', builder: (_, __) => RegisterScreen()),
      GoRoute(path: '/auth/forgot-password', builder: (_, __) => ForgotPasswordScreen()),
      // Main app (with bottom nav shell)
      ShellRoute(
        builder: (_, __, child) => HomeScreen(child: child),
        routes: [
          GoRoute(path: '/home', builder: (_, __) => DashboardScreen()),
          GoRoute(path: '/gigs', ...),        // Phase 2
          GoRoute(path: '/jobs', ...),         // Phase 2
          GoRoute(path: '/orders', ...),       // Phase 3
          GoRoute(path: '/chat', ...),         // Phase 4
          GoRoute(path: '/profile', builder: (_, __) => MyProfileScreen()),
        ],
      ),
      // Full-screen routes (no bottom nav)
      GoRoute(path: '/u/:username', builder: (_, state) => PublicProfileScreen(username: state.pathParameters['username']!)),
      GoRoute(path: '/profile/edit', builder: (_, __) => EditProfileScreen()),
      GoRoute(path: '/profile/settings', builder: (_, __) => SettingsScreen()),
    ],
  );
  ```

- [ ] **1.7.2** Create `HomeScreen` with BottomNavigationBar:

  ```dart
  // Bottom nav tabs:
  // Home (Dashboard) | Gigs | Jobs | Chat | Profile
  // Badge on Chat for unread messages
  // Badge on Home for notifications
  ```

- [ ] **1.7.3** Create `SplashScreen`:
  - Show logo/animation
  - Check auth state (stored tokens)
  - Navigate to login or home

### 1.8 Auth Screens

- [ ] **1.8.1** Create `LoginScreen`:
  - Email + password fields
  - "Login" button with loading state
  - "Continue with Google" button
  - "Forgot Password?" link
  - "Don't have an account? Register" link
  - Form validation (email format, password not empty)
  - Error display (snackbar or inline)

- [ ] **1.8.2** Create `RegisterScreen`:
  - Fields: display_name, username, email, password, confirm_password
  - Real-time username availability check (debounced API call)
  - Password strength indicator
  - "Continue with Google" button
  - "Already have an account? Login" link
  - Form validation per field

- [ ] **1.8.3** Create `ForgotPasswordScreen`:
  - Email input
  - "Send Reset Link" button
  - Success: "Check your email" message

- [ ] **1.8.4** Implement Google Sign-In flow:
  - Use `firebase_auth` Google provider flow
  - On success: get Firebase ID token → send `{ provider: 'google', firebase_id_token }` to backend `/auth/login`
  - Handle both new and existing users

- [ ] **1.8.5** Create `SocialLoginButton` widget:
  - Google branded button
  - Loading state
  - Error handling

### 1.9 Profile Screens

- [ ] **1.9.1** Create `MyProfileScreen`:
  - View own profile (read-only)
  - "Edit Profile" FAB or button
  - Stats: rating, total reviews, total earnings, gig count
  - Skills display as chips
  - Navigation to settings

- [ ] **1.9.2** Create `EditProfileScreen`:
  - Form fields: display_name, username, bio, skills, availability_status
  - Avatar picker (camera or gallery):
    - Tap avatar → BottomSheet: "Take Photo" / "Choose from Gallery"
    - Crop image (optional: `image_cropper`)
    - Upload to R2 → update profile
  - Skills input: chip-based with text input to add
  - Save button with loading
  - Form validation

- [ ] **1.9.3** Create `PublicProfileScreen` (`/u/:username`):
  - Avatar, display name, username, bio
  - Skills chips
  - Rating + reviews count
  - "Hire" / "Contact" button → creates conversation
  - Tabs: Gigs (Phase 2), Reviews (Phase 4)
  - Loading skeleton while fetching

- [ ] **1.9.4** Create `SettingsScreen`:
  - Theme toggle (light/dark)
  - Notification preferences
  - Change password
  - Logout button
  - App version info

- [ ] **1.9.5** Create `AvatarPicker` widget:
  - Circular avatar display
  - Camera icon overlay
  - Bottom sheet with options
  - Progress indicator during upload

- [ ] **1.9.6** Create `SkillsInput` widget:
  - Chip-based input
  - Type to add, tap X to remove
  - Max 15 skills
  - Autocomplete from popular skills list

### 1.10 Utilities

- [ ] **1.10.1** Create formatters (`core/utils/formatters.dart`):

  ```dart
  String formatPrice(double amount) => '৳${NumberFormat('#,##0').format(amount)}';
  String formatDate(DateTime date) => DateFormat('MMM d, yyyy').format(date);
  String formatRelativeTime(DateTime date) => timeago.format(date);
  ```

- [ ] **1.10.2** Create validators (`core/utils/validators.dart`):

  ```dart
  String? validateEmail(String? value);
  String? validatePassword(String? value);  // min 8, upper, lower, number
  String? validateUsername(String? value);   // 3-20, alphanumeric + underscore
  String? validateRequired(String? value, String fieldName);
  ```

- [ ] **1.10.3** Create Dart extensions:
  - `String.capitalize()`, `String.initials()`
  - `DateTime.isToday()`, `DateTime.isYesterday()`

### 1.11 Testing

- [ ] **1.11.1** Unit tests: AuthRepository (login, register, token refresh)
- [ ] **1.11.2** Unit tests: AuthNotifier state transitions
- [ ] **1.11.3** Unit tests: API client interceptor (token attach, 401 handling)
- [ ] **1.11.4** Widget tests: LoginScreen (form validation, submission)
- [ ] **1.11.5** Widget tests: RegisterScreen (validation, username check)
- [ ] **1.11.6** Widget tests: ProfileEditScreen (form, avatar upload)
- [ ] **1.11.7** Integration test: full auth flow (register → login → profile)

---

## Screens Delivered in This Phase

| Screen                 | Route                   | Description             |
| ---------------------- | ----------------------- | ----------------------- |
| `SplashScreen`         | `/splash`               | Loading + auth check    |
| `LoginScreen`          | `/auth/login`           | Email/Google login      |
| `RegisterScreen`       | `/auth/register`        | New account creation    |
| `ForgotPasswordScreen` | `/auth/forgot-password` | Password reset request  |
| `HomeScreen`           | `/home`                 | Bottom nav container    |
| `DashboardScreen`      | `/home`                 | Dashboard (placeholder) |
| `MyProfileScreen`      | `/profile`              | View own profile        |
| `EditProfileScreen`    | `/profile/edit`         | Edit profile form       |
| `PublicProfileScreen`  | `/u/:username`          | Other user's profile    |
| `SettingsScreen`       | `/profile/settings`     | App settings            |

---

## Backend Endpoints Consumed

| Endpoint                     | Usage                                   |
| ---------------------------- | --------------------------------------- |
| `POST /auth/register`        | Register new account                    |
| `POST /auth/login`           | Provider-based login (password, Google) |
| `POST /auth/refresh`         | Token refresh                           |
| `POST /auth/logout`          | Logout                                  |
| `POST /auth/forgot-password` | Password reset                          |
| `GET /profiles/me`           | Get own profile                         |
| `PATCH /profiles/me`         | Update own profile                      |
| `GET /profiles/:username`    | Get public profile                      |
| `POST /upload/image`         | Avatar upload                           |

---

## Definition of Done

- [ ] Flutter project builds on Android & iOS
- [ ] Theme system with light/dark mode
- [ ] All common widgets built and reusable
- [ ] API client with JWT interceptor working
- [ ] Auth flow: register, login, Google, token refresh, logout
- [ ] Token persistence across app restarts
- [ ] Route protection (redirect unauthenticated users)
- [ ] Profile view, edit, avatar upload working
- [ ] Public profile page rendering
- [ ] Code generation (freezed, json_serializable) configured
- [ ] All tests passing

---

### 1.5 Testing & Verification

- [ ] **1.5.1** Unit tests: `AuthRepository` (login, register, token refresh)
- [ ] **1.5.2** Unit tests: `API Client` & `AuthInterceptor` (request/error handling)
- [ ] **1.5.3** Unit tests: `Validation` logic (email, password, profile fields)
- [ ] **1.5.4** Widget tests: `LoginScreen` & `RegisterScreen` rendering + validation
- [ ] **1.5.5** Widget tests: Common UI components (`GHButton`, `GHTextField`)
- [ ] **1.5.6** Manual test: Successfully persist session across app restarts
- [ ] **1.5.7** Manual test: Verify theme switching (Light/Dark) applies app-wide
- [ ] **1.5.8** Manual test: Verify logout clears all secure storage data
