-- ============================================================
-- 997 — list_chat_messages (cursor-based pagination with access check)
-- Priority: 99 (run after all tables exist)
--
-- Lists messages in a room with cursor-based pagination, access control,
-- and sender profile info baked in.
--
-- Access is granted ONLY if the caller is the buyer or seller of the room.
--
-- Parameters:
--   p_room_id        UUID   — the chat room ID
--   p_caller_profile UUID   — caller's profile ID
--   p_limit          INT    — max messages to return (default 50)
--   p_cursor         TEXT   — ISO timestamp cursor for pagination (nullable)
--
-- Returns JSONB:
--   {
--     "success": true,
--     "data": {
--       "messages": [ ... ],
--       "nextCursor": "2024-01-01T00:00:00Z" | null
--     }
--   }
--   { "success": false, "error": "Not found" }
-- ============================================================

CREATE OR REPLACE FUNCTION list_chat_messages(
  p_room_id        UUID,
  p_caller_profile UUID,
  p_limit          INT DEFAULT 50,
  p_cursor         TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_is_participant BOOLEAN;
  v_messages JSONB;
  v_next_cursor TEXT;
BEGIN
  -- ── 1. Verify room participation ──────────────────────────
  SELECT EXISTS (
    SELECT 1 FROM chat_room
    WHERE id = p_room_id
      AND (buyer = p_caller_profile OR seller = p_caller_profile)
  ) INTO v_is_participant;

  IF NOT v_is_participant THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Not found'
    );
  END IF;

  -- ── 2. Fetch messages ─────────────────────────────────────
  SELECT jsonb_agg(
    jsonb_build_object(
      'id',              cm.id,
      'created_at',      cm.created_at,
      'updated_at',      cm.updated_at,
      'status',          cm.status,
      'room',            cm.room,
      'content',         cm.content,
      'attachment_url',  cm.attachment_url,
      'attachment_name', cm.attachment_name,
      'attachment_type', cm.attachment_type,
      'sender', jsonb_build_object(
        'id',       p.id,
        'name',     p.name,
        'username', p.username,
        'avatar',   p.avatar
      )
    )
    ORDER BY cm.created_at DESC
  ) INTO v_messages
  FROM chat_message cm
  JOIN profile p ON p.id = cm.sender
  WHERE cm.room = p_room_id
    AND (p_cursor IS NULL OR cm.created_at < p_cursor::TIMESTAMPTZ);

  -- ── 3. Determine next cursor ──────────────────────────────
  SELECT cm.created_at::TEXT INTO v_next_cursor
  FROM chat_message cm
  WHERE cm.room = p_room_id
    AND (p_cursor IS NULL OR cm.created_at < p_cursor::TIMESTAMPTZ)
  ORDER BY cm.created_at ASC
  LIMIT 1
  OFFSET p_limit - 1;

  RETURN jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'messages',   COALESCE(v_messages, '[]'::jsonb),
      'nextCursor', v_next_cursor
    )
  );
END;
$$;
