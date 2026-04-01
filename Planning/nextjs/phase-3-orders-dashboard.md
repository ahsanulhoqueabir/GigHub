# Next.js Phase 3 — Orders, Payments & Dashboard

> **Duration Estimate:** 2 weeks
> **Dependencies:** Next.js Phase 2 complete, Backend Phase 3 complete
> **Outcomes:** Order management UI, payment flow, student dashboard, wallet/earnings page

---

## Phase Overview

Build the order lifecycle UI (creation → delivery → completion), integrate SSLCommerz payment flow, create the unified student dashboard, and implement wallet/earnings management. Every student is both buyer and seller, so the dashboard reflects both roles.

---

## Task Checklist

### 3.1 API Functions (Orders, Payments, Wallet)

- [ ] **3.1.1** Create order API functions (`lib/api/orders.ts`):

  ```typescript
  createOrder(data: CreateOrderInput): Promise<Order>
  getMyOrders(params: OrderQueryParams): Promise<PaginatedResponse<Order>>
  getOrderById(id: string): Promise<OrderDetail>
  submitDelivery(orderId: string, data: DeliveryInput): Promise<Delivery>
  acceptDelivery(orderId: string, deliveryId: string): Promise<void>
  requestRevision(orderId: string, data: RevisionInput): Promise<void>
  cancelOrder(orderId: string, reason: string): Promise<void>
  extendDeadline(orderId: string, newDeadline: string): Promise<void>
  ```

- [ ] **3.1.2** Create milestone API functions:

  ```typescript
  getMilestones(orderId: string): Promise<Milestone[]>
  updateMilestone(orderId: string, milestoneId: string, data: MilestoneUpdate): Promise<Milestone>
  completeMilestone(orderId: string, milestoneId: string): Promise<Milestone>
  ```

- [ ] **3.1.3** Create payment API functions (`lib/api/payments.ts`):

  ```typescript
  initiatePayment(orderId: string): Promise<PaymentInitResponse>
  getPaymentStatus(transactionId: string): Promise<PaymentStatus>
  getMyTransactions(params?: PaginationParams): Promise<PaginatedResponse<Transaction>>
  ```

- [ ] **3.1.4** Create wallet API functions:
  ```typescript
  getEarningsSummary(): Promise<EarningsSummary>
  requestWithdrawal(data: WithdrawalRequest): Promise<Withdrawal>
  getMyWithdrawals(params?: PaginationParams): Promise<PaginatedResponse<Withdrawal>>
  ```

### 3.2 TypeScript Types (Orders, Payments)

- [ ] **3.2.1** Define order types (`lib/types/order.ts`):

  ```typescript
  type OrderStatus =
    | "pending_payment"
    | "active"
    | "in_revision"
    | "delivered"
    | "completed"
    | "cancelled"
    | "disputed";

  interface Order {
    id: string;
    order_number: string;
    gig: GigSummary;
    package: GigPackage;
    buyer: ProfileSummary;
    seller: ProfileSummary;
    amount: number;
    platform_fee: number;
    seller_amount: number;
    status: OrderStatus;
    deadline: string;
    requirements: string;
    milestones: Milestone[];
    deliveries: Delivery[];
    escrow_status: "held" | "released" | "refunded";
    created_at: string;
    completed_at: string | null;
  }

  interface Delivery {
    id: string;
    message: string;
    attachments: string[];
    status: "pending" | "accepted" | "revision_requested";
    created_at: string;
  }

  interface Milestone {
    id: string;
    title: string;
    description: string;
    amount: number;
    due_date: string;
    status: "pending" | "in_progress" | "completed";
  }

  interface EarningsSummary {
    total_earnings: number;
    available_balance: number;
    pending_balance: number;
    withdrawn: number;
    this_month: number;
  }
  ```

### 3.3 Order Pages

- [ ] **3.3.1** Create Order Checkout flow:
  - Triggered from gig detail "Continue" button (package selection)
  - Checkout page or modal:
    - Order summary: gig title, selected package, price breakdown
    - Requirements field (what buyer needs from seller)
    - Platform fee display (e.g., "৳50 platform fee")
    - Total amount
    - Payment method selection: SSLCommerz / bKash
    - "Proceed to Payment" button
  - Validation: requirements not empty

- [ ] **3.3.2** Create Orders list page (`app/(main)/orders/page.tsx`):
  - Tab-based layout:
    - "As Buyer" — orders I placed
    - "As Seller" — orders assigned to me
  - Per tab: filter by status (All, Active, Completed, Cancelled)
  - Order row: order number, gig thumbnail + title, other party name, amount, status badge, deadline, date
  - Click → order detail page
  - Sort: newest, deadline approaching

