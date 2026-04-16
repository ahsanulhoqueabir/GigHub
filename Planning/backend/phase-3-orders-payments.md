# Backend Phase 3 — Transactions: Orders, Payments & Escrow

> **Duration Estimate:** 2–3 weeks
> **Dependencies:** Phase 2 complete (Gigs, Jobs, Proposals)
> **Outcomes:** Full order lifecycle, escrow system, SSLCommerz integration, withdrawal system

---

## Phase Overview

Build the order management system, integrate SSLCommerz for payments, implement the escrow mechanism, and set up the withdrawal pipeline. This is the most critical phase for platform trust and reliability.

Tuition listings are explicitly out of payment and escrow flow. They stay free and use chat-based session coordination only.

---

## Task Checklist

### 3.1 Directus Collections Setup

- [ ] **3.1.1** Create `gh_orders` collection with all fields, indexes, and status enum
- [ ] **3.1.2** Create `gh_order_milestones` collection with cascade delete on `order`
- [ ] **3.1.3** Create `gh_order_deliveries` collection
- [ ] **3.1.4** Create `gh_escrow` collection with UNIQUE constraint on `order`
- [ ] **3.1.5** Create `gh_transactions` collection (immutable log)
- [ ] **3.1.6** Create `gh_withdrawals` collection
- [ ] **3.1.7** Set up all foreign key relations:
  - `gh_orders.buyer` / `seller` → `gh_profiles.id`
  - `gh_orders.gig` → `gh_gigs.id`
  - `gh_orders.job` → `gh_jobs.id`
  - `gh_orders.gig_package` → `gh_gig_packages.id`
  - `gh_orders.proposal` → `gh_proposals.id`
  - `gh_order_milestones.order` → `gh_orders.id`
  - `gh_order_deliveries.order` → `gh_orders.id`
  - `gh_escrow.order` → `gh_orders.id`
  - `gh_transactions.profile` → `gh_profiles.id`
  - `gh_transactions.order` → `gh_orders.id`
  - `gh_withdrawals.profile` → `gh_profiles.id`

### 3.2 Order Number Generator

- [ ] **3.2.1** Implement order number generation:
  - Format: `GH-YYYYMMDD-XXX` (e.g., `GH-20260311-001`)
  - Auto-incrementing daily counter
  - Store in utility service

### 3.3 Orders Module

- [ ] **3.3.1** Create `OrderModule` with:
  - `OrderService` — Static methods for `gh_orders`, `gh_order_milestones`, `gh_order_deliveries` logic
  - `OrderController` — REST endpoints
  - `src/types/order.types.ts` — Order, Milestone, and Delivery interfaces
  - DTOs: `CreateGigOrderDto`, `CreateJobOrderDto`, `OrderQueryDto`, `DeliverDto`, `RevisionDto`

#### Order Creation

- [ ] **3.3.2** Implement `POST /orders/gig` — Create order from gig:
  1. Validate `gig` and `package` — gig must be active
  2. Buyer cannot be the gig seller
  3. Calculate: `amount` (from package), `platform_fee` (MVP policy: 5% of paid transaction, capped at BDT 500), `seller_earnings`
  4. Calculate `delivery_deadline` (now + delivery_days)
  5. Generate order number
  6. Create `gh_orders` record with status `pending`
  7. Create `gh_escrow` record with status `held` (funds not yet received)
  8. Initiate payment flow (return `payment_url`)
  9. Increment `gh_gigs.total_orders` (after payment confirmed)

- [ ] **3.3.3** Implement `POST /orders/job` — Create order from accepted proposal:
  1. Validate: proposal is `accepted`, job exists, user is job poster
     1a. Reject if source job has `job_type=tuition` (tuition uses no order/payment flow)
  2. Calculate amounts based on proposal's `quoted_price`
  3. Support optional milestones array
  4. Create `gh_orders` record
  5. Create `gh_order_milestones` records (if milestones provided)
  6. Create `gh_escrow` record
  7. Initiate payment flow

#### Order Lifecycle

- [ ] **3.3.4** Implement `PATCH /orders/:id` — Consolidated order action:
  1. Verify permissions (buyer/seller role check per action)
  2. Expects `type` field in payload: `start`, `deliver`, `approve`, `revision`, `cancel`, `dispute`
  3. **Start**: Mark `in_progress`, trigger notification (Seller)
  4. **Deliver**: Create `gh_order_deliveries` record, set `delivered`, trigger notification (Seller)
  5. **Approve**: Set `completed`, set `completed_at`, release escrow, credit seller, trigger notification (Buyer)
  6. **Revision**: Check count, increment `revisions_used`, set `revision_requested`, trigger notification (Buyer)
  7. **Cancel**: Validate status, set `cancelled` or `disputed`, process refund, trigger notification (Buyer/Seller)
  8. **Dispute**: Set `disputed`, trigger notification (Buyer/Seller)
  9. Logic: Controller calls specific `OrderService` functions based on `type`

