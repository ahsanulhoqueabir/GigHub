import { Injectable } from '@nestjs/common';

@Injectable()
export class PaymentFeeService {
  calculateFees(amount: number) {
    const feePercent = 5;
    const platformFee = Math.min(Math.round((amount * feePercent) / 100), 500);
    const sellerEarnings = amount - platformFee;

    return {
      platform_fee: platformFee,
      seller_earnings: sellerEarnings,
      fee_percent: feePercent,
    };
  }
}
