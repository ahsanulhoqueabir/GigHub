import { Avatar } from "@/components/ui/Avatar";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { COLORS } from "@/constants/colors";
import { getErrorMessage } from "@/lib/api/api-response";
import {
  isImageFile,
  pickLocalDocuments,
  pickLocalImages,
  uploadStagedFilesWithProgress,
  type StagedFile,
} from "@/lib/upload";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import { toast } from "@/store/toast.store";
import type { ChatRoomWithDetails } from "@/types/business/chat.types";
import type { ChatMessage } from "@/types/db/chat-message.types";
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  Image as RNImage,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function formatTime(isoString: string) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateDivider(isoString: string) {
  return new Date(isoString).toLocaleDateString([], {
    weekday: "long",
    month: "short",
    day: "numeric",
  });
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

type Row = { message: ChatMessage; showDivider: boolean };

export default function ConversationScreen() {
  const { conversationId } = useLocalSearchParams<{ conversationId: string }>();
  const insets = useSafeAreaInsets();
  const isAuthenticated = useAuthStore((s) => s.accessToken !== null);
  const user = useAuthStore((s) => s.user);

  const rooms = useChatStore((s) => s.rooms);
  const messages = useChatStore((s) => s.messages);
  const isLoadingMessages = useChatStore((s) => s.isLoadingMessages);
  const isSendingMessage = useChatStore((s) => s.isSendingMessage);
  const hasMoreMessages = useChatStore((s) => s.hasMoreMessages);
  const fetchRooms = useChatStore((s) => s.fetchRooms);
  const selectRoom = useChatStore((s) => s.selectRoom);
  const fetchMessages = useChatStore((s) => s.fetchMessages);
  const sendMessage = useChatStore((s) => s.sendMessage);

  const [messageInput, setMessageInput] = useState("");
  const [stagedFile, setStagedFile] = useState<StagedFile | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [attachSheetVisible, setAttachSheetVisible] = useState(false);

  const listRef = useRef<FlatList<Row>>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/(auth)/login");
      return;
    }
    if (!conversationId) return;
    if (rooms.length === 0) {
      fetchRooms().then(() => selectRoom(conversationId));
    } else {
      selectRoom(conversationId);
    }
    return () => {
      selectRoom("");
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversationId, isAuthenticated]);

  const room = rooms.find((r) => r.id === conversationId);
  const recipient = room ? getRecipient(room, user?.id) : null;

  const rows = useMemo<Row[]>(() => {
    return messages.map((message, index) => {
      const showDivider =
        index === 0 ||
        new Date(messages[index - 1].created_at).toDateString() !==
          new Date(message.created_at).toDateString();
      return { message, showDivider };
    });
  }, [messages]);

  const invertedRows = useMemo(() => [...rows].reverse(), [rows]);

  const handleLoadMore = useCallback(() => {
    if (conversationId && hasMoreMessages && !isLoadingMessages) {
      fetchMessages(conversationId, true);
    }
  }, [conversationId, hasMoreMessages, isLoadingMessages, fetchMessages]);

  const handlePickImage = async () => {
    setAttachSheetVisible(false);
    try {
      const [picked] = await pickLocalImages(0, 1);
      if (picked) setStagedFile(picked);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handlePickDocument = async () => {
    setAttachSheetVisible(false);
    try {
      const [picked] = await pickLocalDocuments(0, 1);
      if (picked) setStagedFile(picked);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const handleSend = async () => {
    if (!conversationId) return;
    if (!messageInput.trim() && !stagedFile) return;

    let attachmentPayload: { url: string; name: string; type: string } | null =
      null;

    if (stagedFile) {
      setIsUploading(true);
      setUploadProgress(0);
      try {
        const [publicUrl] = await uploadStagedFilesWithProgress(
          [stagedFile],
          "chat-attachments",
          setUploadProgress,
        );
        attachmentPayload = {
          url: publicUrl,
          name: stagedFile.name,
          type: stagedFile.mimeType || "application/octet-stream",
        };
      } catch (err) {
        toast.error(getErrorMessage(err));
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
      setStagedFile(null);
    }

    const text = messageInput.trim() || null;
    setMessageInput("");
    try {
      await sendMessage(text, attachmentPayload);
    } catch (err) {
      toast.error(getErrorMessage(err));
    }
  };

  const isBusy = isSendingMessage || isUploading;

  return (
    <View className="flex-1 bg-white dark:bg-gray-950">
      {/* Header */}
      <View
        style={{ paddingTop: insets.top }}
        className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-950"
      >
        <View className="h-14 flex-row items-center justify-between gap-2 px-3">
          <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
            <Pressable
              hitSlop={8}
              onPress={() => router.back()}
              className="h-9 w-9 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800"
            >
              <Ionicons name="chevron-back" size={22} color="#111827" />
            </Pressable>

            <Avatar uri={recipient?.avatar} name={recipient?.name} size="sm" />

            <View className="min-w-0 flex-1">
              <Text
                numberOfLines={1}
                className="text-sm font-bold text-gray-900 dark:text-gray-100"
              >
                {recipient?.name ?? "Conversation"}
              </Text>
              {recipient ? (
                <Text
                  numberOfLines={1}
                  className="text-[11px] text-gray-500 dark:text-gray-400"
                >
                  @{recipient.username} · {recipient.role}
                </Text>
              ) : null}
            </View>
          </View>

          {room?.order ? (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/order/[id]",
                  params: { id: room.order.id },
                })
              }
              className="shrink-0 rounded-full bg-primary/10 px-3 py-1.5 active:bg-primary/20"
            >
              <Text className="text-xs font-bold text-primary">View Order</Text>
            </Pressable>
          ) : null}
        </View>

        {room?.order ? (
          <View className="flex-row items-center gap-1.5 border-t border-gray-100 px-4 py-1.5 dark:border-gray-900">
            <Text className="rounded bg-primary/10 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
              {room.order.code}
            </Text>
            <Text
              numberOfLines={1}
              className="flex-1 text-[11px] text-gray-500 dark:text-gray-400"
            >
              {room.order.title}
            </Text>
          </View>
        ) : null}
      </View>

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.top + 56}
      >
        {/* Messages */}
        {!room ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            ref={listRef}
            data={invertedRows}
            inverted
            keyExtractor={(row) => row.message.id}
            contentContainerClassName="px-4 py-3 gap-2"
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              isLoadingMessages && hasMoreMessages ? (
                <View className="items-center py-3">
                  <ActivityIndicator size="small" color={COLORS.primary} />
                </View>
              ) : null
            }
            renderItem={({ item }) => (
              <MessageBubble
                message={item.message}
                showDivider={item.showDivider}
                currentUserId={user?.id}
              />
            )}
          />
        )}

        {/* Attachment preview */}
        {stagedFile ? (
          <View className="flex-row items-center justify-between border-t border-gray-100 bg-gray-50 px-4 py-2.5 dark:border-gray-900 dark:bg-gray-900">
            <View className="min-w-0 flex-1 flex-row items-center gap-2.5">
              <Ionicons
                name="document-outline"
                size={20}
                color={COLORS.primary}
              />
              <View className="min-w-0 flex-1">
                <Text
                  numberOfLines={1}
                  className="text-xs font-semibold text-gray-900 dark:text-gray-100"
                >
                  {stagedFile.name}
                </Text>
                {isUploading ? (
                  <Text className="text-[10px] text-gray-500 dark:text-gray-400">
                    Uploading ({uploadProgress}%)
                  </Text>
                ) : null}
              </View>
            </View>
            <Pressable
              hitSlop={8}
              disabled={isUploading}
              onPress={() => setStagedFile(null)}
              className="h-7 w-7 items-center justify-center rounded-full active:bg-gray-200 dark:active:bg-gray-800"
            >
              <Ionicons name="close" size={16} color={COLORS.gray500} />
            </Pressable>
          </View>
        ) : null}

        {/* Composer */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 10) }}
          className="flex-row items-center gap-2 border-t border-gray-100 bg-white px-3 pt-2 dark:border-gray-800 dark:bg-gray-950"
        >
          <Pressable
            disabled={isBusy}
            onPress={() => setAttachSheetVisible(true)}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-gray-100 dark:active:bg-gray-800"
          >
            <Ionicons name="attach-outline" size={22} color={COLORS.gray500} />
          </Pressable>

          <Input
            containerClassName="flex-1"
            placeholder="Type a message..."
            value={messageInput}
            onChangeText={setMessageInput}
            editable={!isBusy}
            multiline
          />

          <Pressable
            disabled={(!messageInput.trim() && !stagedFile) || isBusy}
            onPress={handleSend}
            className={`h-10 w-10 items-center justify-center rounded-full ${
              (!messageInput.trim() && !stagedFile) || isBusy
                ? "bg-primary/40"
                : "bg-primary active:bg-primary-dark"
            }`}
          >
            {isBusy ? (
              <ActivityIndicator
                size="small"
                color={COLORS.primaryForeground}
              />
            ) : (
              <Ionicons
                name="send"
                size={18}
                color={COLORS.primaryForeground}
              />
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>

      <Modal
        visible={attachSheetVisible}
        onClose={() => setAttachSheetVisible(false)}
        title="Add Attachment"
      >
        <View className="gap-2 pb-4">
          <Pressable
            onPress={handlePickImage}
            className="flex-row items-center gap-3 rounded-xl px-3 py-3.5 active:bg-gray-100 dark:active:bg-gray-900"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Ionicons name="image-outline" size={20} color={COLORS.primary} />
            </View>
            <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Photo
            </Text>
          </Pressable>
          <Pressable
            onPress={handlePickDocument}
            className="flex-row items-center gap-3 rounded-xl px-3 py-3.5 active:bg-gray-100 dark:active:bg-gray-900"
          >
            <View className="h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <Ionicons
                name="document-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>
            <Text className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Document
            </Text>
          </Pressable>
        </View>
      </Modal>
    </View>
  );
}

