# Flutter Phase 4 — Chat, Notifications, Reviews & Polish

> **Duration Estimate:** 2.5 weeks
> **Dependencies:** Flutter Phase 3 complete, Backend Phase 4 & 5 complete
> **Outcomes:** Real-time chat, push notifications (FCM), reviews, bookmarks, reports, offline support, production polish

---

## Phase Overview

Implement the communication layer (real-time chat via Socket.IO, push notifications via Firebase Cloud Messaging), reviews/ratings, bookmarks, report system, and final production polish including offline support, performance optimization, and app store readiness.

---

## Task Checklist

### 4.1 Socket.IO Service

- [ ] **4.1.1** Create Socket.IO service (`services/socket_service.dart`):

  ```dart
  class SocketService {
    late io.Socket _socket;

    void connect(String token) {
      _socket = io.io(AppConfig.wsUrl, io.OptionBuilder()
        .setTransports(['websocket'])
        .setAuth({'token': token})
        .build());

      _socket.onConnect((_) => debugPrint('Socket connected'));
      _socket.onDisconnect((_) => debugPrint('Socket disconnected'));
      _socket.onConnectError((e) => debugPrint('Socket error: $e'));
    }

    void disconnect() => _socket.disconnect();

    // Events
    void onNewMessage(Function(Map<String, dynamic>) callback);
    void onTyping(Function(Map<String, dynamic>) callback);
    void onNotification(Function(Map<String, dynamic>) callback);
    void onMessageRead(Function(Map<String, dynamic>) callback);

    // Emitters
    void sendMessage(String conversationId, String content, String type);
    void emitTyping(String conversationId, bool isTyping);
    void joinConversation(String conversationId);
    void leaveConversation(String conversationId);
  }
  ```

  - Singleton pattern or Riverpod Provider
  - Auto-reconnect on network restore
  - Queue messages when offline

- [ ] **4.1.2** Create Riverpod provider for socket:

  ```dart
  @riverpod
  SocketService socketService(SocketServiceRef ref) {
    final service = SocketService();
    final auth = ref.watch(authProvider);
    if (auth.isAuthenticated) {
      service.connect(auth.accessToken);
    }
    ref.onDispose(() => service.disconnect());
    return service;
  }
  ```

- [ ] **4.1.3** Wire socket events to state:
  - `new_message` → add to chat store, update conversation list
  - `typing` → update typing indicator
  - `notification` → add to notification store, show local notification
  - `message_read` → update read receipts

### 4.2 Chat Data Layer

- [ ] **4.2.1** Create conversation/message models:

  ```dart
  @freezed
  class Conversation with _$Conversation {
    factory Conversation({
      required String id,
      required ProfileSummary participant,
      Message? lastMessage,
      required int unreadCount,
      required DateTime updatedAt,
    }) = _Conversation;
  }

  @freezed
  class Message with _$Message {
    factory Message({
      required String id,
      required String conversationId,
      required ProfileSummary sender,
      required String content,
      required String type,       // text, image, file, voice, system
      String? fileUrl,
      required bool isRead,
      required DateTime createdAt,
    }) = _Message;
  }
  ```

- [ ] **4.2.2** Create chat repository:

  ```dart
  class ChatRepository {
    Future<PaginatedResponse<Conversation>> getConversations({int page = 1});
    Future<Conversation> getOrCreateConversation(String participantId);
    Future<PaginatedResponse<Message>> getMessages(String conversationId, {int page = 1});
    Future<Message> sendMessage(String conversationId, SendMessageInput input);
    Future<void> markConversationRead(String conversationId);
  }
  ```

- [ ] **4.2.3** Create chat Riverpod providers:

  ```dart
  @riverpod
  class ChatNotifier extends _$ChatNotifier {
    @override
    AsyncValue<List<Conversation>> build();
    void addMessage(String conversationId, Message message);
    void markAsRead(String conversationId);
    void updateTyping(String conversationId, String userId, bool isTyping);
  }

  @riverpod
  class MessagesNotifier extends _$MessagesNotifier {
    @override
    AsyncValue<List<Message>> build(String conversationId);
    void addMessage(Message message);
    Future<void> loadMore();
    Future<void> sendMessage(SendMessageInput input);
  }
  ```

