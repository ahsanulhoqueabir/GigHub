-- ============================================================
-- 090 — chat_room (depends on: "order", profile)
-- Priority: 9
-- ============================================================
CREATE TABLE IF NOT EXISTS chat_room (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  status      record_status NOT NULL DEFAULT 'ACTIVE',

  title       TEXT NOT NULL,
  "order"     UUID NOT NULL REFERENCES "order"(id) ON DELETE CASCADE ON UPDATE CASCADE,
  buyer       UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
  seller      UUID NOT NULL REFERENCES profile(id) ON DELETE CASCADE ON UPDATE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_chat_room_status  ON chat_room(status);
CREATE INDEX IF NOT EXISTS idx_chat_room_order   ON chat_room("order");
CREATE INDEX IF NOT EXISTS idx_chat_room_buyer   ON chat_room(buyer);
CREATE INDEX IF NOT EXISTS idx_chat_room_seller  ON chat_room(seller);
