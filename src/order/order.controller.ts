import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { OrderService } from './order.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
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

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createOrderDto: CreateOrderDto,
  ) {
    const result = await this.orderService.create(user.id, createOrderDto);
    return createSuccessResponse(result, 'Order placed successfully');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: AuthenticatedUser) {
    const result = await this.orderService.findAll(user.id);
    return createSuccessResponse(result, 'Orders retrieved successfully');
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const result = await this.orderService.findOne(user.id, id);
    return createSuccessResponse(
      result,
      'Order details retrieved successfully',
    );
  }

  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  async updateStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateOrderStatusDto: UpdateOrderStatusDto,
  ) {
    const result = await this.orderService.updateStatus(
      user.id,
      id,
      updateOrderStatusDto,
    );
    return createSuccessResponse(result, 'Order status updated successfully');
  }
}
