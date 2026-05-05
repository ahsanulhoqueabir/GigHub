import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
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
      'job',
      'applicant',
      'cover_letter',
      'quoted_price',
      'estimated_days',
      'attachments',
      'status',
      'created_at',
      'updated_at',
    ].join(',');
  }

  async create(applicantId: string, dto: any): Promise<ServiceResponse<ProposalDetail>> {
    try {
      const payload = {
        id: uuid(),
        job: dto.job_id,
        applicant: applicantId,
        cover_letter: dto.cover_letter,
        quoted_price: dto.quoted_price ?? null,
        estimated_days: dto.estimated_days ?? null,
        attachments: dto.attachments ?? [],
        status: ProposalStatus.PENDING,
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
      if (existing.data.applicant !== userId) return fail('Not allowed', undefined, 403);

      const payload: Record<string, unknown> = {};
      if (dto.cover_letter !== undefined) payload['cover_letter'] = dto.cover_letter;
      if (dto.quoted_price !== undefined) payload['quoted_price'] = dto.quoted_price;
      if (dto.estimated_days !== undefined) payload['estimated_days'] = dto.estimated_days;
      if (dto.attachments !== undefined) payload['attachments'] = dto.attachments;
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
      if (existing.data.applicant !== userId) return fail('Not allowed', undefined, 403);

      const { data } = await directusApi.patch<{ data: Proposal }>(
        `/items/${this.collection}/${id}`,
        { status: ProposalStatus.WITHDRAWN },
      );
      return ok(data.data);
    } catch (error) {
      return fail('Failed to withdraw proposal', error);
    }
  }

  async listByJob(
    jobId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedServiceResponse<Proposal>> {
    try {
      const { data } = await directusApi.get<{
        data: Proposal[];
        meta?: { filter_count?: number };
      }>(`/items/${this.collection}`, {
        params: {
          filter: { job: { _eq: jobId } },
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
    applicantId: string,
    page = 1,
    limit = 20,
  ): Promise<PaginatedServiceResponse<Proposal>> {
    try {
      const { data } = await directusApi.get<{
        data: Proposal[];
        meta?: { filter_count?: number };
      }>(`/items/${this.collection}`, {
        params: {
          filter: { applicant: { _eq: applicantId } },
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