### 4.3 Chat Screens

- [ ] **4.3.1** Create `ConversationsScreen` (`/chat`):
  - List of conversations sorted by last message time
  - Each: avatar, name, last message preview, time, unread badge
  - Pull-to-refresh
  - Search bar to filter conversations
  - Online status indicator (green dot)
  - Empty state: "No conversations yet"
  - Tap → open chat

- [ ] **4.3.2** Create `ConversationTile` widget:

  ```
  ┌──────────────────────────────────────┐
  │ 🟢 ○ John Doe                 2m ago│
  │    Hey, I'd like to order...    (2) │
  └──────────────────────────────────────┘
  ```

  - Avatar with online indicator
  - Name + last message preview (1 line, truncated)
  - Relative timestamp
  - Unread count badge (if >0)
  - Bold text for unread conversations

- [ ] **4.3.3** Create `ChatScreen` (`/chat/:id`):
  - **AppBar:** avatar + name + online status + options menu (View Profile)
  - **Message list** (reversed ListView):
    - Own messages: right-aligned, brand color bubble
    - Other's messages: left-aligned, gray bubble
    - System messages: centered, muted
    - Date separators ("Today", "Yesterday", "Mar 10")
    - Infinite scroll up for older messages
    - Auto-scroll to bottom on new message
  - **Typing indicator** (below messages)
  - **Input area:** (bottom, above keyboard)
    - Text input (auto-expanding, max 6 lines)
    - Attachment button (➕) → bottom sheet: Camera, Gallery, File
    - Send button (→) enabled only when text/attachment present
    - Voice message button (🎤) — hold to record (optional)

- [ ] **4.3.4** Create `MessageBubble` widget:
  - Text message: text with link detection
  - Image message: thumbnail preview (tap → full screen)
  - File message: file icon + name + size, tap to download
  - Voice message: play bar with duration (optional)
  - Timestamp (below bubble, small text)
  - Read receipt (✓✓ for read, ✓ for sent)
  - Swipe to reply (optional)

- [ ] **4.3.5** Create `ChatInputBar` widget:
  - TextFormField with maxLines: 6
  - Attachment button → show `AttachmentSheet`
  - Send button (animated appear when text is entered)
  - Typing indicator emission on text change (debounced 1s)

- [ ] **4.3.6** Create `AttachmentSheet` (bottom sheet):
  - Options: 📷 Camera, 🖼️ Gallery, 📁 File
  - On pick: compress image if photo, upload to R2
  - Show upload progress in chat input area
  - Attach URL to message

- [ ] **4.3.7** Create `TypingIndicator` widget:
  - "Username is typing..." with animated dots (●○○ cycling)
  - Positioned above input bar
  - Auto-hide after 3s

### 4.4 Push Notifications (FCM)

- [ ] **4.4.1** Set up Firebase in Flutter:
  - `firebase_core` + `firebase_messaging` initialization in `main.dart`
  - Android: add `google-services.json`
  - iOS: add `GoogleService-Info.plist` + APNs configuration
  - Request notification permission on first launch

- [ ] **4.4.2** Create notification service (`services/notification_service.dart`):

  ```dart
  class NotificationService {
    final FirebaseMessaging _fcm = FirebaseMessaging.instance;

    Future<void> initialize() async {
      // Request permission
      await _fcm.requestPermission(alert: true, badge: true, sound: true);

      // Get FCM token and send to backend
      final token = await _fcm.getToken();
      if (token != null) await _sendTokenToBackend(token);

      // Listen for token refresh
      _fcm.onTokenRefresh.listen(_sendTokenToBackend);

      // Foreground messages
      FirebaseMessaging.onMessage.listen(_handleForegroundMessage);

      // Background/terminated tap handler
      FirebaseMessaging.onMessageOpenedApp.listen(_handleNotificationTap);

      // Check if opened from terminated state
      final initial = await _fcm.getInitialMessage();
      if (initial != null) _handleNotificationTap(initial);
    }

    void _handleForegroundMessage(RemoteMessage message) {
      // Show local notification using flutter_local_notifications
      // Update notification store
    }

    void _handleNotificationTap(RemoteMessage message) {
      // Navigate to relevant screen based on data payload
      // e.g., order_id → OrderDetailScreen, conversation_id → ChatScreen
    }
  }
  ```

