# Next.js Phase 4 — Chat, Reviews, Notifications & Polish

> **Duration Estimate:** 2.5 weeks
> **Dependencies:** Next.js Phase 3 complete, Backend Phase 4 & 5 complete
> **Outcomes:** Real-time chat, notifications center, review system, bookmarks, reports, SEO, responsive polish

---

## Phase Overview

Implement the communication layer (real-time chat via Socket.IO, notifications center), reviews & ratings system, bookmarks, reports, and final production polish including SEO optimization, accessibility, and responsive fine-tuning.

---

## Task Checklist

### 4.1 Socket.IO Integration

- [ ] **4.1.1** Create Socket.IO client provider (`lib/hooks/useSocket.ts`):

  ```typescript
  // Socket.IO manager that connects with JWT
  const useSocket = () => {
    const socket = useMemo(
      () =>
        io(WS_URL, {
          auth: { token: accessToken },
          transports: ["websocket"],
          autoConnect: false,
        }),
      [accessToken],
    );
    // Connect on mount, disconnect on unmount
    // Reconnect on token refresh
    // Handle connection error, reconnect attempts
  };
  ```

- [ ] **4.1.2** Create chat Zustand store (`lib/store/chat-store.ts`):

  ```typescript
  interface ChatStore {
    conversations: Conversation[];
    activeConversation: string | null;
    messages: Record<string, Message[]>;
    unreadCount: number;
    typingUsers: Record<string, string[]>;
    setActiveConversation: (id: string) => void;
    addMessage: (convId: string, message: Message) => void;
    markAsRead: (convId: string) => void;
    setTyping: (convId: string, userId: string, isTyping: boolean) => void;
    loadConversations: () => Promise<void>;
    loadMessages: (convId: string, page: number) => Promise<void>;
  }
  ```

- [ ] **4.1.3** Create notification Zustand store (`lib/store/notification-store.ts`):

  ```typescript
  interface NotificationStore {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Notification) => void;
    markAsRead: (id: string) => void;
    markAllAsRead: () => void;
    loadNotifications: (page: number) => Promise<void>;
  }
  ```

- [ ] **4.1.4** Wire Socket.IO events in the main layout:
  - Listen for: `new_message`, `typing`, `notification`, `message_read`
  - Update stores accordingly
  - Show toast for new messages when not in chat view

### 4.2 Chat API Functions

- [ ] **4.2.1** Create chat API functions (`lib/api/chat.ts`):

  ```typescript
  getConversations(params?: PaginationParams): Promise<PaginatedResponse<Conversation>>
  getOrCreateConversation(participantId: string): Promise<Conversation>
  getMessages(conversationId: string, params?: PaginationParams): Promise<PaginatedResponse<Message>>
  sendMessage(conversationId: string, data: SendMessageInput): Promise<Message>
  markConversationRead(conversationId: string): Promise<void>
  ```

- [ ] **4.2.2** Define chat types (`lib/types/chat.ts`):

  ```typescript
  interface Conversation {
    id: string;
    participant: ProfileSummary;
    last_message: Message | null;
    unread_count: number;
    updated_at: string;
  }

  interface Message {
    id: string;
    conversation_id: string;
    sender: ProfileSummary;
    content: string;
    type: "text" | "image" | "file" | "voice" | "system";
    file_url: string | null;
    is_read: boolean;
    created_at: string;
  }
  ```

### 4.3 Chat UI

- [ ] **4.3.1** Create Chat layout (`app/(main)/chat/page.tsx`):
  - **Desktop:** Split view — conversation list (left, 320px) + message area (right)
  - **Mobile:** Conversation list full-width → tap opens message view
  - Empty state when no conversations

- [ ] **4.3.2** Create `ConversationList` component:
  - List of conversations sorted by last message time
  - Each item: participant avatar, name, last message preview, timestamp
  - Unread badge (count)
  - Active conversation highlighted
  - Search/filter conversations
  - Online status indicator (green dot)

- [ ] **4.3.3** Create `MessageArea` component (`app/(main)/chat/[id]/page.tsx`):
  - Header: participant avatar + name + online status + "View Profile"
  - Message thread (scrollable):
    - Own messages (right-aligned, brand color)
    - Other's messages (left-aligned, gray)
    - System messages (centered, muted)
    - Timestamps (grouped by date, relative for recent)
  - Infinite scroll up for older messages
  - Auto-scroll to bottom on new message

