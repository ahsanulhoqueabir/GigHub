# Database Migrations

Each file has a numeric prefix indicating the **execution order** (priority).  
Files with lower numbers must run before files with higher numbers.

## Execution Order

| Priority | File                         | Description                           |
| -------- | ---------------------------- | ------------------------------------- |
| 0        | `000_extensions.sql`         | Extensions (uuid-ossp)                |
| 1        | `010_enums.sql`              | ENUM types                            |
| 2        | `020_department.sql`         | Department table                      |
| 3        | `030_category.sql`           | Category table (self-referencing FK)  |
| 4        | `040_profile.sql`            | Profile table                         |
| 5        | `050_gig.sql`                | Gig table                             |
| 6        | `060_job.sql`                | Job table                             |
| 7        | `070_job_proposal.sql`       | Job proposal table                    |
| 8        | `080_order.sql`              | Order table                           |
| 9        | `090_chat_room.sql`          | Chat room table                       |
| 10       | `100_chat_message.sql`       | Chat message table                    |
| 11       | `110_wallet.sql`             | Wallet table                          |
| 12       | `120_wallet_record.sql`      | Wallet record table                   |
| 90       | `900_triggers.sql`           | updated_at trigger (all tables)       |
| 91       | `910_rls.sql`                | Row Level Security policies           |
| 99       | `990_stored_procedures.sql`  | Stored procedures                     |
| 99       | `991_signup_transaction.sql` | Signup transaction (profile + wallet) |
