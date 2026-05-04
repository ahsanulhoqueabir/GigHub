# Backend Phase 4 — Communication: Chat & Notifications

> **Duration Estimate:** 2 weeks
> **Dependencies:** Phase 3 complete (Orders — for order-linked chat + order event notifications)
> **Outcomes:** Real-time chat system, in-app notifications, push notifications (FCM), email notifications

---

## Phase Overview

Implement real-time 1:1 chat messaging via Socket.IO, the notification system (in-app, push, email), and wire up all notification triggers from previous phases.

This phase also covers the tuition-request acceptance chat handoff (accepted tuition request opens a linked chat without creating an order).

---

## Task Checklist

### 4.1 Directus Collections Setup

- [ ] **4.1.1** Create `gh_conversations` collection with all fields
- [ ] **4.1.2** Create `gh_messages` collection with all fields and indexes
- [ ] **4.1.3** Create `gh_notifications` collection with all fields and indexes
- [ ] **4.1.4** Set up foreign key relations:
  - `gh_conversations.participant_1` / `participant_2` → `gh_profiles.id`
  - `gh_conversations.order` → `gh_orders.id`
  - `gh_conversations.gig` → `gh_gigs.id`
  - `gh_messages.conversation` → `gh_conversations.id` (cascade delete)
  - `gh_messages.sender` → `gh_profiles.id`
  - `gh_notifications.profile` → `gh_profiles.id`
- [ ] **4.1.5** Create partial index on `gh_messages(conversation, is_read)` WHERE `is_read = false`
- [ ] **4.1.6** Create index on `gh_notifications(profile, is_read)` WHERE `is_read = false`

### 4.2 Chat Module — REST Endpoints

- [ ] **4.2.1** Create `ChatModule` with:
  - `ConversationService` — instance methods for `gh_conversations` logic
  - `MessageService` — instance methods for `gh_messages` logic
  - `ChatController` — REST endpoints (injects services via constructor)
  - `ChatGateway` — Socket.IO WebSocket gateway
  - `src/types/conversation.types.ts` — Conversation interfaces
  - `src/types/message.types.ts` — Message interfaces
  - DTOs: `CreateConversationDto`, `SendMessageDto`, `ConversationResponseDto`, `MessageResponseDto`

- [ ] **4.2.2** Implement `POST /conversations` — Start conversation:
  1. Validate: participant_id exists and is not self
  2. Check for existing conversation between these two users:
     - If `gig_id` provided: check for existing gig inquiry conversation
     - If `order_id` provided: check for existing order conversation
     - If neither: check for general conversation
  3. If exists, return existing conversation
  4. Create `gh_conversations` record
  5. If `initial_message` provided, create first `gh_messages` record
  6. Return conversation

- [ ] **4.2.2a** Support tuition session context in conversations:
  - Accept optional `job_id` when the source listing is `job_type=tuition`
  - Ensure accepted tuition request opens/reuses linked chat channel

- [ ] **4.2.3** Implement `GET /conversations` — List my conversations:
  - Return conversations where user is participant_1 or participant_2
  - Include other participant's info (display_name, username, avatar, online status)
  - Include last_message_text, last_message_at
  - Include unread_count (count of messages where sender ≠ me and is_read = false)
  - Sort by last_message_at desc
  - Pagination

- [ ] **4.2.4** Implement `GET /conversations/:id` — Get conversation detail:
  - Verify user is a participant
  - Return conversation info + other participant's profile
  - Return latest messages (last 50)
  - Mark all unread messages as read (auto-read on open)

- [ ] **4.2.5** Implement `GET /conversations/:id/messages` — Paginated messages:
  - Cursor-based pagination (`before` timestamp)
  - Default limit: 50 messages
  - Return messages with sender info
  - Sort by created_at desc

- [ ] **4.2.6** Implement `POST /conversations/:id/messages` — Send message (REST fallback):
  - Verify user is a participant
  - Create `gh_messages` record
  - Update `gh_conversations.last_message_at` and `last_message_text`
  - Emit WebSocket event to other participant
  - Return created message

- [ ] **4.2.7** Implement `PATCH /conversations/:id` — Consolidated update:
  - Expects `type` field in payload: `mark_read`
  - Logic: Update all unread messages where sender ≠ current user
  - Set `is_read = true`, `read_at = now()`
  - Emit read receipt via WebSocket

### 4.3 Chat Module — WebSocket Gateway

- [ ] **4.3.1** Create `ChatGateway` extending NestJS WebSocketGateway:

  ```typescript
  @WebSocketGateway({
    cors: { origin: ['http://localhost:3001', 'https://gighub.app'] },
    namespace: '/'
  })
  ```

- [ ] **4.3.2** Implement WebSocket authentication:
  - Extract JWT from `client.handshake.auth.token`
  - Verify JWT and extract `profile_id`
  - Reject connection if invalid/expired
  - Store socket ↔ profile_id mapping

