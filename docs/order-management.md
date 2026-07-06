# Order CRUD API Documentation

---

# Overview

The Order module supports two different order creation flows:

1. **Gig Order**
2. **Job Order**

All order creation must be performed through PostgreSQL RPC functions to guarantee **atomicity**. An order should never be partially created.

---

# Order Lifecycle

```text
                +-----------+
                |  PENDING  |
                +-----------+
                 /    |    \
                /     |     \
         Accept     Delete   Cancel
           |           |        |
           v           v        v
      +-----------+   Removed  +-------------+
      |  ACTIVE   |            | CANCELLED   |
      +-----------+            +-------------+
```

## Status Rules

| Status    | Allowed Operations       |
| --------- | ------------------------ |
| PENDING   | Accept, Cancel, Delete   |
| ACTIVE    | Cancel                   |
| CANCELLED | No further state changes |

---

# Order Code

Order codes are generated in the API layer before calling the RPC.

## Format

```text
PREFIX-YYMMDD-XXXa
```

Example

```text
GG-260706-381k
JB-260706-592m
```

## Prefix Mapping

| Source | Prefix |
| ------ | ------ |
| GIG    | GG     |
| JOB    | JB     |

---

# Order Creation (Gig)

## API Payload

```ts
{
    gig: string;
    package: string;
    deadline: string;
    description: string;
    note?: string;
}
```

The API layer should automatically populate:

```ts
source = "GIG"
order_code = generateOrderCode("GIG")
buyer = authenticated user
```

---

## RPC: `create_gig_order`

**File:** `schema/997_create_gig_order.sql`

Everything below must execute inside a **single database transaction**.

### 1. Fetch Gig

Fetch the following information:

- seller
- title
- packages

### 2. Validate

Ensure:

- Gig exists and is ACTIVE
- Selected package exists (by matching `p_package_tier` in `gig.packages` JSONB)
- Package has a valid price (> 0)
- Seller exists
- Buyer is not purchasing their own gig

### 3. Calculate Pricing

```text
total_amount = selected_package.price
```

Platform fee:

```text
platform_fee = min(
    total_amount × 5%,
    500
)
```

### 4. Create Order

Populate:

- code (from API layer)
- buyer
- seller
- gig
- package
- source = 'GIG'
- deadline
- description
- note
- total_price
- amount = 1
- title (gig title)
- status = 'PENDING'

### 5. Create Chat Room

Create a conversation between:

- buyer
- seller

Room title:

```text
{Package Title} - {Order Code}
```

Example: `Basic - GG-260706-381k`

### 6. Create Escrow

Automatically create an escrow record containing:

- order
- sender = buyer
- receiver = seller
- amount
- platform_fee

### 7. Return Order

Return the newly created order with buyer/seller profile joins.

---

## RPC Signature

```sql
CREATE OR REPLACE FUNCTION create_gig_order(
  p_code TEXT,
  p_buyer UUID,
  p_gig_id UUID,
  p_package_tier gig_package_tier,
  p_deadline TIMESTAMPTZ DEFAULT NULL,
  p_description TEXT DEFAULT NULL,
  p_note TEXT DEFAULT NULL
) RETURNS JSONB
```

## Return Shape

```json
{
  "success": true,
  "data": {
    "order": { "...order fields...", "buyer": {...}, "seller": {...} }
  }
}
```

```json
{
  "success": false,
  "error": "Gig not found or not available"
}
```

---

# Order Creation (Job)

Job orders are created only after a proposal has been approved.

No escrow should be created.

---

## API Payload

```ts
{
    proposal: string;
    note?: string;
}
```

The API layer should automatically populate:

```ts
source = "JOB";
order_code = generateOrderCode("JOB");
```

---

## RPC: `create_job_order`

**File:** `schema/997_create_job_order.sql`

Everything must execute inside a single transaction.

### 1. Fetch Proposal

Fetch proposal together with job information.

Required data:

Proposal

- applicant
- status

Job

- owner
- title
- budget

### 2. Determine Participants

Seller

```text
job.owner
```

Buyer

```text
proposal.applicant
```

### 3. Validate

Ensure:

- Proposal exists
- Proposal status is `APPROVED`
- Job exists
- Buyer and seller are different
- Proposal has not already been converted into an order (check `UNIQUE(proposal_id)` on `"order"` table)

### 4. Create Order

Populate:

- code (from API layer)
- buyer
- seller
- proposal
- job
- source = 'JOB'
- note
- total_price (parsed from job.budget)
- amount = 1
- title (job title)
- status = 'PENDING'

