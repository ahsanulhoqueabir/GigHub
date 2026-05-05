import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import directusApi from '@/utils/directus.api';
import { fail, ok, paginated } from '@/utils/service-response';
import type { PaginatedServiceResponse, ServiceResponse } from '@/types/services/common.types';
import type { EscrowRecord, PaymentSessionResult, Transaction } from '@/types/payment.types';
import { TransactionDirection, TransactionStatus } from '@/types/payment.types';
import type { InitiatePaymentDto } from './dto/initiate-payment.dto';
import { PaymentFeeService } from './payment-fee.service';
import { SslcommerzService } from './sslcommerz.service';
import type { Order } from '@/types/order.types';
import { OrderStatus } from '@/types/order.types';

@Injectable()
export class PaymentsService {
  private readonly ordersCollection = 'gh_orders';
  private readonly transactionsCollection = 'gh_transactions';
  private readonly escrowCollection = 'gh_escrow';

  constructor(
    private readonly feeService: PaymentFeeService,
    private readonly sslcommerzService: SslcommerzService,
  ) {}

  private baseUrl(): string {
    return process.env.CORS_ORIGIN_WEB ?? 'http://localhost:3001';
  }

  private tranId(orderId: string): string {
    return `GH-PAY-${Date.now()}-${orderId}`;
  }

  private async fetchOrder(orderId: string): Promise<ServiceResponse<Order>> {
    try {
      const { data } = await directusApi.get<{ data: Order }>(
        `/items/${this.ordersCollection}/${orderId}`,
      );
      if (!data.data) return fail('Order not found', undefined, 404);
      return ok(data.data);
    } catch (error) {
      return fail('Failed to fetch order', error);
    }
  }

  async initiate(
    profileId: string,
    dto: InitiatePaymentDto,
  ): Promise<
    ServiceResponse<PaymentSessionResult & { fees: ReturnType<PaymentFeeService['calculateFees']> }>
  > {
    const orderResponse = await this.fetchOrder(dto.order_id);
    if (!orderResponse.success || !orderResponse.data) return orderResponse as ServiceResponse<any>;

    const order = orderResponse.data;
    if (order.buyer !== profileId)
      return fail('You are not allowed to pay for this order', undefined, 403);
    if (order.status !== OrderStatus.PENDING)
      return fail('Only pending orders can be paid', undefined, 400);

    try {
      const { data: existingTransactions } = await directusApi.get<{ data: Transaction[] }>(
        `/items/${this.transactionsCollection}`,
        {
          params: {
            filter: {
              order: { _eq: order.id },
              status: { _eq: TransactionStatus.PENDING },
            },
            fields: 'id',
            limit: 1,
          },
        },
      );

      if (existingTransactions.data[0]) {
        return fail('Payment has already been initiated', undefined, 400);
      }
    } catch (error) {
      return fail('Failed to validate payment status', error);
    }

    const fees = this.feeService.calculateFees(order.amount);
    const tranId = this.tranId(order.id);

    const session = this.sslcommerzService.createSession({
      amount: order.amount,
      currency: 'BDT',
      tranId,
      productName: `Order ${order.id}`,
      successUrl: `${this.baseUrl()}/payments/sslcommerz/success`,
      failUrl: `${this.baseUrl()}/payments/sslcommerz/fail`,
      cancelUrl: `${this.baseUrl()}/payments/sslcommerz/cancel`,
      ipnUrl: `${this.baseUrl()}/payments/sslcommerz/ipn`,
    });

    try {
      await directusApi.post(`/items/${this.transactionsCollection}`, {
        id: uuid(),
        profile: profileId,
        order: order.id,
        tran_id: tranId,
        type: 'payment',
        direction: TransactionDirection.DEBIT,
        amount: order.amount,
        payment_method: 'sslcommerz',
        description: `Payment initiated for order ${order.id}`,
        status: TransactionStatus.PENDING,
      });
    } catch (error) {
      return fail('Failed to create payment record', error);
    }

    return ok({ ...session, fees });
  }

