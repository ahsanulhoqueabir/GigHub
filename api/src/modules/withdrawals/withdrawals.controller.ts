import {
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '@/types/auth.types';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWithdrawalDto) {
    const result = await this.withdrawalsService.create(user.profile_id, dto);
    if (!result.success) {
      if (result.status === 400) throw new BadRequestException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.withdrawalsService.listByUser(
      user.profile_id,
      Number(page),
      Number(limit),
    );
    if (!result.success) throw new InternalServerErrorException(result.error);
    return result;
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const result = await this.withdrawalsService.getById(id);
    if (!result.success) {
      if (result.status === 404) throw new NotFoundException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.withdrawalsService.cancel(id, user.profile_id);
    if (!result.success) {
      if (result.status === 403) throw new BadRequestException(result.error);
      if (result.status === 404) throw new NotFoundException(result.error);
      if (result.status === 400) throw new BadRequestException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }
}