### 5. Create Chat Room

Participants:

- buyer
- seller

Room title:

```text
Job Order - {Order Code}
```

Example: `Job Order - JB-260706-592m`

### 6. No Escrow

Job orders must **not** create escrow entries.

### 7. Return Order

Return the created order with buyer/seller profile joins.

---

## RPC Signature

```sql
CREATE OR REPLACE FUNCTION create_job_order(
  p_code TEXT,
  p_proposal_id UUID,
  p_note TEXT DEFAULT NULL
) RETURNS JSONB
```

## Return Shape

```json
{
  "success": true,
  "data": {
    "order": { "...order fields...", "buyer": {...}, "seller": {...} }
  }
}
```

```json
{
  "success": false,
  "error": "Proposal is not approved"
}
```

---

# Accept Order

## RPC: `accept_order`

**File:** `schema/997_accept_order.sql`

## Endpoint

```http
PATCH /api/order/:id/accept
```

## Rules

Only the **buyer** can accept an order.

Validation:

- Order exists
- Requesting user is the buyer
- Current status is `PENDING`

Update:

```text
status = ACTIVE
updated_at = NOW()
```

Reject when:

- User is not the buyer
- Order is already ACTIVE
- Order is CANCELLED

## RPC Signature

```sql
CREATE OR REPLACE FUNCTION accept_order(
  p_order_id UUID,
  p_caller_profile_id UUID
) RETURNS JSONB
```

---

# Delete Order

## RPC: `delete_order`

**File:** `schema/997_delete_order.sql`

## Endpoint

```http
DELETE /api/order/:id
```

Deletion is **permanent** (hard DELETE). Dependent records (chat_room, escrow) are cleaned up via `ON DELETE CASCADE`.

Orders can only be deleted while they are still in the `PENDING` state.

Validation:

- Order exists
- Status == 'PENDING'
- Requesting user is buyer, seller, or admin

Deletion is **not allowed** when:

- Status is ACTIVE
- Status is CANCELLED

## RPC Signature

```sql
CREATE OR REPLACE FUNCTION delete_order(
  p_order_id UUID,
  p_caller_profile_id UUID,
  p_caller_role TEXT
) RETURNS JSONB
```

---

# Cancel Order

## RPC: `cancel_order`

**File:** `schema/997_cancel_order.sql`

## Endpoint

```http
PATCH /api/order/:id/cancel
```

## Payload

```ts
{
  reason: string;
}
```

Either authorized participant (buyer or seller) may request cancellation.

Update:

```text
status = CANCELLED
cancellation_reason = p_reason
cancellation_request_by = p_caller_profile_id
cancellation_request_at = NOW()
updated_at = NOW()
```

Validation:

- Order exists
- Order is not already CANCELLED
- Caller is buyer or seller
- Reason is not empty

## RPC Signature

```sql
CREATE OR REPLACE FUNCTION cancel_order(
  p_order_id UUID,
  p_caller_profile_id UUID,
  p_reason TEXT
) RETURNS JSONB
```

---

# Database Changes

## Chat Room — Added `title` Column

**File:** `schema/090_chat_room.sql`

```sql
CREATE TABLE IF NOT EXISTS chat_room (
  ...
  title       TEXT NOT NULL,   -- NEW column
  "order"     UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  buyer       UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  seller      UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE
);
```

The TypeScript type `ChatRoomCore` already had `title: string` — the SQL schema now matches.

---

# Database Constraints

## Orders

```sql
UNIQUE(code)
```

## Job Orders

```sql
UNIQUE(proposal_id)
```

## Escrow

```sql
UNIQUE(order_id)
```

---

# Atomicity Requirements

Both order creation flows must execute inside a **single database transaction** using PostgreSQL functions.

If **any** operation fails, the transaction must be rolled back.

This includes:

- Order creation
- Chat room creation
- Escrow creation (Gig only)

No partial data should ever remain in the database.

---

# Edge Cases

## Gig Order

- Gig does not exist → `{ success: false, error: 'Gig not found or not available' }`
- Gig is not ACTIVE → `{ success: false, error: 'Gig not found or not available' }`
- Seller does not exist → handled by FK constraint
- Selected package does not exist → `{ success: false, error: 'Selected package not found' }`
- Package price is missing or ≤ 0 → `{ success: false, error: 'Selected package has no valid price' }`
- Buyer attempts to purchase their own gig → `{ success: false, error: 'You cannot purchase your own gig' }`
- Duplicate order code → API layer retries (max 3 attempts)
- Duplicate chat room → handled by unique constraint
- Escrow creation failure → transaction rolled back

