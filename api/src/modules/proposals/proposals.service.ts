import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { ok, fail, paginated } from '@/utils/service-response';
import type { ServiceResponse, PaginatedServiceResponse } from '@/types/services/common.types';
import type { Proposal, ProposalDetail } from '@/types/proposal.types';
import { ProposalStatus } from '@/types/proposal.types';

@Injectable()
export class ProposalsService {
  private readonly collection = 'gh_proposals';

  private fields() {
    return [
      'id',
      'gig',
      'proposer',
      'cover_letter',
      'amount',
      'status',
      'created_at',
      'updated_at',
    ].join(',');
  }

  async create(proposerId: string, dto: any): Promise<ServiceResponse<ProposalDetail>> {
    try {
      const payload = {
        gig: dto.gig_id,
        proposer: proposerId,
        cover_letter: dto.cover_letter ?? null,
        amount: dto.amount ?? null,
        status: ProposalStatus.SUBMITTED,
      };

      const { data } = await directusApi.post<{ data: Proposal }>(
        `/items/${this.collection}`,
        payload,
      );
      return ok(data.data as ProposalDetail);
    } catch (error) {
      return fail('Failed to create proposal', error);
    }
  }

  async update(id: string, userId: string, dto: any): Promise<ServiceResponse<ProposalDetail>> {
    try {
      const { data: existing } = await directusApi.get<{ data: Proposal }>(
        `/items/${this.collection}/${id}`,
      );
      if (!existing.data) return fail('Proposal not found', undefined, 404);
      if (existing.data.proposer !== userId) return fail('Not allowed', undefined, 403);

      const payload: Record<string, unknown> = {};
      if (dto.cover_letter !== undefined) payload['cover_letter'] = dto.cover_letter;
      if (dto.amount !== undefined) payload['amount'] = dto.amount;
      if (dto.status !== undefined) payload['status'] = dto.status;

      const { data } = await directusApi.patch<{ data: Proposal }>(
        `/items/${this.collection}/${id}`,
        payload,
      );
      return ok(data.data as ProposalDetail);
    } catch (error) {
      return fail('Failed to update proposal', error);
    }
  }

  async withdraw(id: string, userId: string): Promise<ServiceResponse<Proposal>> {
    try {
      const { data: existing } = await directusApi.get<{ data: Proposal }>(
        `/items/${this.collection}/${id}`,
      );
      if (!existing.data) return fail('Proposal not found', undefined, 404);
      if (existing.data.proposer !== userId) return fail('Not allowed', undefined, 403);

      const { data } = await directusApi.patch<{ data: Proposal }>(
        `/items/${this.collection}/${id}`,
        { status: ProposalStatus.WITHDRAWN },
      );
      return ok(data.data);
    } catch (error) {
      return fail('Failed to withdraw proposal', error);
    }
  }

  async listByGig(
    gigId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedServiceResponse<Proposal>> {
    try {
      const { data } = await directusApi.get<{
        data: Proposal[];
        meta?: { filter_count?: number };
      }>(`/items/${this.collection}`, {
        params: {
          filter: { gig: { _eq: gigId } },
          fields: this.fields(),
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
      return fail('Failed to list proposals', error) as PaginatedServiceResponse<Proposal>;
    }
  }

  async mine(
    proposerId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedServiceResponse<Proposal>> {
    try {
      const { data } = await directusApi.get<{
        data: Proposal[];
        meta?: { filter_count?: number };
      }>(`/items/${this.collection}`, {
        params: {
          filter: { proposer: { _eq: proposerId } },
          fields: this.fields(),
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
      return fail('Failed to fetch your proposals', error) as PaginatedServiceResponse<Proposal>;
    }
  }

  async detail(id: string): Promise<ServiceResponse<ProposalDetail>> {
    try {
      const { data } = await directusApi.get<{ data: Proposal }>(`/items/${this.collection}/${id}`);
      if (!data.data) return fail('Proposal not found', undefined, 404);
      return ok(data.data as ProposalDetail);
    } catch (error) {
      return fail('Failed to fetch proposal', error);
    }
  }
}