  async transactions(
    profileId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedServiceResponse<Transaction>> {
    try {
      const { data } = await directusApi.get<{
        data: Transaction[];
        meta?: { filter_count?: number };
      }>(`/items/${this.transactionsCollection}`, {
        params: {
          filter: { profile: { _eq: profileId } },
          fields: [
            'id',
            'profile',
            'order',
            'tran_id',
            'type',
            'direction',
            'amount',
            'balance_after',
            'description',
            'payment_method',
            'payment_reference',
            'status',
            'created_at',
            'updated_at',
          ].join(','),
          page,
          limit,
          offset: (page - 1) * limit,
          meta: 'filter_count',
        },
      });

      const totalCount = data.meta?.filter_count ?? data.data.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limit));
      return paginated(data.data, {
        currentPage: page,
        totalPages,
        totalCount,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1,
      });
    } catch (error) {
      return fail(
        'Failed to fetch payment transactions',
        error,
      ) as PaginatedServiceResponse<Transaction>;
    }
  }

  async balance(
    profileId: string,
  ): Promise<ServiceResponse<{ balance: number; currency: string }>> {
    const result = await this.transactions(profileId, 1, 200);
    if (!result.success || !result.data) return result as ServiceResponse<any>;

    const balance = result.data.reduce((total, item) => {
      if (item.direction === 'credit') return total + item.amount;
      return total - item.amount;
    }, 0);

    return ok({ balance, currency: 'BDT' });
  }

  async escrow(orderId: string): Promise<ServiceResponse<EscrowRecord>> {
    try {
      const { data } = await directusApi.get<{ data: EscrowRecord[] }>(
        `/items/${this.escrowCollection}`,
        {
          params: { filter: { order: { _eq: orderId } }, limit: 1 },
        },
      );

      if (!data.data[0]) return fail('Escrow not found', undefined, 404);
      return ok(data.data[0]);
    } catch (error) {
      return fail('Failed to fetch escrow', error);
    }
  }

  async success(payload: { tran_id: string; order_id: string }): Promise<ServiceResponse<Order>> {
    return this.finalizePayment(payload.tran_id, payload.order_id, 'completed');
  }

  async fail(payload: { tran_id: string; order_id: string }): Promise<ServiceResponse<Order>> {
    return this.finalizePayment(payload.tran_id, payload.order_id, 'failed');
  }

  async cancel(payload: { tran_id: string; order_id: string }): Promise<ServiceResponse<Order>> {
    return this.finalizePayment(payload.tran_id, payload.order_id, 'failed');
  }

  async ipn(payload: { tran_id: string; order_id: string }): Promise<ServiceResponse<Order>> {
    return this.finalizePayment(payload.tran_id, payload.order_id, 'completed');
  }

  private async finalizePayment(
    tranId: string,
    orderId: string,
    status: 'completed' | 'failed',
  ): Promise<ServiceResponse<Order>> {
    const orderResponse = await this.fetchOrder(orderId);
    if (!orderResponse.success || !orderResponse.data) return orderResponse as ServiceResponse<any>;

    const order = orderResponse.data;

    try {
      const nextOrderStatus = status === 'completed' ? OrderStatus.PROCESSING : order.status;
      const transactionStatus =
        status === 'completed' ? TransactionStatus.COMPLETED : TransactionStatus.FAILED;

      const { data } = await directusApi.patch<{ data: Order }>(
        `/items/${this.ordersCollection}/${orderId}`,
        {
          status: nextOrderStatus,
        },
      );

      await directusApi.patch(`/items/${this.transactionsCollection}`, {
        filter: { tran_id: { _eq: tranId } },
        status: transactionStatus,
      });

      return ok(data.data);
    } catch (error) {
      return fail('Failed to finalize payment', error);
    }
  }
}