#### Order Queries

- [ ] **3.3.10** Implement `GET /orders` — List my orders:
  - Filter by `role` (buyer/seller/both)
  - Filter by `status`
  - Filter by `source_type` (gig/job)
  - Include other party info, order summary
  - Sort by created_at desc

- [ ] **3.3.11** Implement `GET /orders/:id` — Order detail:
  - Full order with: buyer/seller info, gig/job info, package info, milestones, latest delivery, escrow status
  - Only accessible by buyer or seller of this order

#### Milestones

- [ ] **3.3.12** Implement milestone management:
  - Extend `PATCH /orders/:id` with milestone actions: `type=milestone_start`, `type=milestone_deliver`, `type=milestone_approve`
  - Logic: Milestone ID and data included in payload `data` field
  - Partial payment release per milestone
  - Ownership and status checks per milestone action

#### Deliveries

- [ ] **3.3.13** Implement `GET /orders/:orderId/deliveries` — List deliveries for an order
- [ ] **3.3.14** Implement `GET /deliveries/:id` — Get delivery detail

### 3.4 Payments Module (SSLCommerz)

- [ ] **3.4.1** Create `PaymentModule` with:
  - `PaymentService` — Static methods for `gh_transactions` and payment processing logic
  - `PaymentController` — REST endpoints + webhooks
  - `SslcommerzService` — SSLCommerz API wrapper (static methods)
  - `src/types/payment.types.ts` — Transaction and payment session interfaces

- [ ] **3.4.2** Implement SSLCommerz integration:
  - Install SSLCommerz SDK or implement API calls directly
  - Configure with store_id, store_password, sandbox mode
  - Build payment session creation

- [ ] **3.4.3** Implement `POST /payments/initiate`:
  1. Validate order exists and is `pending`
     1a. Validate order source is paid transaction (not tuition flow)
  2. Build SSLCommerz session:
     - `total_amount`, `currency: BDT`
     - `tran_id`: unique transaction ID linking to order
     - `success_url`, `fail_url`, `cancel_url`, `ipn_url`
     - Customer info from `gh_profiles`
     - Product info from order
  3. Return SSLCommerz `GatewayPageURL`

- [ ] **3.4.4** Implement SSLCommerz callback handlers:

  **`POST /payments/sslcommerz/success`** (redirect after payment):
  1. Validate SSLCommerz signature/hash
  2. Verify `tran_id` matches an order
  3. Set order status to `active`
  4. Set escrow status to `held`
  5. Create `gh_transactions` record (debit for buyer)
  6. Redirect to order page on frontend

  **`POST /payments/sslcommerz/fail`**:
  1. Log failure
  2. Keep order as `pending`
  3. Redirect to payment retry page

  **`POST /payments/sslcommerz/cancel`**:
  1. Log cancellation
  2. Optionally cancel the order
  3. Redirect to order page

  **`POST /payments/sslcommerz/ipn`** (Instant Payment Notification):
  1. Validate IPN signature
  2. Cross-check with SSLCommerz validation API
  3. Confirm payment status
  4. This is the most reliable callback — use this as source of truth

- [ ] **3.4.5** Implement SSLCommerz payment validation:
  - Call SSLCommerz validation API to verify payment
  - Check: `val_id`, `amount`, `store_amount`, `status: VALID`
  - Prevent replay attacks (check `tran_id` not already processed)

- [ ] **3.4.6** Implement `GET /payments` — Consolidated payment queries:
  - Support `?type=...` query param: `transactions` (default), `balance`, `escrow`
  - Transaction history: filter by type, direction, date range, paginated
  - Balance: calculate wallet balance
  - Escrow: get status for specific order (requires `order_id`)
  - Logic: Controller calls appropriate service methods based on `type`

### 3.5 Escrow Module

- [ ] **3.5.1** Create `EscrowModule` with:
  - `EscrowService` — Static methods for `gh_escrow` logic
  - `src/types/escrow.types.ts` — Escrow status and interfaces

- [ ] **3.5.2** Implement escrow hold:
  - Called after successful payment
  - Set `gh_escrow.status = 'held'`
  - Calculate `auto_release_at` (delivery_deadline + escrow_auto_release_days from config)

- [ ] **3.5.3** Implement escrow release:
  - Called when buyer approves delivery
  - Deduct platform fee
  - Credit seller's earnings
  - Create transaction records for both parties
  - Set `gh_escrow.status = 'released'`
  - Update `gh_profiles.total_earnings` for seller

- [ ] **3.5.4** Implement escrow refund:
  - Called on cancellation or dispute resolution (refund)
  - Credit buyer
  - Set `gh_escrow.status = 'refunded'`
  - Create transaction record

