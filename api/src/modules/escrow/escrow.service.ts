import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { fail, ok } from '@/utils/service-response';
import type { ServiceResponse } from '@/types/services/common.types';
import type { Escrow, EscrowDetail } from '@/types/escrow.types';
import { EscrowStatus } from '@/types/escrow.types';
import type { Order } from '@/types/order.types';
import { OrderStatus, PaymentStatus } from '@/types/order.types';
import type { Transaction } from '@/types/payment.types';
import { TransactionDirection, TransactionStatus } from '@/types/payment.types';

@Injectable()
export class EscrowService {
  private readonly escrowCollection = 'gh_escrow';
  private readonly ordersCollection = 'gh_orders';
  private readonly transactionsCollection = 'gh_transactions';
  private readonly profilesCollection = 'gh_profiles';

  private nowIso(): string {
    return new Date().toISOString();
  }

  private addDaysIso(days: number): string {
    return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
  }

  private calculateFees(amount: number) {
    const feePercent = 5;
    const platform_fee = Math.min(Math.round((amount * feePercent) / 100), 500);
    return {
      platform_fee,
      seller_earnings: amount - platform_fee,
      fee_percent: feePercent,
    };
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

  async detail(orderId: string): Promise<ServiceResponse<EscrowDetail>> {
    try {
      const { data } = await directusApi.get<{ data: Escrow[] }>(
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

  async hold(orderId: string, autoReleaseAt?: string): Promise<ServiceResponse<EscrowDetail>> {
    const orderResponse = await this.fetchOrder(orderId);
    if (!orderResponse.success || !orderResponse.data) return orderResponse as ServiceResponse<any>;

    const order = orderResponse.data;
    if (order.payment_status !== PaymentStatus.PAID) {
      return fail('Escrow can only be held after payment is completed', undefined, 400);
    }

    try {
      const payload = {
        order: order.id,
        amount: order.amount,
        currency: order.currency || 'BDT',
        status: EscrowStatus.HELD,
        auto_release_at: autoReleaseAt ?? this.addDaysIso(3),
      };

      const { data: existing } = await directusApi.get<{ data: Escrow[] }>(
        `/items/${this.escrowCollection}`,
        {
          params: { filter: { order: { _eq: order.id } }, limit: 1 },
        },
      );

      if (existing.data[0]) {
        const { data } = await directusApi.patch<{ data: Escrow }>(
          `/items/${this.escrowCollection}/${existing.data[0].id}`,
          payload,
        );
        return ok(data.data);
      }

      const { data } = await directusApi.post<{ data: Escrow }>(
        `/items/${this.escrowCollection}`,
        payload,
      );
      return ok(data.data);
    } catch (error) {
      return fail('Failed to hold escrow', error);
    }
  }

  async release(orderId: string): Promise<ServiceResponse<EscrowDetail>> {
    const orderResponse = await this.fetchOrder(orderId);
    if (!orderResponse.success || !orderResponse.data) return orderResponse as ServiceResponse<any>;

    const order = orderResponse.data;
    const fees = this.calculateFees(order.amount);

    try {
      const { data } = await directusApi.get<{ data: Escrow[] }>(
        `/items/${this.escrowCollection}`,
        {
          params: { filter: { order: { _eq: order.id } }, limit: 1 },
        },
      );
      const escrow = data.data[0];
      if (!escrow) return fail('Escrow not found', undefined, 404);
      if (escrow.status !== EscrowStatus.HELD) return fail('Escrow is not held', undefined, 400);

      await directusApi.patch(`/items/${this.escrowCollection}/${escrow.id}`, {
        status: EscrowStatus.RELEASED,
        released_at: this.nowIso(),
      });

      await directusApi.patch(`/items/${this.ordersCollection}/${order.id}`, {
        status: OrderStatus.COMPLETED,
        payment_status: PaymentStatus.PAID,
      });

      await directusApi.post(`/items/${this.transactionsCollection}`, {
        profile: order.seller,
        order: order.id,
        tran_id: `ESCROW-RELEASE-${order.id}-${Date.now()}`,
        direction: TransactionDirection.CREDIT,
        amount: fees.seller_earnings,
        currency: order.currency || 'BDT',
        status: TransactionStatus.COMPLETED,
      } satisfies Partial<Transaction>);

      await directusApi.patch(`/items/${this.profilesCollection}/${order.seller}`, {
        total_earnings: { _inc: fees.seller_earnings },
      });

      return ok({
        ...escrow,
        status: EscrowStatus.RELEASED,
        released_at: this.nowIso(),
      });
    } catch (error) {
      return fail('Failed to release escrow', error);
    }
  }

  async refund(orderId: string): Promise<ServiceResponse<EscrowDetail>> {
    const orderResponse = await this.fetchOrder(orderId);
    if (!orderResponse.success || !orderResponse.data) return orderResponse as ServiceResponse<any>;

    const order = orderResponse.data;

    try {
      const { data } = await directusApi.get<{ data: Escrow[] }>(
        `/items/${this.escrowCollection}`,
        {
          params: { filter: { order: { _eq: order.id } }, limit: 1 },
        },
      );
      const escrow = data.data[0];
      if (!escrow) return fail('Escrow not found', undefined, 404);

      await directusApi.patch(`/items/${this.escrowCollection}/${escrow.id}`, {
        status: EscrowStatus.REFUNDED,
      });

      await directusApi.patch(`/items/${this.ordersCollection}/${order.id}`, {
        status: OrderStatus.REFUNDED,
        payment_status: PaymentStatus.REFUNDED,
      });

      await directusApi.post(`/items/${this.transactionsCollection}`, {
        profile: order.buyer,
        order: order.id,
        tran_id: `ESCROW-REFUND-${order.id}-${Date.now()}`,
        direction: TransactionDirection.CREDIT,
        amount: order.amount,
        currency: order.currency || 'BDT',
        status: TransactionStatus.REFUNDED,
      } satisfies Partial<Transaction>);

      return ok({
        ...escrow,
        status: EscrowStatus.REFUNDED,
      });
    } catch (error) {
      return fail('Failed to refund escrow', error);
    }
  }

  async autoReleaseDue(): Promise<ServiceResponse<{ released: number }>> {
    try {
      const { data } = await directusApi.get<{ data: Escrow[] }>(
        `/items/${this.escrowCollection}`,
        {
          params: {
            filter: {
              status: { _eq: EscrowStatus.HELD },
              auto_release_at: { _lt: this.nowIso() },
            },
            limit: 100,
          },
        },
      );

      let released = 0;
      for (const escrow of data.data) {
        const result = await this.release(escrow.order);
        if (result.success) released += 1;
      }

      return ok({ released });
    } catch (error) {
      return fail('Failed to auto release escrows', error);
    }
  }
}
