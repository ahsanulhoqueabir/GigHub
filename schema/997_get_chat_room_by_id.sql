-- ============================================================
-- 997 — get_chat_room_by_id (single-roundtrip room detail with access check)
-- Priority: 99 (run after all tables exist)
--
-- Fetches a single chat room by ID with full details and access control.
-- Access is granted ONLY if the caller is the buyer or seller.
--
-- Parameters:
--   p_room_id       UUID — the chat room ID
--   p_caller_profile UUID — caller's profile ID
--
-- Returns JSONB:
--   { "success": true, "data": { ... room with buyer, seller, order, latest_message } }
--   { "success": false, "error": "Not found" }
-- ============================================================

CREATE OR REPLACE FUNCTION get_chat_room_by_id(
  p_room_id        UUID,
  p_caller_profile UUID
)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'success', true,
    'data', jsonb_build_object(
      'id',         cr.id,
      'created_at', cr.created_at,
      'updated_at', cr.updated_at,
      'status',     cr.status,
      'title',      cr.title,
      'buyer', jsonb_build_object(
        'id',       b.id,
        'name',     b.name,
        'username', b.username,
        'avatar',   b.avatar
      ),
      'seller', jsonb_build_object(
        'id',       s.id,
        'name',     s.name,
        'username', s.username,
        'avatar',   s.avatar
      ),
      'order', jsonb_build_object(
        'id',          o.id,
        'code',        o.code,
        'title',       o.title,
        'status',      o.status,
        'total_price', o.total_price
      ),
      'latest_message', lm.latest_message
    )
  ) INTO v_result
  FROM chat_room cr
  JOIN profile b  ON b.id = cr.buyer
  JOIN profile s  ON s.id = cr.seller
  JOIN "order" o  ON o.id = cr."order"
  LEFT JOIN LATERAL (
    SELECT jsonb_build_object(
      'id',              cm.id,
      'content',         cm.content,
      'created_at',      cm.created_at,
      'sender',          cm.sender,
      'attachment_url',  cm.attachment_url,
      'attachment_name', cm.attachment_name,
      'attachment_type', cm.attachment_type
    ) AS latest_message
    FROM chat_message cm
    WHERE cm.room = cr.id
    ORDER BY cm.created_at DESC
    LIMIT 1
  ) lm ON true
  WHERE cr.id = p_room_id
    AND (cr.buyer = p_caller_profile OR cr.seller = p_caller_profile);

  IF v_result IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error',   'Not found'
    );
  END IF;

  RETURN v_result;
END;
$$;
