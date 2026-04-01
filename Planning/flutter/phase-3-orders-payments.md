# Flutter Phase 3 — Orders, Payments & Dashboard

> **Duration Estimate:** 2 weeks
> **Dependencies:** Flutter Phase 2 complete, Backend Phase 3 complete
> **Outcomes:** Order lifecycle management, payment flow (WebView), dashboard, wallet/earnings

---

## Phase Overview

Build the order management system (creation → delivery → completion), integrate SSLCommerz/bKash payments via WebView, create the mobile dashboard, and implement the wallet/earnings experience.

---

## Task Checklist

### 3.1 Data Models

- [ ] **3.1.1** Create order models (`data/models/order_model.dart`):

  ```dart
  @freezed
  class Order with _$Order {
    factory Order({
      required String id,
      required String orderNumber,
      required GigSummary gig,
      required GigPackage package,
      required ProfileSummary buyer,
      required ProfileSummary seller,
      required double amount,
      required double platformFee,
      required double sellerAmount,
      required String status,          // pending_payment, active, delivered, in_revision, completed, cancelled, disputed
      required DateTime deadline,
      String? requirements,
      required List<Milestone> milestones,
      required List<Delivery> deliveries,
      required String escrowStatus,
      required DateTime createdAt,
      DateTime? completedAt,
    }) = _Order;
  }

  @freezed
  class Delivery with _$Delivery {
    factory Delivery({
      required String id,
      required String message,
      required List<String> attachments,
      required String status,  // pending, accepted, revision_requested
      required DateTime createdAt,
    }) = _Delivery;
  }

  @freezed
  class Milestone with _$Milestone {
    factory Milestone({
      required String id,
      required String title,
      required String description,
      required double amount,
      required DateTime dueDate,
      required String status,  // pending, in_progress, completed
    }) = _Milestone;
  }
  ```

- [ ] **3.1.2** Create transaction models (`data/models/transaction_model.dart`):

  ```dart
  @freezed
  class EarningsSummary with _$EarningsSummary {
    factory EarningsSummary({
      required double totalEarnings,
      required double availableBalance,
      required double pendingBalance,
      required double withdrawn,
      required double thisMonth,
    }) = _EarningsSummary;
  }

  @freezed
  class Transaction with _$Transaction {
    factory Transaction({
      required String id,
      required String type,       // earning, withdrawal, fee, refund
      required String description,
      required double amount,
      required String status,
      required DateTime createdAt,
    }) = _Transaction;
  }

  @freezed
  class Withdrawal with _$Withdrawal {
    factory Withdrawal({
      required String id,
      required double amount,
      required String method,     // bkash, bank
      required String status,     // pending, processing, completed, failed
      required DateTime createdAt,
      DateTime? completedAt,
    }) = _Withdrawal;
  }
  ```

### 3.2 Repositories

- [ ] **3.2.1** Create order repository (`data/repositories/order_repository.dart`):

  ```dart
  class OrderRepository {
    Future<Order> createOrder(CreateOrderInput input);
    Future<PaginatedResponse<Order>> getMyOrders(OrderQueryParams params);
    Future<Order> getOrderById(String id);
    Future<Delivery> submitDelivery(String orderId, DeliveryInput input);
    Future<void> acceptDelivery(String orderId, String deliveryId);
    Future<void> requestRevision(String orderId, String reason);
    Future<void> cancelOrder(String orderId, String reason);
    Future<void> extendDeadline(String orderId, DateTime newDeadline);
  }
  ```

- [ ] **3.2.2** Create payment repository:

  ```dart
  class PaymentRepository {
    Future<PaymentInitResponse> initiatePayment(String orderId);
    Future<PaymentStatus> getPaymentStatus(String transactionId);
    Future<PaginatedResponse<Transaction>> getMyTransactions({int page = 1});
  }
  ```

- [ ] **3.2.3** Create wallet repository:
  ```dart
  class WalletRepository {
    Future<EarningsSummary> getEarningsSummary();
    Future<Withdrawal> requestWithdrawal(WithdrawalInput input);
    Future<PaginatedResponse<Withdrawal>> getMyWithdrawals({int page = 1});
  }
  ```

### 3.3 Riverpod Providers