- [ ] **4.3.4** Create `MessageBubble` component:
  - Text messages: rendered with line breaks
  - Image messages: thumbnail (click to expand)
  - File messages: file icon + name + download link
  - Voice messages: audio player (play/pause, duration)
  - Timestamp on hover or below
  - Read receipt (double checkmark)

- [ ] **4.3.5** Create `ChatInput` component:
  - Textarea (auto-expand, max 4 lines)
  - Send button (or Enter to send, Shift+Enter for newline)
  - Attachment button: file picker (image, document)
  - Emoji button (optional: emoji picker)
  - Voice message button (optional: hold to record)
  - Upload progress for attachments
  - Typing indicator emission (debounced)

- [ ] **4.3.6** Create `TypingIndicator` component:
  - "Username is typing..." with animated dots
  - Show below message area
  - Auto-hide after 3s timeout

- [ ] **4.3.7** Create `ChatEmptyState` component:
  - Illustration
  - "Select a conversation or start a new one"
  - "Start a conversation" when contact button is used from profile

### 4.4 Notifications

- [ ] **4.4.1** Create notification API functions (`lib/api/notifications.ts`):

  ```typescript
  getNotifications(params?: PaginationParams): Promise<PaginatedResponse<Notification>>
  markAsRead(id: string): Promise<void>
  markAllAsRead(): Promise<void>
  getUnreadCount(): Promise<{ count: number }>
  ```

- [ ] **4.4.2** Define notification types:

  ```typescript
  type NotificationType =
    | "order_created"
    | "order_delivered"
    | "delivery_accepted"
    | "revision_requested"
    | "order_completed"
    | "order_cancelled"
    | "new_proposal"
    | "proposal_accepted"
    | "proposal_rejected"
    | "new_review"
    | "payment_received"
    | "withdrawal_completed"
    | "new_message";

  interface Notification {
    id: string;
    type: NotificationType;
    title: string;
    body: string;
    data: Record<string, any>; // { order_id, gig_id, etc. }
    is_read: boolean;
    created_at: string;
  }
  ```

- [ ] **4.4.3** Create Notifications page (`app/(main)/notifications/page.tsx`):
  - List of all notifications, newest first
  - Unread items highlighted
  - "Mark all as read" button
  - Click notification → navigate to relevant page (order, chat, etc.)
  - Pagination or infinite scroll
  - Filter: All, Unread

- [ ] **4.4.4** Create `NotificationDropdown` component (in Navbar):
  - Bell icon with unread badge count
  - Dropdown: show top 10 notifications
  - Each item: icon by type, title, time ago
  - "See All" link → notifications page
  - "Mark all as read" action

- [ ] **4.4.5** Create `NotificationItem` component:
  - Icon per type (order icon, message icon, payment icon, review icon)
  - Title + body text
  - Relative timestamp
  - Unread indicator (dot or background highlight)
  - Click handler → navigate to relevant page

- [ ] **4.4.6** Implement toast notifications for real-time events:
  - New message (when not in chat)
  - Order status changes
  - New proposal received
  - Payment completed
  - Use sonner or shadcn toast

### 4.5 Reviews & Ratings

- [ ] **4.5.1** Create review API functions (`lib/api/reviews.ts`):

  ```typescript
  submitReview(orderId: string, data: CreateReviewInput): Promise<Review>
  getReviewsForProfile(profileId: string, params?: PaginationParams): Promise<PaginatedResponse<Review>>
  getReviewsForGig(gigId: string, params?: PaginationParams): Promise<PaginatedResponse<Review>>
  getMyPendingReviews(): Promise<Order[]>
  ```

- [ ] **4.5.2** Create `ReviewForm` component:
  - Star rating selector (1-5, clickable stars)
  - Review text (textarea, min 20 chars)
  - "Submit Review" button
  - Preview before submit
  - Show after order completed, prompt in order detail

- [ ] **4.5.3** Create `ReviewCard` component:
  - Reviewer avatar + name
  - Star rating display
  - Review text
  - Date
  - "As Buyer" / "As Seller" badge
  - Order reference (gig title)