## Job Order

- Proposal does not exist → `{ success: false, error: 'Proposal not found' }`
- Proposal is not approved → `{ success: false, error: 'Proposal is not approved' }`
- Proposal already converted into an order → `{ success: false, error: 'This proposal has already been converted into an order' }`
- Job does not exist → `{ success: false, error: 'Associated job not found' }`
- Buyer and seller are the same user → `{ success: false, error: 'Buyer and seller cannot be the same user' }`
- Duplicate chat room → handled by unique constraint

## Accept Order

- Order not found → `{ success: false, error: 'Order not found' }`
- User is not the buyer → `{ success: false, error: 'Forbidden: Only the buyer can accept this order' }`
- Order already ACTIVE → `{ success: false, error: 'Order cannot be accepted because it is ACTIVE' }`
- Order already CANCELLED → `{ success: false, error: 'Order cannot be accepted because it is CANCELLED' }`

## Delete Order

- Order not found → `{ success: false, error: 'Order not found' }`
- Order is ACTIVE → `{ success: false, error: 'Only pending orders can be deleted. Current status: ACTIVE' }`
- Order is CANCELLED → `{ success: false, error: 'Only pending orders can be deleted. Current status: CANCELLED' }`
- Unauthorized deletion request → `{ success: false, error: 'Forbidden: You are not a participant in this order' }`

## Cancel Order

- Order not found → `{ success: false, error: 'Order not found' }`
- Order already CANCELLED → `{ success: false, error: 'Order is already cancelled' }`
- Unauthorized requester → `{ success: false, error: 'Forbidden: You are not a participant in this order' }`
- Empty cancellation reason → `{ success: false, error: 'Cancellation reason is required' }`

---

# API Layer Responsibilities

The API layer is responsible for:

1. Validating the incoming request payload (Zod schemas in `lib/validations/order.schema.ts`).
2. Authenticating the requesting user via JWT (`withAuth` middleware).
3. Generating a unique order code using `generateOrderCode()` from `lib/business/service.utils.ts`.
4. Passing the authenticated user profile ID and generated order code into the RPC.
5. Retrying order creation if an order code collision occurs (max 3 attempts).
6. Returning the RPC response to the client.

---

# Implementation Summary

## Files Created / Modified

### Schema (SQL)

| File                              | Action       | Description                                  |
| --------------------------------- | ------------ | -------------------------------------------- |
| `schema/090_chat_room.sql`        | **Modified** | Added `title TEXT NOT NULL` column           |
| `schema/997_create_gig_order.sql` | **Created**  | Atomic Gig order creation RPC                |
| `schema/997_create_job_order.sql` | **Created**  | Atomic Job order creation RPC                |
| `schema/997_accept_order.sql`     | **Created**  | Accept order RPC (buyer only)                |
| `schema/997_cancel_order.sql`     | **Created**  | Cancel order RPC (either participant)        |
| `schema/997_delete_order.sql`     | **Created**  | Delete order RPC (hard delete, PENDING only) |

### Validation

| File                              | Action      | Description                                                      |
| --------------------------------- | ----------- | ---------------------------------------------------------------- |
| `lib/validations/order.schema.ts` | **Created** | Zod schemas for create gig order, create job order, cancel order |

### Service

| File                        | Action      | Description                                                             |
| --------------------------- | ----------- | ----------------------------------------------------------------------- |
| `services/order.service.ts` | **Created** | `OrderService` class with create, list, getById, accept, cancel, delete |

### API Routes

| File                                 | Action      | Description                             |
| ------------------------------------ | ----------- | --------------------------------------- |
| `app/api/order/route.ts`             | **Created** | `GET` (list), `POST` (create gig order) |
| `app/api/order/job/route.ts`         | **Created** | `POST` (create job order)               |
| `app/api/order/[id]/route.ts`        | **Created** | `GET` (single), `DELETE`                |
| `app/api/order/[id]/accept/route.ts` | **Created** | `PATCH` (accept)                        |
| `app/api/order/[id]/cancel/route.ts` | **Created** | `PATCH` (cancel)                        |

### Tests

