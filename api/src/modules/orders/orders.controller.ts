import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '@/types/auth.types';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateOrderDto) {
    const res = await this.ordersService.create(user.profile_id, dto);
    if (!res.success) throw new InternalServerErrorException(res.error);
    return res;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateOrderDto,
  ) {
    const res = await this.ordersService.update(id, user.profile_id, dto);
    if (!res.success) {
      if (res.status === 400) throw new BadRequestException(res.error);
      if (res.status === 403) throw new ForbiddenException(res.error);
      if (res.status === 404) throw new NotFoundException(res.error);
      throw new InternalServerErrorException(res.error);
    }
    return res;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const res = await this.ordersService.listByUser(user.profile_id, Number(page), Number(limit));
    if (!res.success) throw new InternalServerErrorException(res.error);
    return res;
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const res = await this.ordersService.getById(id);
    if (!res.success) throw new NotFoundException(res.error);
    return res;
  }
}
