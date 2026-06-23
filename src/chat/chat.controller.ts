import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { SendMessageDto } from './dto/send-message.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createSuccessResponse } from '../common/utils/response.util';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  active: boolean;
  verified: boolean;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('rooms')
  @HttpCode(HttpStatus.OK)
  async findAllRooms(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.chatService.findAllRooms(user.id);
    return createSuccessResponse(result, 'Conversations retrieved successfully');
  }

  @Get('order/:orderId')
  @HttpCode(HttpStatus.OK)
  async getOrCreateRoom(
    @CurrentUser() user: AuthenticatedUser,
    @Param('orderId') orderId: string,
  ) {
    const result = await this.chatService.getOrCreateRoomForOrder(user.id, orderId);
    return createSuccessResponse(result, 'Chat room initialized successfully');
  }

  @Get('rooms/:roomId')
  @HttpCode(HttpStatus.OK)
  async findRoomDetails(
    @CurrentUser() user: AuthenticatedUser,
    @Param('roomId') roomId: string,
  ) {
    const result = await this.chatService.findRoomDetails(user.id, roomId);
    return createSuccessResponse(result, 'Chat room details retrieved successfully');
  }

  @Post('rooms/:roomId/messages')
  @HttpCode(HttpStatus.CREATED)
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Param('roomId') roomId: string,
    @Body() dto: SendMessageDto,
  ) {
    const result = await this.chatService.sendMessage(user.id, roomId, dto);
    return createSuccessResponse(result, 'Message sent successfully');
  }

  @Get('rooms/:roomId/messages')
  @HttpCode(HttpStatus.OK)
  async findRoomMessages(
    @CurrentUser() user: AuthenticatedUser,
    @Param('roomId') roomId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    const parsedLimit = limit ? parseInt(limit, 10) : 50;
    const result = await this.chatService.findRoomMessages(
      user.id,
      roomId,
      parsedLimit,
      before,
    );
    return createSuccessResponse(result, 'Messages retrieved successfully');
  }
}