| File                                               | Action      | Description                          |
| -------------------------------------------------- | ----------- | ------------------------------------ |
| `bruno/Order/Create - Gig.bru`                     | **Created** | Happy path gig order                 |
| `bruno/Order/Create - Gig - Missing Fields.bru`    | **Created** | Missing required fields              |
| `bruno/Order/Create - Gig - Own Gig.bru`           | **Created** | Buyer = seller edge case             |
| `bruno/Order/Create - Gig - Invalid Package.bru`   | **Created** | Invalid package tier                 |
| `bruno/Order/Create - Gig - Unauthorized.bru`      | **Created** | No auth token                        |
| `bruno/Order/Create - Job.bru`                     | **Created** | Happy path job order                 |
| `bruno/Order/Create - Job - Not Approved.bru`      | **Created** | Proposal not approved                |
| `bruno/Order/Create - Job - Already Converted.bru` | **Created** | Duplicate proposal order             |
| `bruno/Order/Create - Job - Unauthorized.bru`      | **Created** | No auth token                        |
| `bruno/Order/List.bru`                             | **Created** | Paginated list                       |
| `bruno/Order/List - By Status.bru`                 | **Created** | Filter by status                     |
| `bruno/Order/List - By Source.bru`                 | **Created** | Filter by source                     |
| `bruno/Order/Get By ID.bru`                        | **Created** | Single order fetch                   |
| `bruno/Order/Get By ID - Not Found.bru`            | **Created** | Non-existent ID                      |
| `bruno/Order/Get By ID - Unauthorized.bru`         | **Created** | No auth token                        |
| `bruno/Order/Accept.bru`                           | **Created** | Buyer accepts                        |
| `bruno/Order/Accept - Not Buyer.bru`               | **Created** | Seller tries to accept               |
| `bruno/Order/Accept - Already Active.bru`          | **Created** | Already ACTIVE                       |
| `bruno/Order/Accept - Cancelled.bru`               | **Created** | Already CANCELLED                    |
| `bruno/Order/Accept - Unauthorized.bru`            | **Created** | No auth token                        |
| `bruno/Order/Cancel - By Buyer.bru`                | **Created** | Buyer cancels                        |
| `bruno/Order/Cancel - By Seller.bru`               | **Created** | Seller cancels                       |
| `bruno/Order/Cancel - Already Cancelled.bru`       | **Created** | Already CANCELLED                    |
| `bruno/Order/Cancel - Empty Reason.bru`            | **Created** | Empty reason                         |
| `bruno/Order/Cancel - Unauthorized.bru`            | **Created** | No auth token                        |
| `bruno/Order/Delete - Pending.bru`                 | **Created** | Delete PENDING order                 |
| `bruno/Order/Delete - Active.bru`                  | **Created** | Delete ACTIVE order (should fail)    |
| `bruno/Order/Delete - Cancelled.bru`               | **Created** | Delete CANCELLED order (should fail) |
| `bruno/Order/Delete - Unauthorized.bru`            | **Created** | No auth token                        |

## API Route Reference

| Method   | Endpoint                | Auth     | Description                       |
| -------- | ----------------------- | -------- | --------------------------------- |
| `GET`    | `/api/order`            | Required | List orders (participant/admin)   |
| `POST`   | `/api/order`            | Required | Create Gig order                  |
| `POST`   | `/api/order/job`        | Required | Create Job order                  |
| `GET`    | `/api/order/:id`        | Required | Get single order                  |
| `DELETE` | `/api/order/:id`        | Required | Delete PENDING order              |
| `PATCH`  | `/api/order/:id/accept` | Required | Accept order (buyer only)         |
| `PATCH`  | `/api/order/:id/cancel` | Required | Cancel order (either participant) |

## Key Design Decisions

1. **RPC-based atomicity** — Both creation flows use PostgreSQL functions with `BEGIN/COMMIT` to guarantee atomicity. The Supabase client cannot do multi-table atomic inserts.

2. **Order code retry** — The API layer retries up to 3 times on unique constraint violation. The RPC does NOT handle retry.

3. **Hard delete** — Deletion is permanent via `DELETE FROM "order"`. `ON DELETE CASCADE` cleans up chat_room and escrow.

4. **Separate job creation route** — `POST /api/order/job` keeps the two creation flows distinct and avoids complex conditional logic.

5. **No `manage` route** — Unlike Gig/Job, orders don't need a separate manage endpoint. `GET /api/order` already uses RLS to scope to participant/admin.

6. **Chat room title** — Stored in the `chat_room.title` column. Gig: `{Package Title} - {Code}`, Job: `Job Order - {Code}`.

7. **RLS for reads** — `order_select_participant` policy handles visibility. Service layer does NOT add extra status filtering.
