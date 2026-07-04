-- ============================================================
-- 080 — "order" (depends on: profile, gig, job, job_proposal)
-- Priority: 8
-- NOTE: "order" is a reserved word — always quote it.
-- ============================================================
CREATE TABLE IF NOT EXISTS "order" (
  id                      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at              TIMESTAMPTZ NOT NULL DEFAULT now(),
  status                  record_status NOT NULL DEFAULT 'PENDING',

  code                    TEXT NOT NULL UNIQUE,
  buyer                   UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  seller                  UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  gig                     UUID REFERENCES gig(id) ON DELETE SET NULL ON UPDATE CASCADE,
  job                     UUID REFERENCES job(id) ON DELETE SET NULL ON UPDATE CASCADE,
  package                 gig_package_tier,
  proposal                UUID REFERENCES job_proposal(id) ON DELETE SET NULL ON UPDATE CASCADE,
  description             TEXT,
  note                    TEXT,
  source                  order_source NOT NULL,
  total_price             NUMERIC(12,2) NOT NULL DEFAULT 0,
  title                   TEXT NOT NULL,
  amount                  INTEGER NOT NULL DEFAULT 1,
  deadline                TIMESTAMPTZ,
  cancellation_reason     TEXT,
  cancellation_request_by UUID REFERENCES profile(id) ON DELETE SET NULL ON UPDATE CASCADE,
  cancellation_request_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_order_status             ON "order"(status);
CREATE INDEX IF NOT EXISTS idx_order_buyer              ON "order"(buyer);
CREATE INDEX IF NOT EXISTS idx_order_seller             ON "order"(seller);
CREATE INDEX IF NOT EXISTS idx_order_code               ON "order"(code);
CREATE INDEX IF NOT EXISTS idx_order_source             ON "order"(source);
CREATE INDEX IF NOT EXISTS idx_order_gig                ON "order"(gig);
CREATE INDEX IF NOT EXISTS idx_order_job                ON "order"(job);
CREATE INDEX IF NOT EXISTS idx_order_created_at         ON "order"(created_at DESC);