- [ ] **4.4.3** Configure local notifications (`flutter_local_notifications`):
  - Android: notification channel "GigHub" with sound
  - iOS: present as alert + badge + sound
  - Tap handler: navigate based on payload
  - Group notifications by type

- [ ] **4.4.4** Implement deep-link navigation from notifications:
  ```dart
  void navigateFromNotification(Map<String, dynamic> data) {
    final type = data['type'];
    switch (type) {
      case 'new_message':
        router.push('/chat/${data['conversation_id']}');
      case 'order_delivered':
      case 'order_completed':
        router.push('/orders/${data['order_id']}');
      case 'new_proposal':
        router.push('/jobs/${data['job_id']}/proposals');
      case 'payment_received':
        router.push('/wallet');
      // ... etc
    }
  }
  ```

### 4.5 Notifications UI

- [ ] **4.5.1** Create notification models + repository:

  ```dart
  @freezed
  class AppNotification with _$AppNotification {
    factory AppNotification({
      required String id,
      required String type,
      required String title,
      required String body,
      required Map<String, dynamic> data,
      required bool isRead,
      required DateTime createdAt,
    }) = _AppNotification;
  }

  class NotificationRepository {
    Future<PaginatedResponse<AppNotification>> getNotifications({int page = 1});
    Future<void> markAsRead(String id);
    Future<void> markAllAsRead();
    Future<int> getUnreadCount();
  }
  ```

- [ ] **4.5.2** Create `NotificationsScreen` (`/notifications`):
  - List of notifications, newest first
  - Unread items with highlight/indicator
  - "Mark all as read" action in AppBar
  - Tap → navigate to relevant screen
  - Pull-to-refresh + pagination
  - Empty state: "No notifications"

- [ ] **4.5.3** Create `NotificationTile` widget:

  ```
  ┌──────────────────────────────────┐
  │ 🔵 📦 Order Delivered            │
  │    John submitted delivery for    │
  │    "Logo Design". Review now.     │
  │                         2 min ago │
  └──────────────────────────────────┘
  ```

  - Type icon (order, message, payment, review, proposal)
  - Title + body
  - Relative time
  - Unread dot
  - Tap handler

- [ ] **4.5.4** Add notification badge to bottom nav:
  - Red badge on Home tab (for general notifications)
  - Red badge on Chat tab (for unread messages)
  - Update in real-time via Socket.IO + FCM

### 4.6 Reviews & Ratings

- [ ] **4.6.1** Create review models + repository:

  ```dart
  @freezed
  class Review with _$Review {
    factory Review({
      required String id,
      required ProfileSummary reviewer,
      required String reviewerRole,    // buyer, seller
      required int rating,
      required String comment,
      String? orderReference,
      required DateTime createdAt,
    }) = _Review;
  }

  class ReviewRepository {
    Future<Review> submitReview(String orderId, CreateReviewInput input);
    Future<PaginatedResponse<Review>> getReviewsForProfile(String profileId, {int page = 1});
    Future<PaginatedResponse<Review>> getReviewsForGig(String gigId, {int page = 1});
    Future<List<Order>> getMyPendingReviews();
  }
  ```

- [ ] **4.6.2** Create `ReviewFormSheet` (bottom sheet):
  - Star rating selector: 5 tappable stars (with animation)
  - Review comment (TextFormField, min 20 chars)
  - "Submit Review" button
  - Triggered from completed order detail

- [ ] **4.6.3** Create `ReviewCard` widget:

  ```
  ┌──────────────────────────────────┐
  │ ○ Jane Doe     ★★★★★  As Buyer  │
  │ "Excellent work! Very..."        │
  │                    Mar 10, 2026  │
  └──────────────────────────────────┘
  ```

  - Avatar + name + role badge (buyer/seller)
  - Star rating
  - Comment (expandable if long)
  - Date