- [ ] **3.3.1** Create order providers:

  ```dart
  @riverpod
  Future<PaginatedResponse<Order>> myOrders(MyOrdersRef ref, OrderQueryParams params);

  @riverpod
  Future<Order> orderDetail(OrderDetailRef ref, String id);

  @riverpod
  class OrderActionsNotifier extends _$OrderActionsNotifier {
    Future<void> submitDelivery(String orderId, DeliveryInput input);
    Future<void> acceptDelivery(String orderId, String deliveryId);
    Future<void> requestRevision(String orderId, String reason);
    Future<void> cancelOrder(String orderId, String reason);
  }
  ```

- [ ] **3.3.2** Create payment/wallet providers:

  ```dart
  @riverpod
  Future<EarningsSummary> earningsSummary(EarningsSummaryRef ref);

  @riverpod
  Future<PaginatedResponse<Transaction>> transactions(TransactionsRef ref, {int page = 1});

  @riverpod
  class WalletNotifier extends _$WalletNotifier {
    Future<void> requestWithdrawal(WithdrawalInput input);
  }
  ```

### 3.4 Order Screens

- [ ] **3.4.1** Create `OrderCheckoutScreen`:
  - Triggered from gig detail "Continue" button
  - Order summary card:
    - Gig thumbnail + title
    - Selected package name + tier
    - Price breakdown (package + platform fee = total)
  - Requirements text field (what buyer needs)
  - Payment method selection: SSLCommerz / bKash radio buttons
  - Total amount display (prominent)
  - "Proceed to Payment" button
  - Terms acceptance checkbox

- [ ] **3.4.2** Create `OrdersListScreen` (`/orders`):
  - Tab bar: "As Buyer" | "As Seller"
  - Filter chips: All, Active, Delivered, Completed, Cancelled
  - List of order cards
  - Pull-to-refresh + infinite scroll
  - Empty state per tab

- [ ] **3.4.3** Create `OrderCard` widget:

  ```
  ┌──────────────────────────────────────┐
  │ [thumb] Gig Title                    │
  │         Order #GH-001234             │
  │         with @username               │
  │         ৳1,000    [Active]           │
  │         Due: Mar 15, 2026            │
  └──────────────────────────────────────┘
  ```

  - Gig thumbnail (small)
  - Order number, counterparty name
  - Amount + status badge (color-coded)
  - Deadline with urgency indicator (red if <24h)
  - Tap → order detail

- [ ] **3.4.4** Create `OrderDetailScreen` (`/orders/:id`):
  - **Status timeline** (vertical stepper):
    ```
    ✅ Order Placed — Mar 10
    ✅ Payment Confirmed — Mar 10
    🔵 In Progress
    ○  Delivered
    ○  Completed
    ```
  - **Order info card:** gig, package, amount, deadline, requirements
  - **Milestones section** (if applicable):
    - Milestone list with status checkboxes
    - Seller: mark milestone complete
  - **Deliveries section:**
    - List of delivery submissions with files
    - Buyer actions: Accept / Request Revision
  - **Action area** (bottom):
    - Seller: "Submit Delivery" button → delivery form
    - Buyer: "Accept" / "Request Revision" per delivery
    - Both: "Cancel Order" (with confirmation)
  - **Contact button:** → opens chat with counterparty

- [ ] **3.4.5** Create `OrderStatusTimeline` widget:
  ```dart
  class OrderStatusTimeline extends StatelessWidget {
    final String currentStatus;
    final List<StatusStep> steps;
    // Vertical timeline with circles, lines, labels, timestamps
  }
  ```

### 3.5 Delivery Flow

- [ ] **3.5.1** Create `DeliveryFormScreen` (seller):
  - Delivery message (TextField)
  - File attachments:
    - "Add Files" button → pick from device
    - Upload progress per file
    - Remove attached files
    - Max 10 files, single file max 25MB
  - "Submit Delivery" button with loading
  - Confirmation dialog before submit

- [ ] **3.5.2** Create `DeliveryCard` widget:

  ```
  ┌──────────────────────────────┐
  │ Delivery #1 — Mar 12, 2026  │
  │ "Here is the completed..."  │
  │ 📎 design_final.psd (2.3MB) │
  │ 📎 preview.png (450KB)      │
  │ Status: Pending Review       │
  │    [Accept] [Request Revision]│
  └──────────────────────────────┘
  ```

  - Message text
  - File attachment list (tap to download/preview)
  - Status badge
  - Action buttons (for buyer)