- [ ] **4.5.4** Create `ReviewsList` component:
  - Used in: profile page, gig detail page
  - Sort: newest, highest, lowest
  - Rating breakdown bar chart:
    ```
    5 ★ ████████████ 45
    4 ★ ████████     30
    3 ★ ████         15
    2 ★ ██            8
    1 ★ █             2
    ```
  - Average rating display
  - Pagination

- [ ] **4.5.5** Add review prompt to completed orders:
  - On order detail page: "Leave a review" CTA after completion
  - Dashboard widget: "You have X orders awaiting review"

- [ ] **4.5.6** Integrate reviews into profile and gig pages:
  - Public profile: "Reviews" tab with ReviewsList
  - Gig detail: "Reviews" section below packages

### 4.6 Bookmarks & Reports

- [ ] **4.6.1** Create bookmark API functions (`lib/api/bookmarks.ts`):

  ```typescript
  toggleBookmark(type: 'gig' | 'job', targetId: string): Promise<{ bookmarked: boolean }>
  getMyBookmarks(type?: 'gig' | 'job', params?: PaginationParams): Promise<PaginatedResponse<Bookmark>>
  ```

- [ ] **4.6.2** Create `BookmarkButton` component:
  - Heart/bookmark icon (toggle filled/outline)
  - Optimistic update
  - Add to: GigCard, GigDetail, JobCard, JobDetail

- [ ] **4.6.3** Create Bookmarks page (`app/(main)/bookmarks/page.tsx`):
  - Tabs: "Gigs" and "Jobs"
  - Grid/list of bookmarked items (reuse GigCard/JobCard)
  - Remove bookmark action
  - Empty state

- [ ] **4.6.4** Create report API functions:

  ```typescript
  submitReport(data: CreateReportInput): Promise<Report>
  ```

- [ ] **4.6.5** Create `ReportDialog` component:
  - Trigger: "Report" menu item on gig/job/profile
  - Report type dropdown: spam, inappropriate, fraud, other
  - Description textarea
  - Submit with confirmation
  - "Report submitted" success message

### 4.7 Landing Page & SEO

- [ ] **4.7.1** Create Landing page (`app/page.tsx`):
  - Hero section: tagline, search bar, CTA buttons
  - "How it works" section (3-step infographic)
  - Featured/popular categories grid
  - Featured gigs carousel
  - Stats: "X+ gigs, Y+ students, Z+ completed orders"
  - CTA: "Join GigHub" / "Post a Gig"
  - Footer

- [ ] **4.7.2** SEO Optimization:
  - Dynamic `metadata` for all SSR pages:
    - Gig detail: title, description, og:image from thumbnail
    - Job detail: title, description
    - Profile: name, bio
  - `generateStaticParams` where applicable
  - `sitemap.xml` generation
  - `robots.txt`
  - Open Graph + Twitter Card meta tags
  - Structured data (JSON-LD) for gigs

- [ ] **4.7.3** Create `not-found.tsx`:
  - Custom 404 page with illustration
  - "Back to Home" button
  - Search suggestions

- [ ] **4.7.4** Create `error.tsx` (app-level error boundary):
  - Friendly error message
  - "Try Again" button
  - Report issue link

### 4.8 Responsive Polish & Accessibility

- [ ] **4.8.1** Mobile responsive audit — all pages:
  - [ ] Auth pages
  - [ ] Dashboard
  - [ ] Gig browse + detail + create
  - [ ] Job browse + detail + create
  - [ ] Orders list + detail
  - [ ] Chat (conversation list + message view)
  - [ ] Notifications
  - [ ] Wallet
  - [ ] Profile (edit + public)
  - [ ] Bookmarks

- [ ] **4.8.2** Accessibility audit:
  - Keyboard navigation for all interactive elements
  - ARIA labels for icons and actions
  - Focus management in modals/dialogs
  - Color contrast compliance
  - Screen reader friendly labels

- [ ] **4.8.3** Performance optimization:
  - Image optimization: next/image for all images
  - Lazy loading for below-fold content
  - Code splitting verification (dynamic imports where needed)
  - Bundle analysis: identify large dependencies

- [ ] **4.8.4** Dark mode support:
  - Theme toggle in navbar
  - Consistent styling via CSS variables / Tailwind dark classes
  - Test all pages in dark mode

