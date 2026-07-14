import { create } from "zustand";
import { api_client } from "@/lib/api/api-client";
import { createClient, RealtimeChannel } from "@supabase/supabase-js";
import { sb } from "@/config/env.config";
import type { ChatRoomWithDetails } from "@/services/chat.service";
import type { ChatMessage } from "@/types/db/chat-message.types";

// Initialize Supabase client
// Note: sb.secret is undefined in the browser, which is correct and secure.
const supabase = createClient(sb.url, sb.publish);

interface ChatState {
  rooms: ChatRoomWithDetails[];
  messages: ChatMessage[];
  activeRoomId: string | null;
  isLoadingRooms: boolean;
  isLoadingMessages: boolean;
  isSendingMessage: boolean;
  error: string | null;
  hasMoreMessages: boolean;
  oldestMessageCursor: string | null;
  subscription: RealtimeChannel | null;
  supabaseToken: string | null;
}

interface ChatActions {
  fetchRooms: () => Promise<void>;
  selectRoom: (roomId: string) => Promise<void>;
  fetchMessages: (roomId: string, isLoadMore?: boolean) => Promise<void>;
  sendMessage: (
    content: string | null,
    attachment?: { url: string; name: string; type: string } | null
  ) => Promise<void>;
  subscribeToRealtime: (roomId: string) => Promise<void>;
  unsubscribeFromRealtime: () => void;
  addIncomingMessage: (msg: ChatMessage) => void;
  clearError: () => void;
  reset: () => void;
}

