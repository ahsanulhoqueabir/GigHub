-- SQL schema update for Gighub: Chat System (Rooms and Messages)

-- Drop existing tables to ensure clean recreation
DROP TABLE IF EXISTS public.chat_message CASCADE;
DROP TABLE IF EXISTS public.chat_room CASCADE;

-- 1. Create Chat Room Table (1-to-1 with Order)
CREATE TABLE IF NOT EXISTS public.chat_room (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "order" UUID NOT NULL UNIQUE REFERENCES public.order(id) ON DELETE CASCADE ON UPDATE CASCADE,
    buyer UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
    seller UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for Chat Room
CREATE INDEX IF NOT EXISTS chat_room_order_idx ON public.chat_room("order");
CREATE INDEX IF NOT EXISTS chat_room_buyer_idx ON public.chat_room(buyer);
CREATE INDEX IF NOT EXISTS chat_room_seller_idx ON public.chat_room(seller);

-- 2. Create Chat Message Table
CREATE TABLE IF NOT EXISTS public.chat_message (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room UUID NOT NULL REFERENCES public.chat_room(id) ON DELETE CASCADE ON UPDATE CASCADE,
    sender UUID NOT NULL REFERENCES public.profile(id) ON DELETE CASCADE ON UPDATE CASCADE,
    content TEXT,
    attachment_url TEXT,
    attachment_name VARCHAR(255),
    attachment_type VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Indexing for Chat Message
CREATE INDEX IF NOT EXISTS chat_message_room_idx ON public.chat_message(room);
CREATE INDEX IF NOT EXISTS chat_message_sender_idx ON public.chat_message(sender);
CREATE INDEX IF NOT EXISTS chat_message_created_at_idx ON public.chat_message(created_at);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.chat_room ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_message ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
-- Allow buyer or seller of the order/room to view the chat room
DROP POLICY IF EXISTS "Allow participant read access" ON public.chat_room;
CREATE POLICY "Allow participant read access" ON public.chat_room
    FOR SELECT TO authenticated USING (buyer = auth.uid() OR seller = auth.uid());

-- Allow buyer or seller to read messages in the chat room
DROP POLICY IF EXISTS "Allow participant read messages" ON public.chat_message;
CREATE POLICY "Allow participant read messages" ON public.chat_message
    FOR SELECT TO authenticated USING (
        EXISTS (
            SELECT 1 FROM public.chat_room cr
            WHERE cr.id = chat_message.room
            AND (cr.buyer = auth.uid() OR cr.seller = auth.uid())
        )
    );

-- 5. Enable Realtime for chat messages
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime'
    ) THEN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_message;
    END IF;
END $$;

-- 6. Automatically create chat room on order creation
CREATE OR REPLACE FUNCTION public.create_chat_room_on_order()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.chat_room ("order", buyer, seller)
    VALUES (NEW.id, NEW.buyer, NEW.seller)
    ON CONFLICT ("order") DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_create_chat_room_on_order ON public.order;
CREATE TRIGGER trg_create_chat_room_on_order
AFTER INSERT ON public.order
FOR EACH ROW
EXECUTE FUNCTION public.create_chat_room_on_order();

