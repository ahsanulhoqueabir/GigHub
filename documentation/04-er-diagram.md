# 4. Entity-Relationship Diagram

> Derived directly from the applied SQL migrations in [`web/schema/`](../../web/schema) — see [03-database-schema.md](./03-database-schema.md) for full column-level detail. `department`, `category`, and `profile` are the root entities; everything else hangs off `profile`, `gig`, `job`, and `"order"`.

```mermaid
erDiagram
    DEPARTMENT ||--o{ PROFILE : "department"
    CATEGORY ||--o{ CATEGORY : "parent (self-ref)"
    CATEGORY ||--o{ GIG : "category"
    CATEGORY ||--o{ JOB : "category"

    PROFILE ||--o{ GIG : "seller"
    PROFILE ||--o{ JOB : "owner"
    PROFILE ||--o{ JOB_PROPOSAL : "applicant"
    PROFILE ||--o{ ORDER : "buyer"
    PROFILE ||--o{ ORDER : "seller"
    PROFILE ||--o{ ORDER : "cancellation_request_by"
    PROFILE ||--o{ CHAT_ROOM : "buyer"
    PROFILE ||--o{ CHAT_ROOM : "seller"
    PROFILE ||--o{ CHAT_MESSAGE : "sender"
    PROFILE ||--o| WALLET : "user"
    PROFILE ||--o{ ESCROW : "sender (buyer)"
    PROFILE ||--o{ ESCROW : "receiver (seller)"
    PROFILE ||--o{ ESCROW : "resolved_by (admin)"
    PROFILE ||--o{ REVIEWS : "reviewer"
    PROFILE ||--o{ REVIEWS : "seller"

    JOB ||--o{ JOB_PROPOSAL : "job"
    JOB ||--o{ ORDER : "job (nullable)"
    JOB_PROPOSAL ||--o| ORDER : "proposal (nullable)"
    GIG ||--o{ ORDER : "gig (nullable)"
    GIG ||--o{ REVIEWS : "gig"

    ORDER ||--|| CHAT_ROOM : "order"
    ORDER ||--|| ESCROW : "order"
    ORDER ||--o| REVIEWS : "order (unique)"
    ORDER ||--o{ WALLET_RECORD : "order"

    CHAT_ROOM ||--o{ CHAT_MESSAGE : "room"

    WALLET ||--o{ WALLET_RECORD : "wallet"
    ESCROW ||--o{ WALLET_RECORD : "escrow"

    DEPARTMENT {
        uuid id PK
        text name
        text code
        text acronym
        record_status status
    }

    CATEGORY {
        uuid id PK
        text name
        text slug UK
        uuid parent FK "self-ref, nullable"
        int ordering
        record_status status
    }

    PROFILE {
        uuid id PK
        text name
        text username UK
        text email UK
        user_role role "USER | ADMIN"
        uuid department FK "nullable"
        text student_id
        boolean verified
        record_status status
    }

    GIG {
        uuid id PK
        uuid seller FK
        uuid category FK
        text title
        text slug UK
        jsonb packages "BASIC/STANDARD/PREMIUM"
        jsonb faq
        int views
        record_status status
    }

    JOB {
        uuid id PK
        uuid owner FK
        uuid category FK
        text title
        text slug UK
        job_type type
        text budget
        timestamptz deadline
        int views
        record_status status
    }

    JOB_PROPOSAL {
        uuid id PK
        uuid job FK
        uuid applicant FK
        text description
        record_status status
    }

    ORDER {
        uuid id PK
        text code UK
        uuid buyer FK
        uuid seller FK
        uuid gig FK "nullable"
        uuid job FK "nullable"
        uuid proposal FK "nullable"
        gig_package_tier package "nullable"
        order_source source "JOB | GIG"
        numeric total_price
        uuid cancellation_request_by FK "nullable"
        record_status status
    }

    CHAT_ROOM {
        uuid id PK
        uuid order FK
        uuid buyer FK
        uuid seller FK
        text title
        record_status status
    }

    CHAT_MESSAGE {
        uuid id PK
        uuid room FK
        uuid sender FK
        text content "nullable"
        text attachment_url "nullable"
        record_status status
    }

    WALLET {
        uuid id PK
        uuid user FK
        numeric balance
        text currency "BDT"
        record_status status
    }

    WALLET_RECORD {
        uuid id PK
        uuid wallet FK
        uuid order FK
        uuid escrow FK
        numeric amount
        wallet_record_type type "CREDIT | DEBIT"
        text payment_gateway
        record_status status
    }

    ESCROW {
        uuid id PK
        uuid order FK
        uuid sender FK "buyer"
        uuid receiver FK "seller"
        numeric amount
        numeric platform_fee
        text payment_status "UNPAID | PAID"
        uuid resolved_by FK "nullable, admin"
        record_status status
    }

    REVIEWS {
        uuid id PK
        uuid reviewer FK
        uuid gig FK
        uuid seller FK
        uuid order FK "unique"
        smallint rating "1-5"
    }
```

## 4.1 Relationship Notes

- **`"order"` is the hub entity.** Every order has exactly **one** `escrow` (1:1) and **one** `chat_room` (1:1), and can have at most **one** `reviews` row (1:0..1, enforced by `UNIQUE("order")`).
- **Polymorphic sourcing:** an order is sourced from _either_ a `gig` (direct purchase, `source = GIG`, `package` populated) _or_ a `job` + `job_proposal` (`source = JOB`). Both FK columns are nullable on `"order"` for this reason — application/RPC logic enforces exactly one path is populated per `source`.
- **`profile` fan-out:** a single `profile` row participates in up to 8 different relationships (seller of gigs, owner of jobs, applicant of proposals, buyer/seller of orders, buyer/seller of chat rooms, sender of messages, sender/receiver/resolver of escrow, reviewer/reviewed in reviews) — this is what makes the "every student is dual-sided" product model possible without separate account types.
- **`category` is a self-referencing tree** (`parent → category.id`) supporting nested subcategories for both gigs and jobs.
- **`wallet_record` is the append-only ledger** joining `wallet` (whose balance it should reconcile to) with the `order`/`escrow` pair that generated it — this is what the admin dashboard and per-user transaction history are built from.
- Admins are not a separate table — `profile.role = 'ADMIN'` plus RLS `is_admin()` checks gate elevated access (dispute resolution, content management, user governance).

## 4.2 Cardinality Summary

| Relationship                            | Cardinality |
| --------------------------------------- | ----------- |
| `profile` → `gig` (as seller)           | 1 : N       |
| `profile` → `job` (as owner)            | 1 : N       |
| `job` → `job_proposal`                  | 1 : N       |
| `job_proposal` → `"order"`              | 1 : 0..1    |
| `gig` → `"order"`                       | 1 : N       |
| `"order"` → `escrow`                    | 1 : 1       |
| `"order"` → `chat_room`                 | 1 : 1       |
| `"order"` → `reviews`                   | 1 : 0..1    |
| `chat_room` → `chat_message`            | 1 : N       |
| `wallet` → `wallet_record`              | 1 : N       |
| `escrow` → `wallet_record`              | 1 : N       |
| `category` → `category` (subcategories) | 1 : N       |
| `department` → `profile`                | 1 : N       |