const initialState: ChatState = {
  rooms: [],
  messages: [],
  activeRoomId: null,
  isLoadingRooms: false,
  isLoadingMessages: false,
  isSendingMessage: false,
  error: null,
  hasMoreMessages: false,
  oldestMessageCursor: null,
  subscription: null,
  supabaseToken: null,
};

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  ...initialState,

  /**
   * Fetch all active chat rooms for the current user.
   */
  fetchRooms: async () => {
    set({ isLoadingRooms: true, error: null });
    try {
      const { data } = await api_client.get("/chat/rooms");
      set({ rooms: data.data, isLoadingRooms: false });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load chat rooms";
      set({ isLoadingRooms: false, error: msg });
    }
  },

  /**
   * Select a chat room, load message history, and subscribe to Realtime updates.
   */
  selectRoom: async (roomId) => {
    if (!roomId) {
      get().unsubscribeFromRealtime();
      set({ activeRoomId: null, messages: [], hasMoreMessages: false, oldestMessageCursor: null });
      return;
    }

    set({ activeRoomId: roomId, messages: [], hasMoreMessages: false, oldestMessageCursor: null });

    // Load initial message history
    await get().fetchMessages(roomId, false);

    // Subscribe to realtime updates for this room
    await get().subscribeToRealtime(roomId);
  },

  /**
   * Fetch messages for the specified room.
   * Handles cursor-based pagination.
   */
  fetchMessages: async (roomId, isLoadMore = false) => {
    const { oldestMessageCursor, hasMoreMessages, isLoadingMessages } = get();

    // Prevent duplicate calls
    if (isLoadMore && (!hasMoreMessages || isLoadingMessages)) return;

    set({ isLoadingMessages: true, error: null });
    try {
      const cursorParam = isLoadMore && oldestMessageCursor ? `?cursor=${encodeURIComponent(oldestMessageCursor)}` : "";
      const { data } = await api_client.get(`/chat/rooms/${roomId}/messages${cursorParam}`);
      const { messages: fetchedMessages, nextCursor } = data.data as {
        messages: ChatMessage[];
        nextCursor: string | null;
      };

      set((state) => {
        // Reverse because backend returns DESC (newest first), but we render ASC (oldest first)
        const messagesAsc = [...fetchedMessages].reverse();

        const updatedMessages = isLoadMore
          ? [...messagesAsc, ...state.messages] // Prepend older messages
          : messagesAsc; // Initial load

        return {
          messages: updatedMessages,
          oldestMessageCursor: nextCursor,
          hasMoreMessages: nextCursor !== null,
          isLoadingMessages: false,
        };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load messages";
      set({ isLoadingMessages: false, error: msg });
    }
  },

  /**
   * Send a chat message. Appends immediately to state and handles R2 attachments.
   */
  sendMessage: async (content, attachment = null) => {
    const { activeRoomId } = get();
    if (!activeRoomId) return;

    set({ isSendingMessage: true, error: null });
    try {
      const { data } = await api_client.post(`/chat/rooms/${activeRoomId}/messages`, {
        content,
        attachment,
      });

      const sentMessage = data.data as ChatMessage;

      // Append immediately to state
      get().addIncomingMessage(sentMessage);

      // Update room list's latest message
      set((state) => {
        const updatedRooms = state.rooms.map((room) => {
          if (room.id === activeRoomId) {
            return {
              ...room,
              updated_at: new Date().toISOString(),
              latest_message: {
                id: sentMessage.id,
                content: sentMessage.content,
                created_at: sentMessage.created_at,
                sender: typeof sentMessage.sender === "string" ? sentMessage.sender : sentMessage.sender?.id || "",
                attachment_url: sentMessage.attachment_url,
                attachment_name: sentMessage.attachment_name,
                attachment_type: sentMessage.attachment_type,
              },
            };
          }
          return room;
        });

        // Re-order rooms by updated_at (newest first)
        const sortedRooms = [...updatedRooms].sort(
          (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
        );

        return { rooms: sortedRooms, isSendingMessage: false };
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to send message";
      set({ isSendingMessage: false, error: msg });
      throw err;
    }
  },

  /**
   * Set up client-side Supabase Realtime subscription.
   */
  subscribeToRealtime: async (roomId) => {
    if (!roomId) return;

    // Unsubscribe from existing room first
    get().unsubscribeFromRealtime();

    try {
      /*
      let token = get().supabaseToken;

      if (!token) {
        // 1. Fetch Supabase access token from our API
        const { data } = await api_client.get("/chat/token");
        token = data.data.token;
        set({ supabaseToken: token });
      }

      // 2. Set session on the client-side Supabase client and realtime client
      await supabase.auth.setSession({
        access_token: token!,
        refresh_token: "",
      });
      supabase.realtime.setAuth(token!);
      */

      // 3. Create a Postgres changes channel filter by roomId
      const channel = supabase
        .channel(`room-messages:${roomId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "chat_message",
            filter: `room=eq.${roomId}`,
          },
          (payload) => {
            const newMessage = payload.new as ChatMessage;
            
            // Fetch sender profile details asynchronously or format if it's our own
            // The Realtime payload contains raw DB columns. The sender column will just be the UUID.
            // Let's resolve the sender details from active room details to keep the UI rich.
            const activeRoom = get().rooms.find((r) => r.id === roomId);
            let senderDetails: { id: string; name: string; username: string; avatar?: string } = {
              id: newMessage.sender as string,
              name: "User",
              username: "user",
              avatar: undefined,
            };
            
            if (activeRoom) {
              if (activeRoom.buyer.id === newMessage.sender) {
                senderDetails = {
                  id: activeRoom.buyer.id,
                  name: activeRoom.buyer.name,
                  username: activeRoom.buyer.username,
                  avatar: activeRoom.buyer.avatar || undefined,
                };
              } else if (activeRoom.seller.id === newMessage.sender) {
                senderDetails = {
                  id: activeRoom.seller.id,
                  name: activeRoom.seller.name,
                  username: activeRoom.seller.username,
                  avatar: activeRoom.seller.avatar || undefined,
                };
              }
            }

            const formattedMessage: ChatMessage = {
              ...newMessage,
              sender: senderDetails,
            };

            get().addIncomingMessage(formattedMessage);

            // Update room list's latest message
            set((state) => {
              const updatedRooms = state.rooms.map((room) => {
                if (room.id === roomId) {
                  return {
                    ...room,
                    updated_at: new Date().toISOString(),
                    latest_message: {
                      id: formattedMessage.id,
                      content: formattedMessage.content,
                      created_at: formattedMessage.created_at,
                      sender: senderDetails.id,
                      attachment_url: formattedMessage.attachment_url,
                      attachment_name: formattedMessage.attachment_name,
                      attachment_type: formattedMessage.attachment_type,
                    },
                  };
                }
                return room;
              });

              // Re-sort rooms
              const sortedRooms = [...updatedRooms].sort(
                (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
              );

              return { rooms: sortedRooms };
            });
          }
        )
        .subscribe((status, err) => {
          if (err) {
            console.error(`[Realtime] Subscription error for room ${roomId}:`, err);
          } else {
            console.log(`[Realtime] Subscription status for room ${roomId}:`, status);
          }
        });

      set({ subscription: channel });
    } catch (err) {
      console.error("Realtime subscription error:", err);
    }
  },

  /**
   * Clean up active Realtime channel.
   */
  unsubscribeFromRealtime: () => {
    const { subscription } = get();
    if (subscription) {
      subscription.unsubscribe();
      set({ subscription: null });
    }
  },

  /**
   * Helper: Appends a message to the state if it doesn't already exist.
   */
  addIncomingMessage: (msg) => {
    set((state) => {
      if (state.messages.some((m) => m.id === msg.id)) {
        return state;
      }
      return {
        messages: [...state.messages, msg],
      };
    });
  },

  clearError: () => set({ error: null }),

  reset: () => {
    get().unsubscribeFromRealtime();
    set(initialState);
  },
}));
