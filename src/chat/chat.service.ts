import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { FirebaseService } from '../firebase/firebase.service';
import { SendMessageDto } from './dto/send-message.dto';
import {
  PopulatedChatMessage,
  PopulatedChatRoom,
  PublicProfile,
} from '../types';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly db: DatabaseService,
    private readonly firebaseService: FirebaseService,
  ) {}

  /**
   * Fetches or automatically initializes a chat room for a specific order.
   * Only the buyer or the seller of that order is authorized to call this.
   */
  async getOrCreateRoomForOrder(
    userId: string,
    orderId: string,
  ): Promise<PopulatedChatRoom> {
    this.logger.log(`Get or create chat room for order: ${orderId} by user: ${userId}`);

    // 1. Fetch order details
    const { data: order, error: orderError } = await this.db.client
      .from('order')
      .select('id, status, code, title, total_price, deadline, source, buyer, seller')
      .eq('id', orderId)
      .maybeSingle();

    if (orderError || !order) {
      throw new NotFoundException('Order not found');
    }

    // 2. Authorize: user must be buyer or seller of the order
    if (order.buyer !== userId && order.seller !== userId) {
      throw new ForbiddenException(
        'You are not authorized to access this order chat',
      );
    }

    // 3. Check if room exists
    const { data: room, error: roomError } = await this.db.client
      .from('chat_room')
      .select('id, order, buyer, seller, created_at, updated_at')
      .eq('"order"', orderId)
      .maybeSingle();

    if (roomError) {
      throw new BadRequestException(`Failed to lookup chat room: ${roomError.message}`);
    }

    let roomId = room?.id;

    if (!room) {
      this.logger.log(`Chat room for order ${orderId} doesn't exist. Creating new room...`);
      // 4. Create new chat room
      const { data: newRoom, error: createError } = await this.db.client
        .from('chat_room')
        .insert({
          order: orderId,
          buyer: order.buyer,
          seller: order.seller,
        })
        .select('id')
        .single();

      if (createError || !newRoom) {
        throw new BadRequestException(
          `Failed to create chat room: ${createError?.message}`,
        );
      }
      roomId = newRoom.id;
    }

    // 5. Fetch fully populated room details
    return this.findRoomDetails(userId, roomId);
  }

  /**
   * Fetches detailed information for a single chat room.
   */
  async findRoomDetails(
    userId: string,
    roomId: string,
  ): Promise<PopulatedChatRoom> {
    const { data: room, error } = await this.db.client
      .from('chat_room')
      .select(`
        id, order, buyer, seller, created_at, updated_at,
        order:order(id, status, code, title, total_price, deadline, source),
        buyer:profile!buyer(id, name, username, email, avatar, verified),
        seller:profile!seller(id, name, username, email, avatar, verified)
      `)
      .eq('id', roomId)
      .maybeSingle();

    if (error || !room) {
      throw new NotFoundException('Chat room not found');
    }

    const rawRoom = room as any;
    const buyerProfile = Array.isArray(rawRoom.buyer) ? rawRoom.buyer[0] : rawRoom.buyer;
    const sellerProfile = Array.isArray(rawRoom.seller) ? rawRoom.seller[0] : rawRoom.seller;
    const buyerId = buyerProfile?.id;
    const sellerId = sellerProfile?.id;

    // Verify participation
    if (buyerId !== userId && sellerId !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view this chat room',
      );
    }

    // Fetch last message
    const { data: lastMessage } = await this.db.client
      .from('chat_message')
      .select('*')
      .eq('room', roomId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    return {
      id: rawRoom.id,
      created_at: rawRoom.created_at,
      updated_at: rawRoom.updated_at,
      order: Array.isArray(rawRoom.order) ? rawRoom.order[0] : rawRoom.order,
      buyer: buyerProfile,
      seller: sellerProfile,
      lastMessage: lastMessage || null,
    } as PopulatedChatRoom;
  }

  /**
   * Retrieves all chat rooms/conversations the user is part of.
   */
  async findAllRooms(userId: string): Promise<PopulatedChatRoom[]> {
    const { data: rooms, error } = await this.db.client
      .from('chat_room')
      .select(`
        id, order, buyer, seller, created_at, updated_at,
        order:order(id, status, code, title, total_price, deadline, source),
        buyer:profile!buyer(id, name, username, email, avatar, verified),
        seller:profile!seller(id, name, username, email, avatar, verified)
      `)
      .or(`buyer.eq.${userId},seller.eq.${userId}`)
      .order('updated_at', { ascending: false });

    if (error) {
      throw new BadRequestException(
        `Failed to retrieve chat rooms: ${error.message}`,
      );
    }

    if (!rooms || rooms.length === 0) {
      return [];
    }

    // Map each room to include its last message
    const populatedRooms = await Promise.all(
      rooms.map(async (room) => {
        const { data: lastMessage } = await this.db.client
          .from('chat_message')
          .select('*')
          .eq('room', room.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        const rawRoom = room as any;
        return {
          id: rawRoom.id,
          created_at: rawRoom.created_at,
          updated_at: rawRoom.updated_at,
          order: Array.isArray(rawRoom.order) ? rawRoom.order[0] : rawRoom.order,
          buyer: Array.isArray(rawRoom.buyer) ? rawRoom.buyer[0] : rawRoom.buyer,
          seller: Array.isArray(rawRoom.seller) ? rawRoom.seller[0] : rawRoom.seller,
          lastMessage: lastMessage || null,
        } as PopulatedChatRoom;
      }),
    );

    return populatedRooms;
  }

  /**
   * Sends a message in a specific chat room.
   */
  async sendMessage(
    senderId: string,
    roomId: string,
    dto: SendMessageDto,
  ): Promise<PopulatedChatMessage> {
    // 1. Fetch room details to verify participation
    const { data: room, error: roomError } = await this.db.client
      .from('chat_room')
      .select('id, buyer, seller, order')
      .eq('id', roomId)
      .maybeSingle();

    if (roomError || !room) {
      throw new NotFoundException('Chat room not found');
    }

    if (room.buyer !== senderId && room.seller !== senderId) {
      throw new ForbiddenException(
        'You are not authorized to send messages in this chat room',
      );
    }

    if (!dto.content && !dto.attachment_url) {
      throw new BadRequestException(
        'Message content or attachment is required',
      );
    }

    // 2. Insert message
    const insertData = {
      room: roomId,
      sender: senderId,
      content: dto.content || null,
      attachment_url: dto.attachment_url || null,
      attachment_name: dto.attachment_name || null,
      attachment_type: dto.attachment_type || null,
    };

    const { data: message, error: insertError } = await this.db.client
      .from('chat_message')
      .insert(insertData)
      .select('*')
      .single();

    if (insertError || !message) {
      throw new BadRequestException(
        `Failed to send message: ${insertError?.message}`,
      );
    }

    // 3. Update chat room updated_at timestamp to bubble it up
    await this.db.client
      .from('chat_room')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', roomId);

    // 4. Fetch sender profile
    const { data: sender } = await this.db.client
      .from('profile')
      .select('id, name, username, email, avatar, verified')
      .eq('id', senderId)
      .single();

    const populatedMessage: PopulatedChatMessage = {
      id: message.id,
      room: message.room,
      content: message.content,
      attachment_url: message.attachment_url,
      attachment_name: message.attachment_name,
      attachment_type: message.attachment_type,
      created_at: message.created_at,
      sender: sender as PublicProfile,
    };

    // 5. Send FCM push notification asynchronously to the recipient
    const recipientId = senderId === room.buyer ? room.seller : room.buyer;
    this.sendNotificationToRecipient(
      senderId,
      recipientId,
      room.order,
      dto.content,
      dto.attachment_name,
    ).catch((err) =>
      this.logger.error(`FCM notification dispatch failed: ${err.message}`),
    );

    return populatedMessage;
  }

  /**
   * Fetches messages in a room with optional cursor pagination.
   */
  async findRoomMessages(
    userId: string,
    roomId: string,
    limit: number = 50,
    before?: string,
  ): Promise<PopulatedChatMessage[]> {
    // 1. Verify room membership
    const { data: room, error: roomError } = await this.db.client
      .from('chat_room')
      .select('id, buyer, seller')
      .eq('id', roomId)
      .maybeSingle();

    if (roomError || !room) {
      throw new NotFoundException('Chat room not found');
    }

    if (room.buyer !== userId && room.seller !== userId) {
      throw new ForbiddenException(
        'You are not authorized to view messages in this chat room',
      );
    }

    // 2. Query messages
    let query = this.db.client
      .from('chat_message')
      .select(`
        id, room, sender, content, attachment_url, attachment_name, attachment_type, created_at,
        sender:profile!sender(id, name, username, email, avatar, verified)
      `)
      .eq('room', roomId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (before) {
      query = query.lt('created_at', before);
    }

    const { data: messages, error: messagesError } = await query;

    if (messagesError) {
      throw new BadRequestException(
        `Failed to retrieve messages: ${messagesError.message}`,
      );
    }

    // Return messages in chronological order (oldest first for chat thread UI layout)
    const populatedMessages = ((messages || []) as any[]).map((msg) => ({
      id: msg.id,
      room: msg.room,
      content: msg.content,
      attachment_url: msg.attachment_url,
      attachment_name: msg.attachment_name,
      attachment_type: msg.attachment_type,
      created_at: msg.created_at,
      sender: Array.isArray(msg.sender) ? msg.sender[0] : msg.sender,
    }));

    return populatedMessages.reverse();
  }

  /**
   * Sends push notification to the recipient of the chat message.
   */
  private async sendNotificationToRecipient(
    senderId: string,
    recipientId: string,
    orderId: string,
    content?: string,
    attachmentName?: string,
  ) {
    // Fetch sender profile
    const { data: sender } = await this.db.client
      .from('profile')
      .select('name')
      .eq('id', senderId)
      .maybeSingle();

    const senderName = sender?.name || 'Someone';

    // Fetch recipient profile & FCM token
    const { data: recipient } = await this.db.client
      .from('profile')
      .select('fcm_token')
      .eq('id', recipientId)
      .maybeSingle();

    if (!recipient?.fcm_token) {
      this.logger.log(
        `No FCM token found for recipient ${recipientId}. Skipping push notification.`,
      );
      return;
    }

    let body = '';
    if (content) {
      body = content.length > 100 ? `${content.substring(0, 100)}...` : content;
    } else if (attachmentName) {
      body = `Sent a file: ${attachmentName}`;
    } else {
      body = 'Sent a file';
    }

    await this.firebaseService.sendPushNotification(
      recipient.fcm_token,
      `New message from ${senderName}`,
      body,
      {
        orderId,
        click_action: 'FLUTTER_NOTIFICATION_CLICK',
      },
    );
  }
}
