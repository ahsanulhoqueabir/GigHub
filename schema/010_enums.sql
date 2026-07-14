-- ============================================================
-- 010 — ENUM types
-- Priority: 1 (must exist before any table uses them)
-- ============================================================
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE gig_package_tier AS ENUM ('BASIC', 'STANDARD', 'PREMIUM');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE job_type AS ENUM ('PARTTIME', 'FULLTIME', 'CONTRACT', 'TUTION', 'VOLUNTEER', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE order_source AS ENUM ('JOB', 'GIG');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE record_status AS ENUM ('DRAFT', 'PENDING', 'ACTIVE', 'DELETED', 'ON_HOLD', 'COMPLETED', 'CANCELLED', 'DECLINED', 'IN_PROGRESS', 'EXPIRED', 'PAUSED', 'DELIVERED', 'REVIEW', 'REVISION','SUSPENDED','ACCEPTED','APPROVED');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE wallet_record_type AS ENUM ('CREDIT', 'DEBIT');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;


