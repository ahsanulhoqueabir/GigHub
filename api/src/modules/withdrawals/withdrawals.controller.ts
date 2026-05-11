import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { throwOnError } from '@/utils/service-error.util';
import type { JwtPayload } from '@/types/auth.types';
import { WithdrawalsService } from './withdrawals.service';
import { CreateWithdrawalDto } from './dto/create-withdrawal.dto';

@Controller('withdrawals')
export class WithdrawalsController {
  constructor(private readonly withdrawalsService: WithdrawalsService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateWithdrawalDto) {
    const result = await this.withdrawalsService.create(user.profile_id, dto);
    throwOnError(result);
    return result;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.withdrawalsService.listByUser(
      user.profile_id,
      Number(page),
      Number(limit),
    );
    throwOnError(result);
    return result;
  }

  @Get(':id')
  async detail(@Param('id') id: string) {
    const result = await this.withdrawalsService.getById(id);
    throwOnError(result);
    return result;
  }

  @Delete(':id')
  async cancel(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.withdrawalsService.cancel(id, user.profile_id);
    throwOnError(result);
    return result;
  }
}