- [ ] **3.3.3** Create Order Detail page (`app/(main)/orders/[id]/page.tsx`):
  - **Header:** Order #number, status badge, gig info
  - **Progress tracker:** Visual order status timeline
    ```
    [Pending Payment] → [Active] → [Delivered] → [Completed]
    ```
  - **Order Info:** Package details, amount, deadline, requirements
  - **Milestone section** (if applicable):
    - List of milestones with status
    - Mark milestone complete (seller)
  - **Activity/Delivery section:**
    - Delivery submissions (seller)
    - Accept/Request Revision (buyer)
    - Revision history
  - **Action buttons** (context-dependent):
    - Seller: "Submit Delivery", "Mark Complete"
    - Buyer: "Accept Delivery", "Request Revision", "Cancel Order"
  - **Sidebar:** Other party info card, contact button (→ chat)

- [ ] **3.3.4** Create `OrderStatusBadge` component:
  - Color-coded badges per status
  - pending_payment: yellow
  - active: blue
  - delivered: purple
  - in_revision: orange
  - completed: green
  - cancelled: red
  - disputed: red

- [ ] **3.3.5** Create `OrderTimeline` component:
  - Visual stepped progress bar
  - Highlight current step
  - Show timestamps per step
  - Responsive: horizontal on desktop, vertical on mobile

### 3.4 Delivery Flow UI

- [ ] **3.4.1** Create `DeliveryForm` component (seller action):
  - Delivery message (textarea)
  - File attachments (upload to R2)
  - Upload progress indicator
  - "Submit Delivery" button
  - Validation: message required, at least 1 attachment

- [ ] **3.4.2** Create `DeliveryCard` component:
  - Message text
  - Attached files (download links)
  - Timestamp
  - Status: Pending review, Accepted, Revision requested
  - Buyer actions: Accept, Request Revision

- [ ] **3.4.3** Create `RevisionRequestForm` component (buyer action):
  - Reason for revision (textarea)
  - "Request Revision" button
  - Show revision count / remaining revisions

- [ ] **3.4.4** Create auto-completion notice:
  - Timer displaying "Auto-completes in X days" for pending deliveries
  - Warning when deadline is approaching

### 3.5 Payment Integration

- [ ] **3.5.1** Implement SSLCommerz payment redirect flow:
  - Call backend `POST /payments/initiate` with order ID
  - Backend returns SSLCommerz gateway URL
  - Redirect user to SSLCommerz payment page
  - Handle return URLs:
    - `/payments/success?order_id=...` → success page
    - `/payments/failed?order_id=...` → failure page with retry
    - `/payments/cancelled` → back to order

- [ ] **3.5.2** Create Payment Success page:
  - Confirmation message with checkmark animation
  - Order summary
  - "View Order" button
  - "Back to Dashboard" button

- [ ] **3.5.3** Create Payment Failed page:
  - Error message
  - "Try Again" button (re-initiate payment)
  - "Cancel Order" option
  - Support contact info

- [ ] **3.5.4** Create `PaymentSummary` component:
  - Line-item breakdown:
    - Package price: ৳1,000
    - Platform fee: ৳50
    - **Total: ৳1,050**
  - Payment method icon

### 3.6 Dashboard

- [ ] **3.6.1** Create Unified Dashboard page (`app/(main)/dashboard/page.tsx`):
  - **Stats cards row:**
    - Total Earnings
    - Available Balance
    - Active Orders (as seller)
    - Active Orders (as buyer)
    - Average Rating
    - Pending Proposals
  - **Quick Actions:**
    - "Create a Gig" button
    - "Post a Job" button
    - "Find Gigs" button
  - **Recent activity sections:**
    - Recent Orders (both buyer/seller, combined or tabbed)
    - Recent Proposals (submitted/received)
    - Pending Deliveries (action needed)
  - **Notifications feed** — top 5 unread (Phase 4 data)

- [ ] **3.6.2** Create `StatCard` component:
  - Icon, label, value, change indicator
  - Variants: earnings (green), orders (blue), rating (yellow)

- [ ] **3.6.3** Create `RecentOrdersWidget` component:
  - Compact order list (5 items)
  - Click → full order detail
  - "View All" link → orders page

- [ ] **3.6.4** Create `ActionNeededWidget` component:
  - Deliveries awaiting review (buyer)
  - Orders requiring delivery (seller)
  - Proposals awaiting response
  - Red urgency badges for overdue items

### 3.7 Wallet & Earnings

- [ ] **3.7.1** Create Wallet page (`app/(main)/wallet/page.tsx`):
  - **Balance overview:**
    - Available Balance: ৳5,000
    - Pending (in escrow): ৳2,000
    - Total Earned: ৳15,000
    - Total Withdrawn: ৳8,000
  - **Withdrawal section:**
    - "Withdraw" button → withdrawal form
    - Withdrawal method: bKash, bank transfer
    - Minimum withdrawal amount display
    - Processing time notice
  - **Transaction history table:**
    - Filter: All, Earnings, Withdrawals, Fees
    - Columns: Date, Type, Description, Amount, Status
    - Pagination
  - **Earnings chart** (optional):
    - Monthly earnings bar/line chart
    - Simple: use recharts or chart.js

