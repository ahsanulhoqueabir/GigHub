# GigHub

GigHub is a Flutter-based freelance marketplace app. It follows a feature-first clean
architecture and uses Riverpod for state management with GoRouter for navigation.

## Minimum Device Requirements

### Android

- **Minimum SDK**: Configured via `flutter.minSdkVersion` in
  `android/app/build.gradle.kts`. (Default Flutter template is Android 5.0 / API 21.)
- **Target SDK**: Configured via `flutter.targetSdkVersion`.
- **CPU**: ARM64 recommended (typical Flutter requirement for modern devices).

### iOS

- **Minimum iOS Version**: 13.0 (from `ios/Runner.xcodeproj/project.pbxproj`).

## Key Features

### Implemented / In Progress

- Auth foundation (email/password + Google sign-in planned)
- App theming (light/dark) and persisted theme mode
- Mock-first data strategy for UI development
- Modular architecture with clean separation of core, data, and presentation layers

### Planned (Roadmap)

- Gig browsing, search, filters, and gig creation
- Job board and proposal system
- Orders, escrow, and payment flow (WebView)
- Real-time chat (Socket.IO)
- Push notifications (FCM) + local notifications
- Reviews, bookmarks, and profile management

## Permissions and Usage

> Note: Production permissions are **not yet declared** in the main
> Android manifest or iOS Info.plist. Add them when enabling the features below.

### Android

- `android.permission.INTERNET`
  - **Why**: API calls, auth, gig feeds, payments, chat, notifications.
  - **Where**: `android/app/src/main/AndroidManifest.xml`.

- `android.permission.POST_NOTIFICATIONS` (Android 13+)
  - **Why**: Show push/local notifications.
  - **Runtime**: Request at runtime on Android 13+.

- `android.permission.CAMERA`
  - **Why**: Capture profile/gig images with `image_picker`.
  - **Runtime**: Request at runtime when opening camera.

- `android.permission.READ_MEDIA_IMAGES` (Android 13+) /
  `android.permission.READ_EXTERNAL_STORAGE` (Android 12 and below)
  - **Why**: Pick images from gallery with `image_picker`.
  - **Runtime**: Request at runtime on first use.

### iOS (Info.plist)

- `NSCameraUsageDescription`
  - **Why**: Capture profile/gig images.

- `NSPhotoLibraryUsageDescription`
  - **Why**: Select images from photo library.

## Tech Stack (Key Packages)

- State: `flutter_riverpod`, `riverpod_annotation`
- Routing: `go_router`
- Networking: `dio`
- Storage: `flutter_secure_storage`, `shared_preferences`
- Auth: `firebase_auth`, `google_sign_in`
- Notifications: `firebase_messaging`, `flutter_local_notifications`
- Media: `image_picker`, `cached_network_image`

## Development Notes

- Mock data is used to drive UI before backend integration.
- Use `flutter pub run build_runner build` for code generation.

## Demo Login Credentials

Use the following credentials to log in during development:

| Email           | Password  |
| --------------- | --------- |
| demo@gighub.com | @Demo1234 |

The mock login simulates a real sign-in experience with session persistence. After login, the session is saved and restored on app restart.

## Resources

- [Learn Flutter](https://docs.flutter.dev/get-started/learn-flutter)
- [Flutter documentation](https://docs.flutter.dev/)