- [ ] **4.6.4** Create `ReviewsList` widget:

  ```dart
  class ReviewsList extends StatelessWidget {
    final String profileId; // or gigId
    // Rating breakdown chart
    // Average rating display
    // List of ReviewCards
    // Load more / pagination
  }
  ```

  - Rating breakdown bars (5★ to 1★)
  - Average + total count
  - Paginated list of reviews

- [ ] **4.6.5** Integrate reviews:
  - Public profile screen → "Reviews" tab with ReviewsList
  - Gig detail screen → Reviews section below packages
  - Dashboard → "X orders awaiting review" prompt

### 4.7 Bookmarks & Reports

- [ ] **4.7.1** Create bookmark repository:

  ```dart
  class BookmarkRepository {
    Future<bool> toggleBookmark(String type, String targetId);  // returns new state
    Future<PaginatedResponse<Bookmark>> getMyBookmarks({String? type, int page = 1});
  }
  ```

- [ ] **4.7.2** Create `BookmarkButton` widget:
  - Heart/bookmark icon (outlined ↔ filled)
  - Optimistic UI update
  - Tap to toggle
  - Integrate into: GigCard, GigDetailScreen, JobCard, JobDetailScreen

- [ ] **4.7.3** Create `BookmarksScreen` (`/bookmarks`):
  - Tabs: "Gigs" | "Jobs"
  - Grid/list of bookmarked items (reuse GigCard/JobCard)
  - Swipe to remove
  - Empty state per tab

- [ ] **4.7.4** Create `ReportSheet` (bottom sheet):
  - Triggered from overflow menu on gig/job/profile
  - Report reason dropdown: Spam, Inappropriate, Fraud, Other
  - Description TextField (optional for predefined, required for Other)
  - "Submit Report" button
  - Success confirmation snackbar

### 4.8 Offline & Performance

- [ ] **4.8.1** Implement connectivity monitoring:

  ```dart
  // Using connectivity_plus
  // Show banner when offline: "You are offline. Some features may not work."
  // Auto-retry failed requests when back online
  ```

- [ ] **4.8.2** Implement local caching strategy:
  - Cache dashboard data (last known state)
  - Cache conversation list
  - Cache profile data
  - Use Hive or SharedPreferences
  - Show cached data + refresh indicator when online

- [ ] **4.8.3** Image caching & optimization:
  - `CachedNetworkImage` everywhere (already in use)
  - Image compression before upload (reduce to max 1MB)
  - Thumbnail generation for chat images

- [ ] **4.8.4** Performance optimization:
  - `const` constructors where possible
  - `AutomaticKeepAliveClientMixin` for tab content
  - ListView.builder for all long lists (no ListView with children)
  - Lazy loading for below-fold content
  - Profile & verify with DevTools

- [ ] **4.8.5** Memory management:
  - Dispose controllers and streams properly
  - Limit cached messages per conversation (last 100)
  - Clear image cache periodically

### 4.9 Final Polish

- [ ] **4.9.1** App icon & splash screen:
  - Custom app icon (all resolutions, Android + iOS)
  - Use `flutter_launcher_icons` package
  - Native splash screen with `flutter_native_splash`
  - Brand colors and logo

- [ ] **4.9.2** Dark mode complete audit:
  - Verify all screens in dark mode
  - Fix any color contrast issues
  - Ensure images/illustrations work in both themes

- [ ] **4.9.3** Error handling audit:
  - Every API call wrapped in try-catch
  - User-friendly error messages (not raw exceptions)
  - Snackbar or dialog for errors
  - Retry logic for transient failures
  - Network error → offline banner

- [ ] **4.9.4** Localization preparation:
  - Extract all string literals
  - Set up `flutter_localizations` + `intl`
  - Default: English
  - Future: Bengali (bn) support structure ready

- [ ] **4.9.5** Security audit:
  - Tokens stored in flutter_secure_storage (encrypted)
  - No sensitive data in logs (disable Dio log interceptor in release)
  - Certificate pinning (optional)
  - ProGuard/R8 for Android release

- [ ] **4.9.6** App store preparation:
  - Android: signing config, ProGuard, manifest permissions
  - iOS: capabilities (push notifications), plist entries
  - Privacy policy URL
  - App description & screenshots
  - Version management