- [ ] **3.5.5** Implement auto-release cron job:
  - Run every hour
  - Find escrows where `status = 'held'` and `auto_release_at < now()`
  - Auto-release funds to seller
  - Create system notification

### 3.6 Withdrawals Module

- [ ] **3.6.1** Create `WithdrawalModule` with:
  - `WithdrawalService` — Static methods for `gh_withdrawals` logic
  - `WithdrawalController` — REST endpoints
  - `src/types/withdrawal.types.ts` — Withdrawal interfaces and enums

- [ ] **3.6.2** Implement `POST /withdrawals` — Request withdrawal:
  1. Validate amount ≥ `min_withdrawal_amount` from config
  2. Validate amount ≤ available balance
  3. Validate method (bkash, nagad, bank_transfer)
  4. Validate account_details based on method
  5. Create `gh_withdrawals` record with status `pending`
  6. Create `gh_transactions` record (debit, status pending)
  7. **Trigger notification** to admin queue

- [ ] **3.6.3** Implement `GET /withdrawals` — Consolidated withdrawal queries:
  - Support `?type=...` query param: `list` (default), `detail` (requires `id`)
  - Paginated list or single record retrieval
  - Logic: Controller calls appropriate service methods based on `type`

### 3.7 Platform Fee Calculator

- [ ] **3.7.1** Create utility service for fee calculations:

  ```typescript
  calculateFees(amount: number) → {
    platform_fee: number,
    seller_earnings: number,
    fee_percent: number
  }
  ```

  - Enforce MVP baseline policy: fee = min(amount \* 0.05, 500)
  - Keep configuration-extensibility for post-MVP fee experimentation without changing v1 behavior

### 3.8 Testing

- [ ] **3.8.1** Unit tests for OrdersService:
  - Create gig order
  - Create job order with milestones
  - Full lifecycle: start → deliver → approve
  - Revision flow
  - Cancellation scenarios
  - Dispute creation
- [ ] **3.8.2** Unit tests for EscrowService:
  - Hold, release, refund
  - Fee calculation
- [ ] **3.8.3** Unit tests for PaymentsService:
  - SSLCommerz session creation
  - Callback validation
  - IPN processing
- [ ] **3.8.4** Unit tests for WithdrawalsService:
  - Balance validation
  - Withdrawal creation
- [ ] **3.8.5** E2E tests:
  - Full order flow: create → pay → start → deliver → approve → payment released
  - Gig order and job order paths
  - Cancellation + refund
  - Withdrawal request
- [ ] **3.8.6** Mock SSLCommerz for testing (sandbox mode + mock server)

---

## Endpoints Delivered in This Phase

| Method  | Endpoint                       | Status |
| ------- | ------------------------------ | ------ |
| `POST`  | `/orders/gig`                  | 🔲     |
| `POST`  | `/orders/job`                  | 🔲     |
| `GET`   | `/orders`                      | 🔲     |
| `GET`   | `/orders/:id`                  | 🔲     |
| `PATCH` | `/orders/:id`                  | 🔲     |
| `GET`   | `/orders/:orderId/deliveries`  | 🔲     |
| `GET`   | `/deliveries/:id`              | 🔲     |
| `POST`  | `/payments/initiate`           | 🔲     |
| `POST`  | `/payments/sslcommerz/success` | 🔲     |
| `POST`  | `/payments/sslcommerz/fail`    | 🔲     |
| `POST`  | `/payments/sslcommerz/cancel`  | 🔲     |
| `POST`  | `/payments/sslcommerz/ipn`     | 🔲     |
| `GET`   | `/payments`                    | 🔲     |
| `POST`  | `/withdrawals`                 | 🔲     |
| `GET`   | `/withdrawals`                 | 🔲     |

---

## Directus Collections Created

| Collection            | Status |
| --------------------- | ------ |
| `gh_orders`           | 🔲     |
| `gh_order_milestones` | 🔲     |
| `gh_order_deliveries` | 🔲     |
| `gh_escrow`           | 🔲     |
| `gh_transactions`     | 🔲     |
| `gh_withdrawals`      | 🔲     |

---

## Definition of Done

- [ ] Gig-based order creation + payment initiation working
- [ ] Job-based order creation (from accepted proposal) working
- [ ] Tuition requests are blocked from order creation and payment endpoints
- [ ] Full order lifecycle: pending → active → in_progress → delivered → completed
- [ ] Revision flow working (with count enforcement)
- [ ] Cancellation with proper refund handling
- [ ] Dispute creation working
- [ ] SSLCommerz payment integration (sandbox) verified
- [ ] Escrow hold → release → refund working
- [ ] Auto-release cron job running
- [ ] Platform fee correctly calculated and deducted
- [ ] Withdrawal request system working
- [ ] Transaction history accurate
- [ ] All unit and e2e tests passing
