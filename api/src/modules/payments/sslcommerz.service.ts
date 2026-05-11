import { Injectable } from '@nestjs/common';
import type { PaymentSessionInput, PaymentSessionResult } from '@/types/payment.types';

@Injectable()
export class SslcommerzService {
  createSession(input: PaymentSessionInput): PaymentSessionResult {
    const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== 'false';
    const gatewayBase = isSandbox
      ? 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php'
      : 'https://securepay.sslcommerz.com/gwprocess/v4/api.php';

    const gateway_page_url = `${gatewayBase}?tran_id=${encodeURIComponent(input.tranId)}&amount=${encodeURIComponent(String(input.amount))}&currency=${encodeURIComponent(input.currency)}&success_url=${encodeURIComponent(input.successUrl)}&fail_url=${encodeURIComponent(input.failUrl)}&cancel_url=${encodeURIComponent(input.cancelUrl)}&ipn_url=${encodeURIComponent(input.ipnUrl)}`;

    return {
      tran_id: input.tranId,
      gateway_page_url,
    };
  }
}