- [ ] **4.8.5** Loading states & skeletons:
  - Verify all pages have loading skeletons
  - Suspense boundaries for streaming SSR
  - Optimistic updates for common actions (bookmark, mark read)

- [ ] **4.8.6** Error states:
  - API error handling with user-friendly messages
  - Network error detection (offline banner)
  - Retry buttons on failed fetches

### 4.9 Admin Pages (Stretch)

- [ ] **4.9.1** Create Admin layout (`app/(admin)/layout.tsx`):
  - Admin sidebar: Users, Orders, Disputes, Withdrawals, Reports, Config
  - Role check: redirect non-admin users

- [ ] **4.9.2** Create User Management page:
  - List all users with search/filter
  - Verify/ban/unban actions
  - View user profile

- [ ] **4.9.3** Create Disputes Management page:
  - List open disputes
  - View dispute details (order info, both parties)
  - Resolution actions: refund buyer, release to seller

- [ ] **4.9.4** Create Withdrawal Management page:
  - Pending withdrawals list
  - Approve/reject with note
  - Bulk actions

- [ ] **4.9.5** Create Reports Management page:
  - List reports with filters
  - Review, dismiss, or take action

- [ ] **4.9.6** Create Analytics/Config page:
  - Platform stats overview
  - Platform fee configuration
  - Category management

### 4.10 Testing

- [ ] **4.10.1** Test chat: message send/receive, typing indicator, conversation list
- [ ] **4.10.2** Test notifications: dropdown, page, mark read
- [ ] **4.10.3** Test review form: star rating, submission, validation
- [ ] **4.10.4** Test bookmarks: toggle, list, remove
- [ ] **4.10.5** Test report dialog: submission flow
- [ ] **4.10.6** Test landing page: rendering, CTA navigation
- [ ] **4.10.7** Test responsive: key pages on mobile viewport
- [ ] **4.10.8** E2E test: full user journey (register → create gig → receive order → chat → complete → review)

---

## Pages Delivered in This Phase

| Route            | Page                  | Type                |
| ---------------- | --------------------- | ------------------- |
| `/`              | Landing Page          | SSR                 |
| `/chat`          | Conversation List     | Client (protected)  |
| `/chat/[id]`     | Message Thread        | Client (protected)  |
| `/notifications` | Notifications List    | Client (protected)  |
| `/bookmarks`     | Bookmarks             | Client (protected)  |
| `/admin/*`       | Admin Pages (stretch) | Client (admin only) |

---

## Key Components Delivered

| Component              | Purpose                            |
| ---------------------- | ---------------------------------- |
| `ConversationList`     | Chat sidebar list of conversations |
| `MessageArea`          | Chat message thread                |
| `MessageBubble`        | Individual message display         |
| `ChatInput`            | Compose message with attachments   |
| `TypingIndicator`      | Real-time typing status            |
| `NotificationDropdown` | Navbar notification bell           |
| `NotificationItem`     | Single notification display        |
| `ReviewForm`           | Star rating + text review          |
| `ReviewCard`           | Review display card                |
| `ReviewsList`          | Paginated reviews with breakdown   |
| `BookmarkButton`       | Toggle bookmark on gig/job         |
| `ReportDialog`         | Report content modal               |

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
| WebSocket: `send_message`          | Real-time chat               |
| WebSocket: `typing`                | Typing indicator             |
| WebSocket: `notification`          | Real-time notifications      |

---

## Definition of Done

- [ ] Real-time chat working: send, receive, typing, file share
- [ ] Conversation list with unread counts
- [ ] Notification dropdown and full page working
- [ ] Real-time notification delivery (WebSocket + toast)
- [ ] Review submission and display on profiles/gigs
- [ ] Bookmark toggle and bookmarks page
- [ ] Report dialog functional
- [ ] Landing page polished and informative
- [ ] SEO meta tags on all SSR pages
- [ ] All pages fully responsive (mobile + desktop)
- [ ] Dark mode support
- [ ] Accessibility basics covered
- [ ] Performance optimized (images, code splitting)
- [ ] Admin pages functional (stretch goal)
- [ ] All tests passing
- [ ] E2E user journey verified
