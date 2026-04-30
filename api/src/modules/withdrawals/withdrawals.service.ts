import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { fail, ok, paginated } from '@/utils/service-response';
import type { PaginatedServiceResponse, ServiceResponse } from '@/types/services/common.types';
import type { Withdrawal, WithdrawalDetail } from '@/types/withdrawal.types';
import { WithdrawalStatus } from '@/types/withdrawal.types';
import type { CreateWithdrawalDto } from './dto/create-withdrawal.dto';
import type { Transaction } from '@/types/payment.types';
import { TransactionDirection, TransactionStatus } from '@/types/payment.types';

@Injectable()
export class WithdrawalsService {
  private readonly withdrawalsCollection = 'gh_withdrawals';
  private readonly transactionsCollection = 'gh_transactions';
  private readonly profilesCollection = 'gh_profiles';

  private readonly minWithdrawalAmount = 100;
  private readonly maxWithdrawalAmount = 1000000;

  private async fetchBalance(profileId: string): Promise<number> {
    try {
      const { data } = await directusApi.get<{ data: Transaction[] }>(
        `/items/${this.transactionsCollection}`,
        {
          params: {
            filter: { profile: { _eq: profileId } },
            fields: 'direction,amount',
            limit: 500,
          },
        },
      );

      return data.data.reduce((total, item) => {
        if (item.direction === 'credit') return total + item.amount;
        return total - item.amount;
      }, 0);
    } catch {
      return 0;
    }
  }

  async create(
    profileId: string,
    dto: CreateWithdrawalDto,
  ): Promise<ServiceResponse<WithdrawalDetail>> {
    if (dto.amount < this.minWithdrawalAmount) {
      return fail(`Minimum withdrawal amount is ${this.minWithdrawalAmount}`, undefined, 400);
    }

    if (dto.amount > this.maxWithdrawalAmount) {
      return fail(`Maximum withdrawal amount is ${this.maxWithdrawalAmount}`, undefined, 400);
    }

    const balance = await this.fetchBalance(profileId);
    if (balance < dto.amount) {
      return fail('Insufficient balance', undefined, 400);
    }

    try {
      const payload = {
        profile: profileId,
        amount: dto.amount,
        currency: 'BDT',
        method: dto.method,
        account_details: dto.account_details,
        status: WithdrawalStatus.PENDING,
      };

      const { data } = await directusApi.post<{ data: Withdrawal }>(
        `/items/${this.withdrawalsCollection}`,
        payload,
      );

      await directusApi.post(`/items/${this.transactionsCollection}`, {
        profile: profileId,
        tran_id: `WITHDRAWAL-${data.data.id}-${Date.now()}`,
        direction: TransactionDirection.DEBIT,
        amount: dto.amount,
        currency: 'BDT',
        status: TransactionStatus.PENDING,
      } satisfies Partial<Transaction>);

      return ok(data.data as WithdrawalDetail);
    } catch (error) {
      return fail('Failed to create withdrawal request', error);
    }
  }

  async getById(id: string): Promise<ServiceResponse<WithdrawalDetail>> {
    try {
      const { data } = await directusApi.get<{ data: Withdrawal }>(
        `/items/${this.withdrawalsCollection}/${id}`,
      );
      if (!data.data) return fail('Withdrawal not found', undefined, 404);
      return ok(data.data as WithdrawalDetail);
    } catch (error) {
      return fail('Failed to fetch withdrawal', error);
    }
  }

  async listByUser(
    profileId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedServiceResponse<Withdrawal>> {
    try {
      const { data } = await directusApi.get<{
        data: Withdrawal[];
        meta?: { filter_count?: number };
      }>(`/items/${this.withdrawalsCollection}`, {
        params: {
          filter: { profile: { _eq: profileId } },
          sort: ['-created_at'],
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
      return fail('Failed to fetch withdrawals', error) as PaginatedServiceResponse<Withdrawal>;
    }
  }

  async cancel(id: string, profileId: string): Promise<ServiceResponse<Withdrawal>> {
    try {
      const { data: existing } = await directusApi.get<{ data: Withdrawal }>(
        `/items/${this.withdrawalsCollection}/${id}`,
      );
      if (!existing.data) return fail('Withdrawal not found', undefined, 404);
      if (existing.data.profile !== profileId) {
        return fail('Not allowed to cancel this withdrawal', undefined, 403);
      }
      if (existing.data.status !== WithdrawalStatus.PENDING) {
        return fail('Only pending withdrawals can be cancelled', undefined, 400);
      }

      const { data } = await directusApi.patch<{ data: Withdrawal }>(
        `/items/${this.withdrawalsCollection}/${id}`,
        { status: WithdrawalStatus.CANCELLED },
      );

      await directusApi.post(`/items/${this.transactionsCollection}`, {
        profile: profileId,
        tran_id: `WITHDRAWAL-CANCEL-${id}-${Date.now()}`,
        direction: TransactionDirection.CREDIT,
        amount: existing.data.amount,
        currency: 'BDT',
        status: TransactionStatus.COMPLETED,
      } satisfies Partial<Transaction>);

      return ok(data.data);
    } catch (error) {
      return fail('Failed to cancel withdrawal', error);
    }
  }
}
