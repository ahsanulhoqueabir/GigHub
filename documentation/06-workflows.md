# 6. Workflows & Sequence Diagrams

## 6.1 Authentication & Role-Based Navigation (Mobile)

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant App as App (_layout.tsx)
    participant AuthStore as Zustand Auth Store
    participant API as Next.js API
    participant Supabase as Supabase Auth

    User->>App: Launch Application
    App->>AuthStore: initAuth() & hydrate session from AsyncStorage
    AuthStore->>API: Validate session (/api/auth/me)
    API->>Supabase: Verify token
    alt Token valid
        Supabase-->>API: User + profile
        API-->>AuthStore: Authenticated (role: USER / ADMIN)
        alt role == ADMIN
            App->>User: Route to /admin
        else role == USER
            App->>User: Route to /(tabs)
        end
    else Session invalid/expired
        AuthStore-->>App: Unauthenticated
        App->>User: Route to /(auth)/login
    end
```

## 6.2 Gig Order & Escrow Fulfillment Lifecycle

```mermaid
sequenceDiagram
    autonumber
    actor Buyer
    participant API as Next.js API
    participant DB as Postgres (RPC)
    actor Seller

    Buyer->>API: POST /order (gig, package)
    API->>DB: 997_create_gig_order()
    DB-->>API: order(PENDING) + escrow(PENDING/UNPAID)
    Buyer->>API: POST /payment/initiate
    API->>API: SSLCommerz session
    Buyer->>API: (SSLCommerz redirect) confirm payment
    API->>DB: 997_process_payment_success()
    DB-->>API: escrow.payment_status = PAID, wallet_record(DEBIT buyer... via gateway)
    API->>Seller: Notify new order
    Buyer->>API: POST /order/[id]/accept (or auto)
    API->>DB: 997_accept_order() → order.status = IN_PROGRESS

    Seller->>API: POST /order/[id]/deliver (files + notes)
    API->>DB: 997_deliver_order() → order.status = DELIVERED

    alt Buyer approves
        Buyer->>API: POST /order/[id]/complete
        API->>DB: 997_complete_order()
        DB-->>API: escrow.status = RELEASED, wallet_record(CREDIT seller, minus platform_fee)
        API-->>Buyer: order.status = COMPLETED
    else Buyer requests revision
        Buyer->>API: revision note
        API->>DB: order.status back to IN_PROGRESS
    else Dispute
        Buyer->>API: POST /escrow/dispute
        API->>DB: 997_request_dispute() → escrow.status = DISPUTED
        Note over API,DB: Admin resolves via /admin/escrow/resolve → 997_resolve_dispute()
    end
```

## 6.3 Job Posting & Proposal Selection

```mermaid
flowchart TD
    A[Job Owner posts Job] --> B[Job listed on board]
    B --> C[Applicants browse & view job details]
    C --> D[Applicant submits Job Proposal]
    D --> E[Owner reviews incoming proposals]
    E --> F{Owner decision}
    F -->|Reject| G[Proposal status: DECLINED]
    F -->|Accept| H["997_approve_job_proposal (RPC)"]
    H --> I["order created (source=JOB) + escrow(PENDING)"]
    I --> J[Sibling proposals auto-rejected]
    J --> K[Order continues through §6.2 fulfillment flow]
```

## 6.4 Escrow Financial State Machine

```mermaid
stateDiagram-v2
    [*] --> PENDING_UNPAID : Order created (997_create_gig_order / 997_create_job_order / 997_approve_job_proposal)
    PENDING_UNPAID --> PENDING_PAID : Buyer completes payment (997_process_payment_success)
    PENDING_PAID --> RELEASED : Buyer approves delivery (997_complete_order)
    PENDING_PAID --> REFUNDED : Order cancelled / refund approved (997_cancel_order)
    PENDING_PAID --> DISPUTED : Either party raises dispute (997_request_dispute)
    DISPUTED --> RELEASED : Admin resolves in favor of seller (997_resolve_dispute)
    DISPUTED --> REFUNDED : Admin resolves in favor of buyer (997_resolve_dispute)
    RELEASED --> [*]
    REFUNDED --> [*]
```

## 6.5 Order Lifecycle (`record_status` on `"order"`)

```mermaid
stateDiagram-v2
    [*] --> PENDING : Buyer places order / proposal accepted
    PENDING --> IN_PROGRESS : Payment held in escrow, order accepted
    IN_PROGRESS --> DELIVERED : Seller submits deliverables
    DELIVERED --> COMPLETED : Buyer approves
    DELIVERED --> REVISION : Buyer requests changes
    REVISION --> DELIVERED : Seller re-submits
    IN_PROGRESS --> CANCELLED : Cancellation request accepted
    IN_PROGRESS --> DISPUTED : Escalation
    DELIVERED --> DISPUTED : Escalation
    DISPUTED --> COMPLETED : Admin resolves for seller
    DISPUTED --> CANCELLED : Admin resolves for buyer
    COMPLETED --> [*]
    CANCELLED --> [*]
```

## 6.6 Real-Time Chat Flow

```mermaid
sequenceDiagram
    participant U1 as User A (Web/Mobile)
    participant API as Next.js API
    participant SB as Supabase Realtime Broadcast
    participant U2 as User B (Web/Mobile)

    U1->>API: POST /chat/token (order-scoped)
    API-->>U1: Realtime auth token
    U1->>SB: Subscribe to channel (order_<id>)
    U2->>SB: Subscribe to channel (order_<id>)
    U1->>API: POST /chat/rooms/[id]/messages
    API->>API: 997_send_chat_message (persists to chat_message)
    API-->>SB: Broadcast new message
    SB-->>U2: Deliver message in real time
```

## 6.7 Push Notification Flow (Announcements)

```mermaid
sequenceDiagram
    autonumber
    actor Admin
    participant AdminUI as Admin Panel (web)
    participant API as Next.js API
    participant FCM as Firebase Cloud Messaging
    actor MobileUser
    participant App as Mobile App

    App->>API: POST /push/subscribe (device FCM token)
    API->>FCM: subscribeToTopic(token, "announcements")

    Admin->>AdminUI: Create announcement (send_push = true)
    AdminUI->>API: POST /admin/announcements
    API->>API: Insert row (DB is source of truth)
    API-->>AdminUI: 201 Created (returns immediately)
    API--)FCM: sendAnnouncementPush() — fire-and-forget, never blocks/fails the request

    FCM--)App: Push notification delivered
    App->>App: Foreground: in-app toast + OS banner<br/>Background/terminated: tap → deep link
    App->>API: GET /announcements/[id] (always re-fetched, never trusts push payload)
    API-->>App: title, content, type (or 404 if expired/inactive/deleted)
```

## 6.8 Payment & Escrow Flow (Gateway-level)

```mermaid
sequenceDiagram
    participant B as Buyer
    participant P as Platform (Next.js API)
    participant SSL as SSLCommerz
    participant S as Seller

    B->>P: Place order & initiate payment
    P->>SSL: Create payment session
    SSL-->>B: Payment page
    B->>SSL: Confirm payment
    SSL-->>P: Webhook: /api/payment/success
    P->>P: 997_process_payment_success → hold funds in escrow
    P->>B: Order active (IN_PROGRESS)
    S->>P: Submit delivery
    B->>P: Approve delivery
    P->>P: 997_complete_order → release escrow, credit seller wallet
    P->>S: Notify: payment received
```
