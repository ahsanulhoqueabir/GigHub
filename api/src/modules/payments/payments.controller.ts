import { Body, Controller, Get, InternalServerErrorException, Post, Query } from '@nestjs/common';
import { Public } from '@/common/decorators/public.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '@/types/auth.types';
import { PaymentQueryType } from '@/types/payment.types';
import { PaymentsService } from './payments.service';
import { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentQueryDto } from './dto/payment-query.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('initiate')
  async initiate(@CurrentUser() user: JwtPayload, @Body() dto: InitiatePaymentDto) {
    const result = await this.paymentsService.initiate(user.profile_id, dto);
    if (!result.success) throw new InternalServerErrorException(result.error);
    return result;
  }

  @Public()
  @Post('sslcommerz/success')
  async success(@Body() body: { tran_id: string; order_id: string }) {
    return this.paymentsService.success(body);
  }

  @Public()
  @Post('sslcommerz/fail')
  async fail(@Body() body: { tran_id: string; order_id: string }) {
    return this.paymentsService.fail(body);
  }

  @Public()
  @Post('sslcommerz/cancel')
  async cancel(@Body() body: { tran_id: string; order_id: string }) {
    return this.paymentsService.cancel(body);
  }

  @Public()
  @Post('sslcommerz/ipn')
  async ipn(@Body() body: { tran_id: string; order_id: string }) {
    return this.paymentsService.ipn(body);
  }

  @Get()
  async query(@CurrentUser() user: JwtPayload, @Query() query: PaymentQueryDto) {
    const type = query.type ?? PaymentQueryType.TRANSACTIONS;

    if (type === PaymentQueryType.BALANCE) {
      return this.paymentsService.balance(user.profile_id);
    }

    if (type === PaymentQueryType.ESCROW) {
      if (!query.order_id) {
        throw new InternalServerErrorException('order_id is required for escrow queries');
      }
      return this.paymentsService.escrow(query.order_id);
    }

    const result = await this.paymentsService.transactions(
      user.profile_id,
      Number(query.page ?? 1),
      Number(query.limit ?? 20),
    );
    if (!result.success) throw new InternalServerErrorException(result.error);
    return result;
  }
}
