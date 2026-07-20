import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Header } from "@/components/ui/Header";
import { Input } from "@/components/ui/Input";
import { Skeleton } from "@/components/ui/Skeleton";
import { COLORS } from "@/constants/colors";
import { selectIsAuthenticated, useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import type { ChatRoomWithDetails } from "@/types/business/chat.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import { FlatList, Pressable, RefreshControl, Text, View } from "react-native";

function formatTime(isoString: string) {
  const date = new Date(isoString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function getRecipient(room: ChatRoomWithDetails, userId?: string) {
  if (room.buyer.id === userId) {
    return {
      name: room.seller.name,
      username: room.seller.username,
      avatar: room.seller.avatar,
      role: "Seller",
    };
  }
  return {
    name: room.buyer.name,
    username: room.buyer.username,
    avatar: room.buyer.avatar,
    role: "Buyer",
  };
}

export default function ChatListScreen() {
  const isAuthenticated = useAuthStore(selectIsAuthenticated);
  const user = useAuthStore((s) => s.user);
  const rooms = useChatStore((s) => s.rooms);
  const isLoadingRooms = useChatStore((s) => s.isLoadingRooms);
  const fetchRooms = useChatStore((s) => s.fetchRooms);

  const [searchQuery, setSearchQuery] = useState("");

  useFocusEffect(
    useCallback(() => {
      if (isAuthenticated) {
        fetchRooms();
      }
    }, [isAuthenticated, fetchRooms]),
  );

  if (!isAuthenticated) {
    return (
      <View className="flex-1 bg-white dark:bg-gray-950">
        <Header title="Messages" />
        <View className="flex-1 items-center justify-center gap-3 px-10">
          <Ionicons
            name="chatbubble-ellipses-outline"
            size={44}
            color="#D1D5DB"
          />
          <Text className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Messages & Chat
          </Text>
          <Text className="text-center text-xs text-gray-500 dark:text-gray-400 leading-5">
            Log in to view your conversations with buyers, sellers, and clients.
          </Text>
          <Button
            variant="primary"
            className="mt-2 px-8"
            onPress={() => router.push("/(auth)/login")}
          >
            Sign In
          </Button>
        </View>
      </View>
    );
  }

  const filteredRooms = rooms.filter((room) => {
    const recipient = getRecipient(room, user?.id);
    const q = searchQuery.toLowerCase();
    return (
      recipient.name.toLowerCase().includes(q) ||
      room.order?.code?.toLowerCase().includes(q) ||
      room.order?.title?.toLowerCase().includes(q) ||
      room.title?.toLowerCase().includes(q)
    );
  });

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      <Header title="Messages" />

      <View className="px-4 pb-3 pt-2">
        <Input
          placeholder="Search conversations..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          leftIcon={
            <Ionicons name="search-outline" size={18} color={COLORS.gray400} />
          }
        />
      </View>

      {isLoadingRooms && rooms.length === 0 ? (
        <View className="gap-4 px-4">
          {[...Array(5)].map((_, i) => (
            <View key={i} className="flex-row items-center gap-3">
              <Skeleton width={44} height={44} rounded="full" />
              <View className="flex-1 gap-2">
                <Skeleton height={14} width="50%" />
                <Skeleton height={12} width="75%" />
              </View>
            </View>
          ))}
        </View>
      ) : filteredRooms.length === 0 ? (
        <View className="flex-1 items-center justify-center px-8 pb-20">
          <Ionicons
            name="chatbubble-outline"
            size={40}
            color={COLORS.gray400}
          />
          <Text className="mt-3 text-sm text-gray-500 dark:text-gray-400">
            No conversations found
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredRooms}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={isLoadingRooms}
              onRefresh={fetchRooms}
              tintColor={COLORS.primary}
            />
          }
          contentContainerClassName="pb-6"
          ItemSeparatorComponent={() => (
            <View className="h-px bg-gray-100 dark:bg-gray-900" />
          )}
          renderItem={({ item: room }) => {
            const recipient = getRecipient(room, user?.id);
            const latestMsg = room.latest_message;

            return (
              <Pressable
                onPress={() =>
                  router.push({
                    pathname: "/chat/[conversationId]",
                    params: { conversationId: room.id },
                  })
                }
                className="flex-row items-center gap-3 px-4 py-3.5 active:bg-gray-50 dark:active:bg-gray-900"
              >
                <Avatar
                  uri={recipient.avatar}
                  name={recipient.name}
                  size="md"
                />

                <View className="min-w-0 flex-1">
                  <View className="mb-1 flex-row items-center justify-between gap-2">
                    <Text
                      numberOfLines={1}
                      className="flex-1 text-sm font-bold text-gray-900 dark:text-gray-100"
                    >
                      {room.order?.title || room.title}
                    </Text>
                    {latestMsg ? (
                      <Text className="text-[10px] text-gray-400 dark:text-gray-500">
                        {formatTime(latestMsg.created_at)}
                      </Text>
                    ) : null}
                  </View>

                  <View className="mb-1 flex-row items-center gap-1.5">
                    {room.order?.code ? (
                      <Text className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                        {room.order.code}
                      </Text>
                    ) : null}
                    <Text
                      numberOfLines={1}
                      className="flex-1 text-[11px] text-gray-500 dark:text-gray-400"
                    >
                      with {recipient.name}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    className="text-xs text-gray-500 dark:text-gray-400"
                  >
                    {latestMsg
                      ? latestMsg.content || "Sent an attachment"
                      : "No messages yet"}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </View>
  );
}
