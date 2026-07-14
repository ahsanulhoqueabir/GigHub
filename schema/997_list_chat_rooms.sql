-- ============================================================
-- 997 — list_chat_rooms (single-roundtrip room listing with latest message)
-- Priority: 99 (run after all tables exist)
--
-- Lists all chat rooms for a user (buyer or seller), with:
--   - buyer/seller profile info (id, name, username, avatar)
--   - order info (id, code, title, status, total_price)
--   - latest message (id, content, created_at, sender, attachments)
--
-- Uses DISTINCT ON + LATERAL JOIN to avoid N+1 queries.
--
-- Parameters:
--   p_profile_id  UUID — the caller's profile ID
--
-- Returns JSONB:
--   { "success": true, "data": [ ... rooms ... ] }
--   { "success": false, "error": string }
-- ============================================================

CREATE OR REPLACE FUNCTION list_chat_rooms(p_profile_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
AS $$
DECLARE
  v_result JSONB;
BEGIN
  SELECT jsonb_build_object(
    'success', true,
    'data', COALESCE(
      jsonb_agg(
        jsonb_build_object(
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
        ORDER BY cr.updated_at DESC
      ),
      '[]'::jsonb
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
  WHERE cr.buyer = p_profile_id OR cr.seller = p_profile_id;

  RETURN v_result;
END;
$$;
