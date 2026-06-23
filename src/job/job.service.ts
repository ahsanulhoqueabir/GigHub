import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobRecord, PopulatedJobRecord } from '../types';

@Injectable()
export class JobService {
  constructor(private readonly db: DatabaseService) {}

  private generateSlug(title: string): string {
    const cleanTitle = title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    return `${cleanTitle}-${timestamp}`;
  }

  async create(ownerId: string, dto: CreateJobDto): Promise<JobRecord> {
    // 1. Generate unique slug
    const slug = this.generateSlug(dto.title);

    // 2. Validate category exists and is active
    const categoryCheck = await this.db.client
      .from('category')
      .select('id')
      .eq('id', dto.category)
      .eq('active', true)
      .maybeSingle();

    if (!categoryCheck.data) {
      throw new NotFoundException('Active category not found');
    }

    // 3. Insert job
    const response = await this.db.client
      .from('job')
      .insert({
        owner: ownerId,
        category: dto.category,
        title: dto.title,
        slug,
        description: dto.description,
        attachments: dto.attachments || [],
        type: dto.type,
        budget: dto.budget,
        deadline: new Date(dto.deadline).toISOString(),
        location: dto.location,
        required_skills: dto.required_skills || [],
        tags: dto.tags || [],
        status: dto.status || 'draft',
      })
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to create job: ${response.error?.message}`,
      );
    }

    return response.data as JobRecord;
  }

  async findAllPublic(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: PopulatedJobRecord[]; meta: any }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.db.client
      .from('job')
      .select(
        '*, owner:profile!owner(id, name, username, email, avatar, verified), category:category!category(id, name, slug)',
        { count: 'exact' },
      )
      .eq('status', 'active');

    if (search) {
      query = query.ilike('title', `%${search}%`);
    }

    const response = await query
      .order('created_at', { ascending: false })
      .range(from, to);

    if (response.error) {
      throw new BadRequestException(
        `Failed to fetch jobs: ${response.error.message}`,
      );
    }

    const count = response.count || 0;
    const lastPage = Math.ceil(count / limit);

    return {
      data: (response.data || []) as PopulatedJobRecord[],
      meta: {
        total: count,
        page,
        limit,
        lastPage,
      },
    };
  }

  async findOnePublic(idOrSlug: string): Promise<PopulatedJobRecord> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    let query = this.db.client
      .from('job')
      .select(
        '*, owner:profile!owner(id, name, username, email, avatar, bio, verified), category:category!category(id, name, slug)',
      );

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const response = await query.maybeSingle();

    if (response.error) {
      throw new BadRequestException(
        `Failed to retrieve job: ${response.error.message}`,
      );
    }

    const job = response.data as PopulatedJobRecord | null;
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (job.status !== 'active') {
      throw new BadRequestException(
        `Job status is ${job.status}. Details are only available for active jobs.`,
      );
    }

    // Increment views
    await this.db.client
      .from('job')
      .update({ views: (job.views || 0) + 1 })
      .eq('id', job.id);

    job.views += 1;
    return job;
  }

  async update(
    ownerId: string,
    id: string,
    dto: UpdateJobDto,
  ): Promise<JobRecord> {
    // 1. Fetch job
    const jobCheck = await this.db.client
      .from('job')
      .select('*')
      .eq('id', id)
      .single();

    if (jobCheck.error || !jobCheck.data) {
      throw new NotFoundException('Job not found');
    }

    const job = jobCheck.data as JobRecord;

    // 2. Authorize
    if (job.owner !== ownerId) {
      throw new BadRequestException(
        'You are not authorized to update this job',
      );
    }

    // 3. Handle update payload
    const updateData: Partial<JobRecord> = {
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.title !== undefined && {
        title: dto.title,
        slug: this.generateSlug(dto.title),
      }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.attachments !== undefined && { attachments: dto.attachments }),
      ...(dto.type !== undefined && { type: dto.type }),
      ...(dto.budget !== undefined && { budget: dto.budget }),
      ...(dto.deadline !== undefined && {
        deadline: new Date(dto.deadline).toISOString(),
      }),
      ...(dto.location !== undefined && { location: dto.location }),
      ...(dto.required_skills !== undefined && {
        required_skills: dto.required_skills,
      }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.status !== undefined && { status: dto.status }),
      updated_at: new Date().toISOString(),
    };

    if (dto.category) {
      const categoryCheck = await this.db.client
        .from('category')
        .select('id')
        .eq('id', dto.category)
        .eq('active', true)
        .maybeSingle();

      if (!categoryCheck.data) {
        throw new NotFoundException('Active category not found');
      }
    }

    const response = await this.db.client
      .from('job')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to update job: ${response.error?.message}`,
      );
    }

    return response.data as JobRecord;
  }

  async remove(ownerId: string, id: string): Promise<{ message: string }> {
    // 1. Fetch job
    const jobCheck = await this.db.client
      .from('job')
      .select('*')
      .eq('id', id)
      .single();

    if (jobCheck.error || !jobCheck.data) {
      throw new NotFoundException('Job not found');
    }

    const job = jobCheck.data as JobRecord;

    // 2. Authorize
    if (job.owner !== ownerId) {
      throw new BadRequestException(
        'You are not authorized to delete this job',
      );
    }

    // 3. Check for associated proposals
    const proposalCheck = await this.db.client
      .from('job_proposal')
      .select('id')
      .eq('job', id)
      .limit(1);

    if (proposalCheck.data && proposalCheck.data.length > 0) {
      throw new BadRequestException(
        'Cannot delete job because it has associated proposals',
      );
    }

    // 4. Check for associated orders
    const orderCheck = await this.db.client
      .from('order')
      .select('id')
      .eq('job', id)
      .limit(1);

    if (orderCheck.data && orderCheck.data.length > 0) {
      throw new BadRequestException(
        'Cannot delete job because it has associated orders',
      );
    }

    // 5. Delete job
    const response = await this.db.client.from('job').delete().eq('id', id);

    if (response.error) {
      throw new BadRequestException(
        `Failed to delete job: ${response.error.message}`,
      );
    }

    return { message: 'Job deleted successfully' };
  }
}
