import {
  Body,
  Controller,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
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
    if (!result.success) {
      if (result.status === 404) throw new NotFoundException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Post('hold')
  async hold(@CurrentUser() user: JwtPayload, @Body() dto: HoldEscrowDto) {
    const result = await this.escrowService.hold(dto.order_id, dto.auto_release_at);
    if (!result.success) {
      if (result.status === 400) throw new InternalServerErrorException(result.error);
      if (result.status === 404) throw new NotFoundException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Post('release')
  async release(@CurrentUser() user: JwtPayload, @Body() dto: EscrowActionDto) {
    const result = await this.escrowService.release(dto.order_id);
    if (!result.success) {
      if (result.status === 400) throw new InternalServerErrorException(result.error);
      if (result.status === 404) throw new NotFoundException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Post('refund')
  async refund(@CurrentUser() user: JwtPayload, @Body() dto: EscrowActionDto) {
    const result = await this.escrowService.refund(dto.order_id);
    if (!result.success) {
      if (result.status === 404) throw new NotFoundException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }
}
