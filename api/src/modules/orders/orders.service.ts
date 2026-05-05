import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import directusApi from '@/utils/directus.api';
import { ok, fail, paginated } from '@/utils/service-response';
import type { ServiceResponse, PaginatedServiceResponse } from '@/types/services/common.types';
import type { Order, OrderDetail } from '@/types/order.types';
import { OrderStatus } from '@/types/order.types';
import type { UpdateOrderDto } from './dto/update-order.dto';
import type { CreateOrderDto } from './dto/create-order.dto';

@Injectable()
export class OrdersService {
  private readonly collection = 'gh_orders';
  private readonly gigsCollection = 'gh_gigs';
  private readonly packagesCollection = 'gh_gig_packages';

  private generateOrderNumber(): string {
    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    return `ORD-${datePart}-${randomPart}`;
  }

  private calculateFees(amount: number) {
    const feePercent = 5;
    const platform_fee = Math.min(Math.round((amount * feePercent) / 100), 500);
    return {
      platform_fee,
      seller_earnings: amount - platform_fee,
    };
  }

  private fields() {
    return [
      'id',
      'order_number',
      'buyer',
      'seller',
      'source_type',
      'gig',
      'gig_package',
      'job',
      'proposal',
      'title',
      'description',
      'amount',
      'platform_fee',
      'seller_earnings',
      'delivery_days',
      'revision_count',
      'revisions_used',
      'status',
      'delivery_deadline',
      'completed_at',
      'cancelled_at',
      'cancellation_reason',
      'created_at',
      'updated_at',
    ].join(',');
  }

  async create(buyerId: string, dto: CreateOrderDto): Promise<ServiceResponse<OrderDetail>> {
    try {
      const { data: gigData } = await directusApi.get<{
        data: { id: string; seller: string; title: string; description: string };
      }>(`/items/${this.gigsCollection}/${dto.gig_id}`);

      if (!gigData.data) {
        return fail('Gig not found', undefined, 404);
      }

      let delivery_days = 1;
      let revision_count = 0;
      let finalAmount = dto.amount;

      if (dto.gig_package_id) {
        const { data: packageData } = await directusApi.get<{
          data: {
            id: string;
            gig: string;
            price: number;
            delivery_days: number;
            revision_count: number;
          };
        }>(`/items/${this.packagesCollection}/${dto.gig_package_id}`);

        if (!packageData.data) {
          return fail('Gig package not found', undefined, 404);
        }

        if (packageData.data.gig !== dto.gig_id) {
          return fail('Gig package does not belong to the gig', undefined, 400);
        }

        finalAmount = packageData.data.price;
        delivery_days = packageData.data.delivery_days;
        revision_count = packageData.data.revision_count;
      }

      const fees = this.calculateFees(finalAmount);

      const payload = {
        id: uuid(),
        order_number: this.generateOrderNumber(),
        buyer: buyerId,
        seller: gigData.data.seller,
        source_type: 'gig',
        gig: dto.gig_id,
        gig_package: dto.gig_package_id ?? null,
        proposal: dto.proposal_id ?? null,
        title: gigData.data.title,
        description: gigData.data.description ?? null,
        amount: finalAmount,
        platform_fee: fees.platform_fee,
        seller_earnings: fees.seller_earnings,
        delivery_days,
        revision_count,
        revisions_used: 0,
        status: OrderStatus.PENDING,
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

  async update(
    id: string,
    userId: string,
    dto: UpdateOrderDto,
  ): Promise<ServiceResponse<OrderDetail>> {
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
      if (dto.amount !== undefined) payload['amount'] = dto.amount;
      if (dto.cancellation_reason !== undefined)
        payload['cancellation_reason'] = dto.cancellation_reason;

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