- [ ] **4.3.3** Implement connection management:
  - `handleConnection`: authenticate, store mapping, broadcast online status
  - `handleDisconnect`: remove mapping, broadcast offline status
  - Track online users with in-memory Map<profile_id, socket_id[]>

- [ ] **4.3.4** Implement `join_conversation` event:
  - Client joins a Socket.IO room named `conversation:${conversation_id}`
  - Verify user is a participant of this conversation

- [ ] **4.3.5** Implement `leave_conversation` event:
  - Client leaves the room

- [ ] **4.3.6** Implement `send_message` event:
  1. Validate message content (non-empty text or file_url for non-text types)
  2. Create `gh_messages` record via ChatService
  3. Update conversation's last_message fields
  4. Emit `new_message` to the conversation room
  5. If recipient is not in the room, emit as a notification

- [ ] **4.3.7** Implement `typing_start` / `typing_stop` events:
  - Emit `user_typing` event to conversation room (excluding sender)
  - Auto-stop after 5 second timeout

- [ ] **4.3.8** Implement `mark_read` event:
  - Mark messages as read up to the given message_id
  - Emit `message_read` event to other participant

- [ ] **4.3.9** Implement system messages:
  - Create helper: `sendSystemMessage(conversationId, content)`
  - Used for order events: "Order started", "Delivery submitted", "Order completed", etc.
  - `message_type = 'system'`, `sender` = null or system user

### 4.4 Chat File Sharing

- [ ] **4.4.1** Support image messages:
  - Client uploads image to R2 via `/upload/image` (folder: `chat`)
  - Sends message with `message_type: 'image'`, `file_url`, `file_name`, `file_size`

- [ ] **4.4.2** Support file messages:
  - Client uploads file to R2 via `/upload/file` (folder: `chat`)
  - Sends message with `message_type: 'file'`, `file_url`, `file_name`, `file_size`

- [ ] **4.4.3** Support voice messages:
  - Client uploads audio to R2 via `/upload/file` (folder: `chat`)
  - Sends message with `message_type: 'voice'`, `file_url`, `file_size`

### 4.5 Notification Module

- [ ] **4.5.1** Create `NotificationModule` with:
  - `NotificationService` — instance methods for `gh_notifications` logic
  - `NotificationController` — REST endpoints (injects `NotificationService` via constructor)
  - `PushNotificationService` — FCM integration (injectable NestJS service)
  - `EmailNotificationService` — transactional emails (injectable NestJS service)
  - `src/types/notification.types.ts` — Notification interfaces and enums

#### In-App Notifications

- [ ] **4.5.2** Implement notification creation helper:

  ```typescript
  async createNotification(params: {
    profile: string,
    type: NotificationType,
    title: string,
    body: string,
    data?: { entity_type, entity_id, action_url }
  })
  ```

  - Create `gh_notifications` record
  - Emit real-time `notification` event via Socket.IO (if user online)
  - Trigger push notification (if user offline and FCM token exists)

- [ ] **4.5.3** Implement `GET /notifications` — List notifications:
  - Filter by `type`, `is_read`
  - Paginated, sorted by created_at desc

- [ ] **4.5.4** Implement `GET /notifications/unread-count`:
  - Return count of unread notifications

- [ ] **4.5.5** Implement `PATCH /notifications` — Consolidated read actions:
  - Expects `type` field in payload: `read_single`, `read_all`
  - Logic: Controller calls specific `NotificationService` methods based on `type`
  - If `read_single`: Mark one notification with given `id` as read
  - If `read_all`: Mark all as read for current user

#### Push Notifications (FCM)

- [ ] **4.5.7** Set up Firebase Admin SDK:

  ```
  FIREBASE_PROJECT_ID, FIREBASE_PRIVATE_KEY, FIREBASE_CLIENT_EMAIL
  ```

- [ ] **4.5.8** Implement `PushNotificationService`:
  - `sendPush(fcm_token, title, body, data)` — send single notification
  - Handle token expiry (remove invalid tokens from profiles)
  - Respect user's `notification_prefs`

- [ ] **4.5.9** Integrate push with notification creation:
  - If user is offline (no active socket), send push notification
  - Include `data` payload for deep linking in Flutter app

#### Email Notifications

- [ ] **4.5.10** Set up email service (Resend or Nodemailer + SMTP):

  ```
  EMAIL_FROM, SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS
  // or RESEND_API_KEY
  ```

- [ ] **4.5.11** Implement `EmailNotificationService`:
  - `sendEmail(to, subject, template, data)` — send templated email
  - Rate limit: max 1 email per type per hour per user

- [ ] **4.5.12** Create email templates:
  - Welcome / registration confirmation
  - New order placed
  - Order delivered
  - Payment released / received
  - New message (if offline for > 10 min)
  - Password reset

### 4.6 Wire Up All Notification Triggers

> Connect notification creation to events from Phase 2 and Phase 3.