- [ ] **3.7.2** Create `WithdrawalForm` component:
  - Amount input (with max = available balance)
  - Method select: bKash, bank transfer
  - bKash: phone number input
  - Bank: account name, account number, bank name, branch
  - Validation: min amount, max = available
  - Confirmation dialog before submit

- [ ] **3.7.3** Create `TransactionTable` component:
  - Sortable columns
  - Status badges: Completed, Pending, Failed
  - Type icon: arrow-up (earnings), arrow-down (withdrawal), minus (fee)
  - Amount formatting with +/- sign

- [ ] **3.7.4** Create `WithdrawalHistory` component:
  - Withdrawal status tracking
  - Pending, Processing, Completed, Failed states
  - Estimated completion time

### 3.8 Validation Schemas

- [ ] **3.8.1** Create order checkout schema:

  ```typescript
  const checkoutSchema = z.object({
    gig_id: z.string().uuid(),
    package_id: z.string().uuid(),
    requirements: z.string().min(20).max(2000),
  });
  ```

- [ ] **3.8.2** Create delivery schema:

  ```typescript
  const deliverySchema = z.object({
    message: z.string().min(10).max(5000),
    attachments: z.array(z.string().url()).min(1),
  });
  ```

- [ ] **3.8.3** Create withdrawal schema:
  ```typescript
  const withdrawalSchema = z.object({
    amount: z.number().positive().min(100),
    method: z.enum(["bkash", "bank"]),
    bkash_number: z.string().optional(),
    bank_details: bankDetailsSchema.optional(),
  });
  ```

### 3.9 Testing

- [ ] **3.9.1** Test order checkout flow: package selection → payment
- [ ] **3.9.2** Test order detail: status timeline, delivery flow
- [ ] **3.9.3** Test delivery form: submission, file upload
- [ ] **3.9.4** Test payment redirect: success/failure handling
- [ ] **3.9.5** Test dashboard: stats display, widget rendering
- [ ] **3.9.6** Test wallet page: balance display, withdrawal form
- [ ] **3.9.7** Test transaction table: filtering, pagination

---

## Pages Delivered in This Phase

| Route               | Page                       | Type               |
| ------------------- | -------------------------- | ------------------ |
| `/dashboard`        | Unified Dashboard          | Client (protected) |
| `/orders`           | My Orders (buyer + seller) | Client (protected) |
| `/orders/[id]`      | Order Detail               | Client (protected) |
| `/wallet`           | Wallet & Earnings          | Client (protected) |
| `/payments/success` | Payment Success            | Client             |
| `/payments/failed`  | Payment Failed             | Client             |

---

## Key Components Delivered

| Component             | Purpose                       |
| --------------------- | ----------------------------- |
| `OrderStatusBadge`    | Color-coded order status      |
| `OrderTimeline`       | Visual progress tracker       |
| `DeliveryForm`        | Seller delivery submission    |
| `DeliveryCard`        | Delivery display with actions |
| `RevisionRequestForm` | Buyer revision request        |
| `PaymentSummary`      | Order price breakdown         |
| `StatCard`            | Dashboard metric card         |
| `RecentOrdersWidget`  | Dashboard orders widget       |
| `ActionNeededWidget`  | Pending actions widget        |
| `WithdrawalForm`      | Earnings withdrawal form      |
| `TransactionTable`    | Transaction history           |

---

## Backend Endpoints Consumed

| Endpoint                            | Usage                        |
| ----------------------------------- | ---------------------------- |
| `POST /orders`                      | Create order from checkout   |
| `GET /orders/me`                    | Orders list (buyer + seller) |
| `GET /orders/:id`                   | Order detail                 |
| `POST /orders/:id/deliver`          | Submit delivery              |
| `POST /orders/:id/accept-delivery`  | Accept delivery              |
| `POST /orders/:id/revision`         | Request revision             |
| `POST /orders/:id/cancel`           | Cancel order                 |
| `GET /orders/:id/milestones`        | Get milestones               |
| `PATCH /orders/:id/milestones/:mid` | Update milestone             |
| `POST /payments/initiate`           | Start payment                |
| `GET /payments/status/:txn`         | Check payment status         |
| `GET /transactions/me`              | Transaction history          |
| `GET /wallet/summary`               | Earnings summary             |
| `POST /withdrawals`                 | Request withdrawal           |
| `GET /withdrawals/me`               | Withdrawal history           |

---

## Definition of Done

- [ ] Order creation from gig detail working end-to-end
- [ ] SSLCommerz payment redirect flow functional
- [ ] Order detail page with full lifecycle management
- [ ] Delivery submit → accept/revise cycle working
- [ ] Dashboard displaying real stats and widgets
- [ ] Wallet page with balance, transaction history
- [ ] Withdrawal request flow working
- [ ] All pages responsive
- [ ] Loading/error states implemented
- [ ] All tests passing
