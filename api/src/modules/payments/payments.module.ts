import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PaymentFeeService } from './payment-fee.service';
import { SslcommerzService } from './sslcommerz.service';

@Module({
  providers: [PaymentsService, PaymentFeeService, SslcommerzService],
  controllers: [PaymentsController],
  exports: [PaymentsService],
})
export class PaymentsModule {}
