-- ============================================================
-- 100 — chat_message (depends on: chat_room, profile)
-- Priority: 10
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_message (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  status          record_status NOT NULL DEFAULT 'ACTIVE',

  room            UUID NOT NULL REFERENCES chat_room(id) ON DELETE CASCADE ON UPDATE CASCADE,
  sender          UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  content         TEXT,
  attachment_url  TEXT,
  attachment_name TEXT,
  attachment_type TEXT
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_message_status  ON chat_message(status);
CREATE INDEX IF NOT EXISTS idx_chat_message_room    ON chat_message(room);
CREATE INDEX IF NOT EXISTS idx_chat_message_sender  ON chat_message(sender);
CREATE INDEX IF NOT EXISTS idx_chat_message_created ON chat_message(created_at ASC);
