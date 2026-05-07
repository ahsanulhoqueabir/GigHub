import { Injectable } from '@nestjs/common';
import { v4 as uuid } from 'uuid';
import directusApi from '@/utils/directus.api';
import { ok, fail, paginated } from '@/utils/service-response';
import { generateUniqueSlug } from '@/utils/slug.util';
import type { ServiceResponse, PaginatedServiceResponse } from '@/types/services/common.types';
import type { Job, JobDetail, JobQuery } from '@/types/job.types';
import { JobStatus, JobType } from '@/types/job.types';

@Injectable()
export class JobsService {
  private readonly collection = 'gh_jobs';

  private fields(): string {
    return [
      'id',
      'poster',
      'category',
      'title',
      'slug',
      'description',
      'job_type',
      'budget_min',
      'budget_max',
      'budget_type',
      'deadline',
      'required_skills',
      'attachments',
      'status',
      'total_proposals',
      'created_at',
      'updated_at',
    ].join(',');
  }

  async create(posterId: string, dto: any): Promise<ServiceResponse<JobDetail>> {
    try {
      const slug = generateUniqueSlug(dto.title);

      const payload: Record<string, any> = {
        id: uuid(),
        poster: posterId,
        category: dto.category_id,
        title: dto.title,
        slug,
        description: dto.description,
        job_type: dto.job_type,
        status: JobStatus.OPEN,
        total_proposals: 0,
      };

      if (dto.budget_min !== undefined) payload.budget_min = dto.budget_min;
      if (dto.budget_max !== undefined) payload.budget_max = dto.budget_max;
      if (dto.budget_type !== undefined) payload.budget_type = dto.budget_type;
      if (dto.deadline !== undefined) payload.deadline = dto.deadline;
      if (dto.required_skills?.length) payload.required_skills = dto.required_skills;
      if (dto.attachments?.length) payload.attachments = dto.attachments;

      const { data } = await directusApi.post<{ data: Job }>(`/items/${this.collection}`, payload);
      return ok(data.data as JobDetail);
    } catch (error) {
      return fail('Failed to create job', error);
    }
  }

  async updateEdit(id: string, posterId: string, dto: any): Promise<ServiceResponse<JobDetail>> {
    try {
      const { data: existing } = await directusApi.get<{ data: Job }>(
        `/items/${this.collection}/${id}`,
      );
      if (!existing.data) return fail('Job not found', undefined, 404);
      if (existing.data.poster !== posterId)
        return fail('You are not allowed to modify this job', undefined, 403);
      if (existing.data.status !== JobStatus.OPEN)
        return fail('Job cannot be edited in current status', undefined, 400);

      const payload: Record<string, unknown> = {};
      if (dto.title) {
        payload['title'] = dto.title;
        payload['slug'] = generateUniqueSlug(dto.title);
      }
      if (dto.description !== undefined) payload['description'] = dto.description;
      if (dto.category_id !== undefined) payload['category'] = dto.category_id;
      if (dto.job_type !== undefined) payload['job_type'] = dto.job_type;
      if (dto.budget_min !== undefined) payload['budget_min'] = dto.budget_min;
      if (dto.budget_max !== undefined) payload['budget_max'] = dto.budget_max;
      if (dto.budget_type !== undefined) payload['budget_type'] = dto.budget_type;
      if (dto.deadline !== undefined) payload['deadline'] = dto.deadline;
      if (dto.required_skills !== undefined) payload['required_skills'] = dto.required_skills;
      if (dto.attachments !== undefined) payload['attachments'] = dto.attachments;

      const { data } = await directusApi.patch<{ data: Job }>(
        `/items/${this.collection}/${id}`,
        payload,
      );
      return ok(data.data as JobDetail);
    } catch (error) {
      return fail('Failed to update job', error);
    }
  }

  async updateStatus(
    id: string,
    posterId: string,
    status: JobStatus,
  ): Promise<ServiceResponse<Job>> {
    try {
      const { data: existing } = await directusApi.get<{ data: Job }>(
        `/items/${this.collection}/${id}`,
      );
      if (!existing.data) return fail('Job not found', undefined, 404);
      if (existing.data.poster !== posterId)
        return fail('You are not allowed to modify this job', undefined, 403);

      const { data } = await directusApi.patch<{ data: Job }>(`/items/${this.collection}/${id}`, {
        status,
      });
      return ok(data.data);
    } catch (error) {
      return fail('Failed to update job status', error);
    }
  }

  async remove(id: string, posterId: string): Promise<ServiceResponse<Job>> {
    try {
      const { data: existing } = await directusApi.get<{ data: Job }>(
        `/items/${this.collection}/${id}`,
      );
      if (!existing.data) return fail('Job not found', undefined, 404);
      if (existing.data.poster !== posterId)
        return fail('You are not allowed to delete this job', undefined, 403);

      const { data } = await directusApi.patch<{ data: Job }>(`/items/${this.collection}/${id}`, {
        status: JobStatus.CANCELLED,
      });
      return ok(data.data, 'Job cancelled successfully');
    } catch (error) {
      return fail('Failed to cancel job', error);
    }
  }

  async list(query: JobQuery): Promise<PaginatedServiceResponse<Job>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);

    const filter: Record<string, any> = {
      status: { _eq: query.status ?? JobStatus.OPEN },
    };

    if (query.listing_scope?.toLowerCase() === 'tuition' || query.job_type === JobType.TUITION) {
      filter['job_type'] = { _eq: JobType.TUITION };
    } else if (query.listing_scope?.toLowerCase() === 'jobs') {
      filter['job_type'] = { _neq: JobType.TUITION };
    } else if (query.job_type) {
      filter['job_type'] = { _eq: query.job_type };
    }

    if (query.category) filter['category'] = { _eq: query.category };
    if (query.budget_type) filter['budget_type'] = { _eq: query.budget_type };
    if (query.required_skills) filter['required_skills'] = { _contains: query.required_skills };
    if (query.search)
      filter['_or'] = [
        { title: { _icontains: query.search } },
        { description: { _icontains: query.search } },
      ];

    try {
      const { data } = await directusApi.get<{ data: Job[]; meta?: { filter_count?: number } }>(
        `/items/${this.collection}`,
        {
          params: {
            filter,
            fields: this.fields(),
            sort: ['-created_at'],
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
      return fail('Failed to fetch jobs', error) as PaginatedServiceResponse<Job>;
    }
  }

  async detail(slug: string): Promise<ServiceResponse<JobDetail>> {
    try {
      const { data } = await directusApi.get<{ data: Job[] }>(`/items/${this.collection}`, {
        params: {
          filter: { slug: { _eq: slug }, status: { _eq: JobStatus.OPEN } },
          fields: this.fields(),
          limit: 1,
        },
      });

      const job = data.data[0];
      if (!job) return fail('Job not found', undefined, 404);

      return ok(job as JobDetail);
    } catch (error) {
      return fail('Failed to fetch job', error);
    }
  }

  async mine(posterId: string, page = 1, limit = 20): Promise<PaginatedServiceResponse<Job>> {
    try {
      const { data } = await directusApi.get<{ data: Job[]; meta?: { filter_count?: number } }>(
        `/items/${this.collection}`,
        {
          params: {
            filter: { poster: { _eq: posterId } },
            fields: this.fields(),
            sort: ['-created_at'],
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
      return fail('Failed to fetch your jobs', error) as PaginatedServiceResponse<Job>;
    }
  }
}