- [ ] **4.6.1** Order events:
  - `new_order` → notify seller: "New order received from {buyer}"
  - `order_update` → notify relevant party on status change
  - `order_delivered` → notify buyer: "Seller delivered order #{order_number}"
  - `order_completed` → notify seller: "Order #{order_number} completed"
  - `revision_requested` → notify seller: "Buyer requested revision on #{order_number}"

- [ ] **4.6.2** Proposal events:
  - `new_proposal` → notify job poster: "New proposal on '{job_title}' from {applicant}"
  - `proposal_accepted` → notify applicant: "Your proposal for '{job_title}' was accepted!"
  - `proposal_rejected` → notify applicant: "Your proposal for '{job_title}' was not selected"

- [ ] **4.6.3** Payment events:
  - `payment_received` → notify both: "Payment of ৳{amount} processed for #{order_number}"
  - `payment_released` → notify seller: "৳{amount} has been released to your account"
  - `withdrawal_update` → notify user on withdrawal status change

- [ ] **4.6.4** Chat events:
  - `new_message` → notify recipient (if not in active chat): "New message from {sender}"

- [ ] **4.6.4a** Tuition events:
  - `tuition_request_accepted` → notify requester and open linked chat
  - `tuition_request_rejected` → notify requester

- [ ] **4.6.5** Review events:
  - `new_review` → notify reviewee: "{reviewer} left a review on #{order_number}"

- [ ] **4.6.6** Send system messages in order chat:
  - "Order has been started"
  - "Delivery submitted"
  - "Revision requested"
  - "Order completed"
  - "Payment released"

### 4.7 Online Status Tracking

- [ ] **4.7.1** Track user online status:
  - Update `gh_profiles.availability_status` on connect/disconnect (optional)
  - Or use in-memory only (don't persist every status change)
  - Expose via WebSocket `online_status` event

- [ ] **4.7.2** Implement presence check helper:
  ```typescript
  isUserOnline(profile_id: string): boolean
  getOnlineUsers(profile_ids: string[]): string[]
  ```

### 4.8 Testing

- [ ] **4.8.1** Unit tests for ChatService:
  - Create conversation
  - Send message
  - List conversations with unread count
  - Prevent self-conversation
  - Dedup existing conversations
- [ ] **4.8.2** Unit tests for NotificationsService:
  - Create notification
  - Mark as read
  - Unread count
- [ ] **4.8.3** Integration tests for WebSocket:
  - Connect with valid JWT
  - Reject invalid JWT
  - Send and receive messages
  - Typing indicators
  - Read receipts
- [ ] **4.8.4** E2E tests:
  - Full chat flow: create conversation → send messages → mark read
  - Notification flow: action → notification created → notification listed
- [ ] **4.8.5** Test push notification delivery (mock FCM)
- [ ] **4.8.6** Test email delivery (mock SMTP)

---

## Endpoints Delivered in This Phase

| Method  | Endpoint                      | Status |
| ------- | ----------------------------- | ------ |
| `GET`   | `/conversations`              | 🔲     |
| `POST`  | `/conversations`              | 🔲     |
| `GET`   | `/conversations/:id`          | 🔲     |
| `GET`   | `/conversations/:id/messages` | 🔲     |
| `POST`  | `/conversations/:id/messages` | 🔲     |
| `PATCH` | `/conversations/:id`          | 🔲     |
| `GET`   | `/notifications`              | 🔲     |
| `GET`   | `/notifications/unread-count` | 🔲     |
| `PATCH` | `/notifications`              | 🔲     |

### WebSocket Events

| Direction       | Event                | Status |
| --------------- | -------------------- | ------ |
| Client → Server | `join_conversation`  | 🔲     |
| Client → Server | `leave_conversation` | 🔲     |
| Client → Server | `send_message`       | 🔲     |
| Client → Server | `typing_start`       | 🔲     |
| Client → Server | `typing_stop`        | 🔲     |
| Client → Server | `mark_read`          | 🔲     |
| Server → Client | `new_message`        | 🔲     |
| Server → Client | `message_read`       | 🔲     |
| Server → Client | `user_typing`        | 🔲     |
| Server → Client | `notification`       | 🔲     |
| Server → Client | `order_update`       | 🔲     |
| Server → Client | `online_status`      | 🔲     |

---

## Directus Collections Created

| Collection         | Status |
| ------------------ | ------ |
| `gh_conversations` | 🔲     |
| `gh_messages`      | 🔲     |
| `gh_notifications` | 🔲     |

---

## Definition of Done

- [ ] Real-time 1:1 chat fully working via Socket.IO
- [ ] REST fallback for sending messages
- [ ] Conversation auto-creation for orders
- [ ] Conversation auto-creation for accepted tuition requests
- [ ] File/image/voice sharing in chat
- [ ] System messages for order events
- [ ] Read receipts and typing indicators
- [ ] In-app notifications for all platform events
- [ ] Push notifications via FCM (Flutter ready)
- [ ] Email notifications for critical events
- [ ] Notification preferences respected
- [ ] Online status tracking
- [ ] All unit, integration, and e2e tests passing