- [ ] **3.5.3** Create `RevisionRequestSheet` (buyer — bottom sheet):
  - Reason for revision (required TextField)
  - Revision count display ("Revision 2 of 3")
  - "Submit" button

- [ ] **3.5.4** Handle auto-completion notice:
  - Countdown timer: "Auto-completes in 3 days"
  - Warning banner when <24h remaining

### 3.6 Payment Flow (WebView)

- [ ] **3.6.1** Create `PaymentWebViewScreen`:

  ```dart
  class PaymentWebViewScreen extends StatefulWidget {
    final String paymentUrl;   // SSLCommerz gateway URL
    final String orderId;
  }
  ```

  - WebView loads SSLCommerz payment page
  - Intercept redirect URLs to detect success/failure/cancel:
    - Success URL → navigate to success screen
    - Fail URL → navigate to failure screen
    - Cancel URL → go back
  - Loading indicator while page loads
  - Back button with "Cancel payment?" confirmation

- [ ] **3.6.2** Create `PaymentSuccessScreen`:
  - Checkmark animation (Lottie or custom)
  - "Payment Successful!" message
  - Order summary
  - "View Order" button
  - "Back to Home" button

- [ ] **3.6.3** Create `PaymentFailedScreen`:
  - Error illustration
  - "Payment Failed" message
  - "Try Again" button
  - "Cancel Order" option

- [ ] **3.6.4** Create `PriceSummaryCard` widget:
  ```
  ┌──────────────────────────────┐
  │ Order Summary                │
  │──────────────────────────────│
  │ Package (Standard)    ৳1,000│
  │ Platform Fee            ৳50 │
  │──────────────────────────────│
  │ Total                ৳1,050 │
  └──────────────────────────────┘
  ```

### 3.7 Dashboard Screen

- [ ] **3.7.1** Create `DashboardScreen` (`/home`):
  - **Greeting:** "Hello, {name}!"
  - **Stats row** (horizontal scroll of cards):
    - Total Earnings
    - Available Balance
    - Active Orders
    - Average Rating
  - **Quick Actions grid:**
    - Create Gig, Post Job, Browse Gigs, Find Talent
  - **Action Needed section:**
    - Pending deliveries to review (buyer)
    - Orders needing delivery (seller)
    - Pending proposals (job owner)
    - Each with count + tap to navigate
  - **Recent Orders** (carousel or list of top 5)
  - Pull-to-refresh

- [ ] **3.7.2** Create `DashboardStatCard` widget:

  ```
  ┌─────────────┐
  │ 📊 ৳15,000  │
  │ Total Earned │
  └─────────────┘
  ```

  - Icon, value, label
  - Compact card for horizontal scroll

- [ ] **3.7.3** Create `QuickActionGrid` widget:
  - 2x2 grid of action tiles
  - Icon + label
  - Tap → navigate to relevant screen

- [ ] **3.7.4** Create `ActionNeededList` widget:
  - List of items needing attention
  - Red badge for urgent items
  - Tap → navigate to relevant order/proposal

### 3.8 Wallet Screen

- [ ] **3.8.1** Create `WalletScreen` (`/wallet`):
  - **Balance card** (prominent, top):
    ```
    ┌──────────────────────────────┐
    │     Available Balance         │
    │        ৳5,000                │
    │                              │
    │  Pending: ৳2,000             │
    │  Total Earned: ৳15,000       │
    │                              │
    │     [Withdraw Funds]         │
    └──────────────────────────────┘
    ```
  - **Quick stats row:** This month earnings, withdrawn total
  - **Transaction history:**
    - Filter tabs: All, Earnings, Withdrawals, Fees
    - List of transactions with icon, description, amount, date
    - Infinite scroll
  - **Withdrawal history section** (or separate screen)

- [ ] **3.8.2** Create `WithdrawalScreen` (or bottom sheet):
  - Amount input with "Max" button (fills available balance)
  - Method selection:
    - bKash: phone number input
    - Bank: account name, account number, bank name, branch
  - Minimum withdrawal info
  - "Request Withdrawal" button
  - Confirmation dialog with summary

