"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { sanitizeFilename } from "@/lib/shared/regex.utils";
import { useAuthStore } from "@/store/auth.store";
import { useChatStore } from "@/store/chat.store";
import { useFileUploadStore } from "@/store/file-upload.store";
import {
  IconArrowLeft,
  IconDownload,
  IconFile,
  IconFileZip,
  IconLoader2,
  IconMessageCircle,
  IconPaperclip,
  IconSend,
  IconX,
} from "@tabler/icons-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState, useTransition } from "react";
import { toast } from "sonner";

function ChatPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderIdParam = searchParams.get("orderId");
  const roomIdParam = searchParams.get("roomId");

  const { user, accessToken, hasHydrated } = useAuthStore();
  const {
    rooms,
    messages,
    activeRoomId,
    isLoadingRooms,
    isLoadingMessages,
    isSendingMessage,
    hasMoreMessages,
    fetchRooms,
    selectRoom,
    fetchMessages,
    sendMessage,
    reset: resetChatStore,
  } = useChatStore();

  const uploadFiles = useFileUploadStore((s) => s.uploadFiles);
  const uploadingFiles = useFileUploadStore((s) => s.uploadingFiles);

  const [searchQuery, setSearchQuery] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);

  const [, startTransition] = useTransition();

  // Redirect if not authenticated
  useEffect(() => {
    if (hasHydrated && !accessToken) {
      router.replace("/login");
    }
  }, [accessToken, hasHydrated, router]);

  // Initial load
  useEffect(() => {
    if (!accessToken) return;
    fetchRooms();
    return () => {
      resetChatStore();
    };
  }, [accessToken, fetchRooms, resetChatStore]);

  // Handle URL parameters (orderId or roomId) to auto-select room
  useEffect(() => {
    if (isLoadingRooms || rooms.length === 0) return;

    if (roomIdParam) {
      const room = rooms.find((r) => r.id === roomIdParam);
      if (room && room.id !== activeRoomId) {
        startTransition(() => {
          selectRoom(room.id);
        });
      }
    } else if (orderIdParam) {
      const room = rooms.find((r) => r.order?.id === orderIdParam);
      if (room && room.id !== activeRoomId) {
        startTransition(() => {
          selectRoom(room.id);
        });
      } else if (!room) {
        toast.error("No active chat room found for this order");
      }
    }
  }, [
    orderIdParam,
    roomIdParam,
    rooms,
    isLoadingRooms,
    activeRoomId,
    selectRoom,
  ]);

  // Handle scroll to load more (cursor pagination)
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    // Trigger load more if scroll is near top
    if (
      container.scrollTop < 20 &&
      hasMoreMessages &&
      !isLoadingMessages &&
      activeRoomId
    ) {
      setPrevScrollHeight(container.scrollHeight);
      fetchMessages(activeRoomId, true);
    }
  };

  // Adjust scroll position after loading older messages
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container && prevScrollHeight !== null) {
      const newScrollHeight = container.scrollHeight;
      container.scrollTop = newScrollHeight - prevScrollHeight;
      setPrevScrollHeight(null);
    }
  }, [messages.length, prevScrollHeight]);

  // Scroll to bottom on new messages
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      250;
    if (isNearBottom || prevScrollHeight === null) {
      container.scrollTop = container.scrollHeight;
    }
  }, [messages, prevScrollHeight]);

  const activeRoom = rooms.find((r) => r.id === activeRoomId);

  // Determine the recipient details
  const getRecipient = (room: (typeof rooms)[0]) => {
    if (room.buyer.id === user?.id) {
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
  };

  // Filtered rooms search
  const filteredRooms = rooms.filter((room) => {
    const recipient = getRecipient(room);
    return (
      recipient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.order?.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.order?.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  // Handle File Selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 25 * 1024 * 1024) {
        toast.error("File size exceeds the 25MB limit");
        return;
      }
      setSelectedFile(file);
    }
  };

  // Track upload progress for the selected file
  const activeUpload = selectedFile
    ? uploadingFiles.find(
        (uf) => uf.file.name === selectedFile.name && !uf.error,
      )
    : null;

  // Handle Send Message
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeRoomId) return;
    if (!messageInput.trim() && !selectedFile) return;

    let attachmentPayload = null;

    if (selectedFile) {
      setIsUploading(true);
      try {
        const publicUrls = await uploadFiles(
          [selectedFile],
          "chat-attachments",
        );
        if (publicUrls && publicUrls.length > 0) {
          attachmentPayload = {
            url: publicUrls[0],
            name: sanitizeFilename(selectedFile.name),
            type: selectedFile.type || "application/octet-stream",
          };
        }
      } catch {
        toast.error("Failed to upload attachment to storage");
        setIsUploading(false);
        return;
      }
      setIsUploading(false);
      setSelectedFile(null);
    }

    try {
      const text = messageInput.trim() || null;
      setMessageInput("");
      await sendMessage(text, attachmentPayload);
    } catch {
      toast.error("Failed to send message");
    }
  };

  // Format message time
  const formatTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Format message date divider
  const formatDateDivider = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleDateString([], {
      weekday: "long",
      month: "short",
      day: "numeric",
    });
  };

  const isImageFile = (type: string | null) => {
    if (!type) return false;
    return type.startsWith("image/");
  };

  const getFileIcon = (type: string | null) => {
    if (!type) return <IconFile className="size-8" />;
    if (type.includes("zip") || type.includes("rar") || type.includes("tar")) {
      return <IconFileZip className="size-8 text-amber-500" />;
    }
    return <IconFile className="size-8 text-primary" />;
  };

  if (!hasHydrated || !accessToken) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="w-full h-full md:h-[calc(100dvh-7rem)] md:max-w-7xl md:mx-auto flex flex-col md:flex-row border-0 md:border md:rounded-2xl overflow-hidden bg-background md:shadow-lg md:mt-2">
      <style>{`
        @media (max-width: 767px) {
          footer {
            display: none !important;
          }
          html, body {
            overflow: hidden !important;
            height: 100dvh !important;
            max-height: 100dvh !important;
          }
          main {
            overflow: hidden !important;
            height: calc(100dvh - 3.5rem) !important;
            max-height: calc(100dvh - 3.5rem) !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
      {/* ── LEFT PANEL: ROOMS LIST ── */}
      <div
        className={`w-full md:w-80 border-r flex flex-col shrink-0 bg-muted/20 h-full min-h-0 min-w-0 ${
          activeRoomId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="p-4 border-b flex flex-col gap-3">
          <h1 className="text-xl font-bold tracking-tight">Messages</h1>
          <Input
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-background"
          />
        </div>

        <div className="flex-1 overflow-y-auto min-h-0 w-full">
          {isLoadingRooms ? (
            <div className="p-4 space-y-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-11 rounded-full shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-28" />
                    <Skeleton className="h-3 w-40" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredRooms.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-muted-foreground text-sm">
              <IconMessageCircle className="size-8 mb-2 stroke-1" />
              <span>No conversations found</span>
            </div>
          ) : (
            <div className="divide-y divide-border/60 w-full min-w-0">
              {filteredRooms.map((room) => {
                const recipient = getRecipient(room);
                const isSelected = room.id === activeRoomId;
                const latestMsg = room.latest_message;

                return (
                  <button
                    key={room.id}
                    onClick={() => selectRoom(room.id)}
                    className={`w-full flex items-center gap-3 p-3.5 text-left transition-all duration-150 border-l-2 cursor-pointer min-w-0 ${
                      isSelected
                        ? "bg-accent/20 border-primary"
                        : "hover:bg-accent/20 border-transparent"
                    }`}
                  >
                    <Avatar className="size-11 shrink-0 ring-2 ring-background shadow-sm">
                      <AvatarImage
                        src={recipient.avatar || undefined}
                        alt={recipient.name}
                      />
                      <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                        {recipient.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between mb-1 min-w-0">
                        <span className="font-bold text-sm truncate text-foreground flex-1 pr-2 min-w-0">
                          {room.order?.title || room.title}
                        </span>
                        {latestMsg && (
                          <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                            {formatTime(latestMsg.created_at)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between gap-1.5 mb-1.5 min-w-0">
                        <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded uppercase tracking-wider shrink-0">
                          {room.order?.code}
                        </span>
                        <span className="text-[11px] text-muted-foreground truncate flex-1 text-right min-w-0">
                          with {recipient.name}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground truncate">
                        {latestMsg
                          ? latestMsg.content || "Sent an attachment"
                          : "No messages yet"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT PANEL: CONVERSATION ── */}
      <div
        className={`flex-1 flex flex-col min-h-0 min-w-0 ${!activeRoomId ? "hidden md:flex" : "flex"}`}
      >
        {activeRoom ? (
          <>
            {/* Conversation Header */}
            <div className="h-16 px-4 border-b flex items-center justify-between bg-background z-10 shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => selectRoom("")}
                  className="md:hidden size-8 mr-1 cursor-pointer"
                >
                  <IconArrowLeft className="size-5" />
                </Button>

                <Avatar className="size-10 shrink-0 shadow-sm">
                  <AvatarImage
                    src={getRecipient(activeRoom).avatar || undefined}
                    alt={getRecipient(activeRoom).name}
                  />
                  <AvatarFallback className="font-semibold bg-primary/10 text-primary">
                    {getRecipient(activeRoom).name.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>

                <div className="min-w-0">
                  <h2 className="font-semibold text-sm truncate">
                    {getRecipient(activeRoom).name}
                  </h2>
                  <p className="text-xs text-muted-foreground truncate">
                    @{getRecipient(activeRoom).username} •{" "}
                    {getRecipient(activeRoom).role}
                  </p>
                </div>
              </div>
            </div>

            {/* Room Title / Order context Sub-header */}
            <div className="bg-card border-b px-4 py-2 flex items-center justify-between gap-3 text-xs shrink-0 shadow-sm">
              <div className="min-w-0 flex-1 flex items-center gap-2">
                <span className="flex items-center justify-center size-5 rounded-full bg-primary/10 text-primary shrink-0">
                  <IconMessageCircle className="size-3" />
                </span>
                <div className="min-w-0 flex-1">
                  <h3
                    className="font-medium text-foreground text-xs leading-tight wrap-break-word"
                    title={activeRoom.order?.title || activeRoom.title}
                  >
                    {activeRoom.order?.title || activeRoom.title}
                  </h3>
                  {activeRoom.order && (
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[9px] px-1.5 py-0.5 bg-primary/10 text-primary font-bold rounded uppercase tracking-wider shrink-0">
                        {activeRoom.order.code}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        Order Chat
                      </span>
                    </div>
                  )}
                </div>
              </div>
              {activeRoom.order && (
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-7 px-3 text-xs font-bold shrink-0 text-primary bg-primary/10 hover:bg-primary/20 rounded-full transition-all"
                >
                  <Link href={`/profile/orders/${activeRoom.order.id}`}>
                    View Order
                  </Link>
                </Button>
              )}
            </div>

            {/* Messages scroll area */}
            <div
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/5 min-h-0"
            >
              {isLoadingMessages && hasMoreMessages && (
                <div className="flex justify-center p-2">
                  <IconLoader2 className="size-5 animate-spin text-primary" />
                </div>
              )}

              {messages.map((message, index) => {
                const senderId =
                  typeof message.sender === "string"
                    ? message.sender
                    : message.sender?.id;
                const isOwnMessage =
                  senderId && user?.id
                    ? senderId.toLowerCase() === user.id.toLowerCase()
                    : false;

                const messageSenderName =
                  typeof message.sender === "string"
                    ? "User"
                    : message.sender?.name || "User";

                // Show date divider if first message or date changed
                const showDateDivider =
                  index === 0 ||
                  new Date(messages[index - 1].created_at).toDateString() !==
                    new Date(message.created_at).toDateString();

                return (
                  <div key={message.id} className="space-y-2">
                    {showDateDivider && (
                      <div className="flex justify-center my-4">
                        <span className="text-[10px] bg-muted px-2 py-0.5 rounded-full text-muted-foreground font-semibold uppercase tracking-wider">
                          {formatDateDivider(message.created_at)}
                        </span>
                      </div>
                    )}

                    <div
                      className={`w-full flex ${isOwnMessage ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`flex gap-3 max-w-[80%] md:max-w-[70%] ${isOwnMessage ? "flex-row-reverse" : ""}`}
                      >
                        {!isOwnMessage && (
                          <Avatar className="size-8 mt-0.5 shrink-0 shadow-sm">
                            <AvatarImage
                              src={
                                typeof message.sender === "string"
                                  ? undefined
                                  : message.sender?.avatar || undefined
                              }
                              alt={messageSenderName}
                            />
                            <AvatarFallback className="text-[10px] font-bold bg-primary/10 text-primary">
                              {messageSenderName.slice(0, 2).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                        )}

                        <div
                          className={`space-y-1 min-w-0 flex flex-col ${isOwnMessage ? "items-end" : "items-start"}`}
                        >
                          <div
                            className={`rounded-2xl px-3.5 py-2.5 text-sm shadow-sm ${
                              isOwnMessage
                                ? "bg-primary text-primary-foreground rounded-tr-none"
                                : "bg-card border text-card-foreground rounded-tl-none"
                            }`}
                          >
                            {/* Attachment file presentation */}
                            {message.attachment_url && (
                              <div className="mb-2 max-w-sm">
                                {isImageFile(message.attachment_type) ? (
                                  <a
                                    href={message.attachment_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block overflow-hidden rounded-lg border bg-muted/10 cursor-pointer"
                                  >
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={message.attachment_url}
                                      alt={
                                        message.attachment_name || "Attachment"
                                      }
                                      className="max-h-60 object-contain hover:scale-[1.02] transition-transform duration-150"
                                    />
                                  </a>
                                ) : (
                                  <div className="flex items-center gap-3 p-3 bg-muted/40 rounded-lg border">
                                    {getFileIcon(message.attachment_type)}
                                    <div className="min-w-0 flex-1">
                                      <p
                                        className="font-semibold text-xs truncate max-w-35 sm:max-w-50 md:max-w-60"
                                        title={message.attachment_name || ""}
                                      >
                                        {message.attachment_name}
                                      </p>
                                      <p className="text-[10px] text-muted-foreground uppercase">
                                        {message.attachment_type?.split(
                                          "/",
                                        )[1] || "file"}
                                      </p>
                                    </div>
                                    <Button
                                      asChild
                                      variant="ghost"
                                      size="icon"
                                      className="size-8 shrink-0 cursor-pointer"
                                    >
                                      <a
                                        href={message.attachment_url}
                                        download={message.attachment_name || ""}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                      >
                                        <IconDownload className="size-4" />
                                      </a>
                                    </Button>
                                  </div>
                                )}
                              </div>
                            )}

                            {message.content && (
                              <p className="leading-relaxed wrap-break-word whitespace-pre-line">
                                {message.content}
                              </p>
                            )}
                          </div>

                          <p className="text-[10px] text-muted-foreground px-1">
                            {formatTime(message.created_at)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Attachment preview bar */}
            <AnimatePresence>
              {selectedFile && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="px-4 py-2 border-t bg-muted/15 flex items-center justify-between shrink-0"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <IconFile className="size-6 text-primary shrink-0" />
                    <div className="min-w-0 text-xs">
                      <p className="font-semibold truncate text-foreground">
                        {selectedFile.name}
                      </p>
                      <p className="text-muted-foreground">
                        {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isUploading && activeUpload && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <IconLoader2 className="size-3 animate-spin text-primary" />
                        <span>Uploading ({activeUpload.progress}%)</span>
                      </div>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedFile(null)}
                      disabled={isUploading}
                      className="size-8 rounded-full cursor-pointer"
                    >
                      <IconX className="size-4" />
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Footer Form */}
            <form
              onSubmit={handleSend}
              className="p-3 border-t bg-background flex items-center gap-2 shrink-0 z-10"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
              />

              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => fileInputRef.current?.click()}
                disabled={isSendingMessage || isUploading}
                className="size-10 rounded-full cursor-pointer hover:bg-muted"
              >
                <IconPaperclip className="size-5" />
              </Button>

              <Input
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={isSendingMessage || isUploading}
                className="flex-1 bg-muted/40 border-none shadow-none rounded-full px-4 h-10 focus-visible:ring-1 focus-visible:ring-primary/45"
              />

              <Button
                type="submit"
                disabled={
                  (!messageInput.trim() && !selectedFile) ||
                  isSendingMessage ||
                  isUploading
                }
                className="size-10 rounded-full cursor-pointer shadow-sm flex items-center justify-center shrink-0"
              >
                {isSendingMessage || isUploading ? (
                  <IconLoader2 className="size-5 animate-spin" />
                ) : (
                  <IconSend className="size-5" />
                )}
              </Button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-muted-foreground text-center">
            <div className="size-16 rounded-full bg-muted/40 flex items-center justify-center mb-4">
              <IconMessageCircle className="size-8 stroke-1 text-primary" />
            </div>
            <h3 className="font-bold text-lg text-foreground mb-1">
              Your Inbox
            </h3>
            <p className="text-sm max-w-xs text-muted-foreground">
              Select a conversation from the sidebar to check details and chat
              with buyers/sellers in real-time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function ChatPageSkeleton() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[60vh]">
      <div className="size-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatPageSkeleton />}>
      <ChatPageContent />
    </Suspense>
  );
}