function MessageBubble({
  message,
  showDivider,
  currentUserId,
}: {
  message: ChatMessage;
  showDivider: boolean;
  currentUserId?: string;
}) {
  const senderId =
    typeof message.sender === "string" ? message.sender : message.sender?.id;
  const isOwnMessage =
    !!senderId &&
    !!currentUserId &&
    senderId.toLowerCase() === currentUserId.toLowerCase();
  const senderName =
    typeof message.sender === "string"
      ? "User"
      : message.sender?.name || "User";
  const senderAvatar =
    typeof message.sender === "string" ? undefined : message.sender?.avatar;
  const attachmentIsImage = isImageFile(
    message.attachment_name || "",
    message.attachment_type || undefined,
  );

  return (
    <View className="gap-2">
      {showDivider ? (
        <View className="my-2 items-center">
          <Text className="rounded-full bg-gray-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-gray-900 dark:text-gray-400">
            {formatDateDivider(message.created_at)}
          </Text>
        </View>
      ) : null}

      <View
        className={`flex-row ${isOwnMessage ? "justify-end" : "justify-start"}`}
      >
        <View
          className={`max-w-[80%] flex-row gap-2 ${isOwnMessage ? "flex-row-reverse" : ""}`}
        >
          {!isOwnMessage ? (
            <Avatar
              uri={senderAvatar}
              name={senderName}
              size="sm"
              className="mt-0.5"
            />
          ) : null}

          <View
            className={`gap-1 ${isOwnMessage ? "items-end" : "items-start"}`}
          >
            <View
              className={`rounded-2xl px-3.5 py-2.5 ${
                isOwnMessage
                  ? "rounded-tr-sm bg-primary"
                  : "rounded-tl-sm border border-gray-100 bg-gray-50 dark:border-gray-800 dark:bg-gray-900"
              }`}
            >
              {message.attachment_url ? (
                <Pressable
                  onPress={() => Linking.openURL(message.attachment_url!)}
                  className={message.content ? "mb-2" : ""}
                >
                  {attachmentIsImage ? (
                    <RNImage
                      source={{ uri: message.attachment_url }}
                      style={{ width: 200, height: 150, borderRadius: 10 }}
                      resizeMode="cover"
                    />
                  ) : (
                    <View className="flex-row items-center gap-2.5 rounded-lg bg-white/10 px-3 py-2.5">
                      <Ionicons
                        name="document-outline"
                        size={22}
                        color={
                          isOwnMessage
                            ? COLORS.primaryForeground
                            : COLORS.primary
                        }
                      />
                      <Text
                        numberOfLines={1}
                        className={`max-w-[140px] text-xs font-semibold ${
                          isOwnMessage
                            ? "text-primary-foreground"
                            : "text-gray-900 dark:text-gray-100"
                        }`}
                      >
                        {message.attachment_name || "Attachment"}
                      </Text>
                      <Ionicons
                        name="download-outline"
                        size={16}
                        color={
                          isOwnMessage
                            ? COLORS.primaryForeground
                            : COLORS.gray500
                        }
                      />
                    </View>
                  )}
                </Pressable>
              ) : null}

              {message.content ? (
                <Text
                  className={`text-sm leading-5 ${isOwnMessage ? "text-primary-foreground" : "text-gray-900 dark:text-gray-100"}`}
                >
                  {message.content}
                </Text>
              ) : null}
            </View>

            <Text className="px-1 text-[10px] text-gray-400 dark:text-gray-500">
              {formatTime(message.created_at)}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}