- [ ] **3.8.3** Create `TransactionTile` widget:

  ```
  ┌──────────────────────────────────┐
  │ ↗️ Order #GH-001234 completed   │
  │    Mar 12, 2026      +৳950     │
  └──────────────────────────────────┘
  ```

  - Type icon (earning ↗️, withdrawal ↘️, fee -)
  - Description + date
  - Amount with +/- and color (green for earning, red for withdrawal)

- [ ] **3.8.4** Create `WithdrawalStatusCard` widget:
  - Status: Pending → Processing → Completed / Failed
  - Amount, method, date
  - Status badge

### 3.9 Testing

- [ ] **3.9.1** Unit tests: OrderRepository CRUD operations
- [ ] **3.9.2** Unit tests: PaymentRepository payment flow
- [ ] **3.9.3** Unit tests: WalletRepository earnings + withdrawal
- [ ] **3.9.4** Widget tests: OrderCard rendering
- [ ] **3.9.5** Widget tests: OrderDetailScreen status timeline
- [ ] **3.9.6** Widget tests: DeliveryForm submission
- [ ] **3.9.7** Widget tests: WalletScreen balance display
- [ ] **3.9.8** Widget tests: WithdrawalScreen form validation
- [ ] **3.9.9** Integration test: checkout → payment → order active flow

---

## Screens Delivered in This Phase

| Screen                 | Route                 | Description                 |
| ---------------------- | --------------------- | --------------------------- |
| `OrderCheckoutScreen`  | `/orders/checkout`    | Order creation + payment    |
| `OrdersListScreen`     | `/orders`             | All orders (buyer + seller) |
| `OrderDetailScreen`    | `/orders/:id`         | Full order lifecycle        |
| `DeliveryFormScreen`   | `/orders/:id/deliver` | Submit delivery (seller)    |
| `PaymentWebViewScreen` | —                     | SSLCommerz payment WebView  |
| `PaymentSuccessScreen` | —                     | Payment confirmation        |
| `PaymentFailedScreen`  | —                     | Payment failure             |
| `DashboardScreen`      | `/home`               | Unified dashboard           |
| `WalletScreen`         | `/wallet`             | Earnings & transactions     |
| `WithdrawalScreen`     | `/wallet/withdraw`    | Withdrawal request          |

---

## Key Widgets Delivered

| Widget                 | Purpose                     |
| ---------------------- | --------------------------- |
| `OrderCard`            | Order list item             |
| `OrderStatusTimeline`  | Visual order progress       |
| `DeliveryCard`         | Delivery submission display |
| `RevisionRequestSheet` | Revision request form       |
| `PriceSummaryCard`     | Payment breakdown           |
| `DashboardStatCard`    | Dashboard metric card       |
| `QuickActionGrid`      | Dashboard quick actions     |
| `ActionNeededList`     | Pending items widget        |
| `TransactionTile`      | Transaction history item    |
| `WithdrawalStatusCard` | Withdrawal tracking         |

---

## Backend Endpoints Consumed

| Endpoint                           | Usage                           |
| ---------------------------------- | ------------------------------- |
| `POST /orders`                     | Create order                    |
| `GET /orders/me`                   | My orders list                  |
| `GET /orders/:id`                  | Order detail                    |
| `POST /orders/:id/deliver`         | Submit delivery                 |
| `POST /orders/:id/accept-delivery` | Accept delivery                 |
| `POST /orders/:id/revision`        | Request revision                |
| `POST /orders/:id/cancel`          | Cancel order                    |
| `GET /orders/:id/milestones`       | Get milestones                  |
| `POST /payments/initiate`          | Start payment → get WebView URL |
| `GET /payments/status/:txn`        | Check payment status            |
| `GET /transactions/me`             | Transaction history             |
| `GET /wallet/summary`              | Earnings summary                |
| `POST /withdrawals`                | Request withdrawal              |
| `GET /withdrawals/me`              | Withdrawal history              |

---

## Definition of Done

- [ ] Order checkout flow: gig → package select → requirements → payment
- [ ] SSLCommerz WebView payment working on both Android & iOS
- [ ] Payment success/failure handling
- [ ] Order list with buyer/seller tabs and filters
- [ ] Order detail with full lifecycle management
- [ ] Delivery submit → review → accept/revision cycle
- [ ] Dashboard with real stats and action items
- [ ] Wallet page with earnings, transactions, withdrawals
- [ ] Withdrawal request flow complete
- [ ] All screens handle loading, error, empty states
- [ ] All tests passing
