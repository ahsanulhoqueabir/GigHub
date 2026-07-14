-- ============================================================
-- 997 — send_chat_message (atomic message insert + room update)
-- Priority: 99 (run after all tables exist)
--
-- Inserts a chat message and updates the room's updated_at
-- in a single transaction, with access control.
--
-- Access is granted ONLY if the caller is the buyer or seller of the room.
--
-- Parameters:
--   p_room_id         UUID   — the chat room ID
--   p_sender_id       UUID   — sender's profile ID
--   p_content         TEXT   — message content (nullable)
--   p_attachment_url  TEXT   — attachment URL (nullable)
--   p_attachment_name TEXT   — attachment name (nullable)
--   p_attachment_type TEXT   — attachment type (nullable)
--
-- Returns JSONB:
--   { "success": true, "data": { ... message with sender profile ... } }
--   { "success": false, "error": "Not found" | "Message cannot be empty" }
-- ============================================================

CREATE OR REPLACE FUNCTION send_chat_message(
  p_room_id         UUID,
  p_sender_id       UUID,
  p_content         TEXT DEFAULT NULL,
  p_attachment_url  TEXT DEFAULT NULL,
  p_attachment_name TEXT DEFAULT NULL,
  p_attachment_type TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_participant BOOLEAN;
  v_message JSONB;
BEGIN
  -- ── 1. Validate content or attachment exists ──────────────
  IF p_content IS NULL AND p_attachment_url IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Message content or attachment is required'
    );
  END IF;

  -- ── 2. Verify room participation ──────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM chat_room
    WHERE id = p_room_id
      AND (buyer = p_sender_id OR seller = p_sender_id)
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Not found'
    );
  END IF;

  -- ── 3. Insert message and update room in one transaction ──
  WITH inserted_message AS (
    INSERT INTO chat_message (
      room, sender, content,
      attachment_url, attachment_name, attachment_type
    ) VALUES (
      p_room_id, p_sender_id, p_content,
      p_attachment_url, p_attachment_name, p_attachment_type
    )
    RETURNING id, created_at, updated_at, status, room, content,
              attachment_url, attachment_name, attachment_type, sender
  )
  SELECT jsonb_build_object(
    'id',              im.id,
    'created_at',      im.created_at,
    'updated_at',      im.updated_at,
    'status',          im.status,
    'room',            im.room,
    'content',         im.content,
    'attachment_url',  im.attachment_url,
    'attachment_name', im.attachment_name,
    'attachment_type', im.attachment_type,
    'sender', jsonb_build_object(
      'id',       p.id,
      'name',     p.name,
      'username', p.username,
      'avatar',   p.avatar
    )
  ) INTO v_message
  FROM inserted_message im
  JOIN profile p ON p.id = im.sender;

  -- ── 4. Update room timestamp ──────────────────────────────
  UPDATE chat_room
  SET updated_at = now()
  WHERE id = p_room_id;

  RETURN jsonb_build_object(
    'success', true,
    'data',    v_message
  );
END;
$$;
