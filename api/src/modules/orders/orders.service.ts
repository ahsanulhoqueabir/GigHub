import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { ok, fail, paginated } from '@/utils/service-response';
import type { ServiceResponse, PaginatedServiceResponse } from '@/types/services/common.types';
import type { Order, OrderDetail } from '@/types/order.types';
import { OrderStatus } from '@/types/order.types';

@Injectable()
export class OrdersService {
  private readonly collection = 'gh_orders';

  private fields() {
    return [
      'id',
      'buyer',
      'seller',
      'gig',
      'proposal',
      'amount',
      'currency',
      'status',
      'payment_status',
      'created_at',
      'updated_at',
    ].join(',');
  }

  async create(buyerId: string, dto: any): Promise<ServiceResponse<OrderDetail>> {
    try {
      const payload = {
        buyer: buyerId,
        gig: dto.gig_id,
        proposal: dto.proposal_id ?? null,
        amount: dto.amount,
        currency: dto.currency,
        status: OrderStatus.PENDING,
        payment_status: 'pending',
      };

      const { data } = await directusApi.post<{ data: Order }>(
        `/items/${this.collection}`,
        payload,
      );
      return ok(data.data as OrderDetail);
    } catch (error) {
      return fail('Failed to create order', error);
    }
  }

  async getById(id: string): Promise<ServiceResponse<OrderDetail>> {
    try {
      const { data } = await directusApi.get<{ data: Order }>(`/items/${this.collection}/${id}`);
      if (!data.data) return fail('Order not found', undefined, 404);
      return ok(data.data as OrderDetail);
    } catch (error) {
      return fail('Failed to fetch order', error);
    }
  }

  async update(id: string, userId: string, dto: any): Promise<ServiceResponse<OrderDetail>> {
    try {
      const { data: existing } = await directusApi.get<{ data: Order }>(
        `/items/${this.collection}/${id}`,
      );
      if (!existing.data) return fail('Order not found', undefined, 404);

      // Basic permission: buyer or seller can update status/payment
      if (existing.data.buyer !== userId && existing.data.seller !== userId)
        return fail('Not allowed', undefined, 403);

      const payload: Record<string, unknown> = {};
      if (dto.status !== undefined) payload['status'] = dto.status;
      if (dto.payment_status !== undefined) payload['payment_status'] = dto.payment_status;
      if (dto.amount !== undefined) payload['amount'] = dto.amount;

      const { data } = await directusApi.patch<{ data: Order }>(
        `/items/${this.collection}/${id}`,
        payload,
      );
      return ok(data.data as OrderDetail);
    } catch (error) {
      return fail('Failed to update order', error);
    }
  }

  async listByUser(userId: string, page = 1, limit = 20): Promise<PaginatedServiceResponse<Order>> {
    try {
      const { data } = await directusApi.get<{ data: Order[]; meta?: { filter_count?: number } }>(
        `/items/${this.collection}`,
        {
          params: {
            filter: { _or: [{ buyer: { _eq: userId } }, { seller: { _eq: userId } }] },
            fields: this.fields(),
            page,
            limit,
            offset: (page - 1) * limit,
            meta: 'filter_count',
          },
        },
      );

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
      return fail('Failed to list orders', error) as PaginatedServiceResponse<Order>;
    }
  }
}