### 4.10 Testing

- [ ] **4.10.1** Unit tests: SocketService event handling
- [ ] **4.10.2** Unit tests: ChatRepository + ChatNotifier
- [ ] **4.10.3** Unit tests: NotificationService FCM handling
- [ ] **4.10.4** Unit tests: ReviewRepository + BookmarkRepository
- [ ] **4.10.5** Widget tests: ConversationsScreen (list rendering)
- [ ] **4.10.6** Widget tests: ChatScreen (message display, input)
- [ ] **4.10.7** Widget tests: NotificationsScreen (list, mark read)
- [ ] **4.10.8** Widget tests: ReviewFormSheet (star selection, validation)
- [ ] **4.10.9** Widget tests: BookmarksScreen (tabs, toggle)
- [ ] **4.10.10** Integration test: full journey — register → create gig → receive order → chat → complete → review
- [ ] **4.10.11** Performance test: measure startup time, frame rate on key screens

---

## Screens Delivered in This Phase

| Screen                | Route            | Description            |
| --------------------- | ---------------- | ---------------------- |
| `ConversationsScreen` | `/chat`          | Chat conversation list |
| `ChatScreen`          | `/chat/:id`      | Message thread         |
| `NotificationsScreen` | `/notifications` | All notifications      |
| `BookmarksScreen`     | `/bookmarks`     | Saved gigs & jobs      |

---

## Key Widgets Delivered

| Widget             | Purpose                          |
| ------------------ | -------------------------------- |
| `ConversationTile` | Chat list item                   |
| `MessageBubble`    | Chat message display             |
| `ChatInputBar`     | Message compose area             |
| `AttachmentSheet`  | File/image picker                |
| `TypingIndicator`  | Real-time typing status          |
| `NotificationTile` | Notification list item           |
| `ReviewFormSheet`  | Star rating + review form        |
| `ReviewCard`       | Review display                   |
| `ReviewsList`      | Paginated reviews with breakdown |
| `BookmarkButton`   | Toggle bookmark on gig/job       |
| `ReportSheet`      | Report content form              |

---

## Backend Endpoints Consumed

| Endpoint                           | Usage                        |
| ---------------------------------- | ---------------------------- |
| `GET /conversations`               | Conversation list            |
| `POST /conversations`              | Create/get conversation      |
| `GET /conversations/:id/messages`  | Message history              |
| `POST /conversations/:id/messages` | Send message (REST fallback) |
| `PATCH /conversations/:id/read`    | Mark read                    |
| `GET /notifications`               | Notification list            |
| `PATCH /notifications/:id/read`    | Mark as read                 |
| `PATCH /notifications/read-all`    | Mark all read                |
| `GET /notifications/unread-count`  | Badge count                  |
| `POST /orders/:id/reviews`         | Submit review                |
| `GET /profiles/:id/reviews`        | Profile reviews              |
| `GET /gigs/:id/reviews`            | Gig reviews                  |
| `POST /bookmarks`                  | Toggle bookmark              |
| `GET /bookmarks/me`                | My bookmarks                 |
| `POST /reports`                    | Submit report                |
| `PATCH /profiles/me/fcm-token`     | Register FCM token           |
| WebSocket: `send_message`          | Real-time message            |
| WebSocket: `typing`                | Typing indicator             |
| WebSocket: `notification`          | Live notifications           |

---

## Definition of Done

- [ ] Real-time chat working: send, receive, images, files
- [ ] Typing indicator and read receipts functional
- [ ] Push notifications (FCM) working on Android & iOS
- [ ] Notification tap navigates to correct screen
- [ ] In-app notifications list with mark read
- [ ] Review submission and display working
- [ ] Bookmarks toggle and list functional
- [ ] Report submission working
- [ ] Offline: cached data shown, offline banner
- [ ] Dark mode fully supported
- [ ] App icon and splash screen configured
- [ ] Performance: smooth scrolling, fast startup
- [ ] Security: tokens encrypted, no sensitive logs
- [ ] All tests passing
- [ ] E2E user journey verified
- [ ] Ready for app store submission
