-- ============================================================
-- 900 — Shared trigger: auto-update updated_at on row change
-- Priority: 90 (run after all tables exist)
-- ============================================================
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables
DO $$ DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'department', 'category', 'profile', 'gig', 'job',
      'job_proposal', 'order', 'chat_room', 'chat_message',
      'wallet', 'wallet_record'
    ])
  LOOP
    EXECUTE format(
      'CREATE TRIGGER set_updated_at BEFORE UPDATE ON %I
       FOR EACH ROW EXECUTE FUNCTION trigger_set_updated_at();',
      tbl
    );
  END LOOP;
END $$;
