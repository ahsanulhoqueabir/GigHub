import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { throwOnError } from '@/utils/service-error.util';
import type { JwtPayload } from '@/types/auth.types';
import { EscrowService } from './escrow.service';
import { HoldEscrowDto } from './dto/hold-escrow.dto';
import { EscrowActionDto } from './dto/escrow-action.dto';

@Controller('escrow')
export class EscrowController {
  constructor(private readonly escrowService: EscrowService) {}

  @Get(':orderId')
  async detail(@Param('orderId') orderId: string) {
    const result = await this.escrowService.detail(orderId);
    throwOnError(result);
    return result;
  }

  @Post('hold')
  async hold(@CurrentUser() user: JwtPayload, @Body() dto: HoldEscrowDto) {
    const result = await this.escrowService.hold(dto.order_id, dto.auto_release_at);
    throwOnError(result);
    return result;
  }

  @Post('release')
  async release(@CurrentUser() user: JwtPayload, @Body() dto: EscrowActionDto) {
    const result = await this.escrowService.release(dto.order_id);
    throwOnError(result);
    return result;
  }

  @Post('refund')
  async refund(@CurrentUser() user: JwtPayload, @Body() dto: EscrowActionDto) {
    const result = await this.escrowService.refund(dto.order_id);
    throwOnError(result);
    return result;
  }
}
