import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateJobProposalDto } from './dto/create-job-proposal.dto';
import { UpdateJobProposalDto } from './dto/update-job-proposal.dto';
import { JobRecord } from '../job/job.service';
import { OrderRecord } from '../order/order.service';

export interface JobProposalRecord {
  id: string;
  status: 'draft' | 'active' | 'expired' | 'hired' | 'rejected';
  job: string;
  applicant: string;
  description: string;
  attachments: any;
  created_at: string;
  updated_at: string;
}

export interface PopulatedJobProposalRecord extends Omit<
  JobProposalRecord,
  'job' | 'applicant'
> {
  job: JobRecord;
  applicant: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
  };
}

@Injectable()
export class JobProposalService {
  constructor(private readonly db: DatabaseService) {}

  private generateOrderCode(): string {
    const prefix = 'J';
    const now = new Date();
    const year = String(now.getFullYear()).substring(2);
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const timestamp = `${year}${month}${day}${hours}${minutes}`;

    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const randChar = chars.charAt(Math.floor(Math.random() * chars.length));

    return `${prefix}${timestamp}${randChar}`;
  }

  async create(
    applicantId: string,
    dto: CreateJobProposalDto,
  ): Promise<JobProposalRecord> {
    // 1. Verify job exists and is active
    const jobCheck = await this.db.client
      .from('job')
      .select('*')
      .eq('id', dto.job)
      .single();

    if (jobCheck.error || !jobCheck.data) {
      throw new NotFoundException('Job not found');
    }

    const job = jobCheck.data as JobRecord;

    if (job.status !== 'active') {
      throw new BadRequestException('Cannot apply to a job that is not active');
    }

    // Job owners cannot apply to their own jobs
    if (job.owner === applicantId) {
      throw new BadRequestException(
        'You cannot submit a proposal to your own job',
      );
    }

    // 2. Check unique constraint (job + applicant)
    const existingCheck = await this.db.client
      .from('job_proposal')
      .select('id')
      .eq('job', dto.job)
      .eq('applicant', applicantId)
      .maybeSingle();

    if (existingCheck.data) {
      throw new BadRequestException(
        'You have already submitted a proposal for this job',
      );
    }

    // 3. Insert proposal
    const response = await this.db.client
      .from('job_proposal')
      .insert({
        job: dto.job,
        applicant: applicantId,
        description: dto.description,
        attachments: dto.attachments || [],
        status: dto.status || 'active',
      })
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to submit proposal: ${response.error?.message}`,
      );
    }

    return response.data as JobProposalRecord;
  }

  async findAll(userId: string, jobId?: string): Promise<JobProposalRecord[]> {
    if (jobId) {
      // 1. Fetch job to verify owner
      const jobCheck = await this.db.client
        .from('job')
        .select('*')
        .eq('id', jobId)
        .single();

      if (jobCheck.error || !jobCheck.data) {
        throw new NotFoundException('Job not found');
      }

      const job = jobCheck.data as JobRecord;

      // 2. If calling user is the job owner, return all proposals.
      // Otherwise, return only the calling user's proposal.
      let query = this.db.client
        .from('job_proposal')
        .select(
          '*, applicant:profile!applicant(id, name, username, email, avatar)',
        );

      if (job.owner === userId) {
        query = query.eq('job', jobId);
      } else {
        query = query.eq('job', jobId).eq('applicant', userId);
      }

      const response = await query.order('created_at', { ascending: false });

      if (response.error) {
        throw new BadRequestException(
          `Failed to retrieve proposals: ${response.error.message}`,
        );
      }

      return response.data as JobProposalRecord[];
    } else {
      // List all proposals submitted by the calling user
      const response = await this.db.client
        .from('job_proposal')
        .select('*, job:job!job(id, title, slug, status)')
        .eq('applicant', userId)
        .order('created_at', { ascending: false });

      if (response.error) {
        throw new BadRequestException(
          `Failed to retrieve proposals: ${response.error.message}`,
        );
      }

      return response.data as JobProposalRecord[];
    }
  }

  async findOne(
    userId: string,
    id: string,
  ): Promise<PopulatedJobProposalRecord> {
    const response = await this.db.client
      .from('job_proposal')
      .select(
        '*, applicant:profile!applicant(id, name, username, email, avatar), job:job!job(*)',
      )
      .eq('id', id)
      .maybeSingle();

    if (response.error || !response.data) {
      throw new NotFoundException('Proposal not found');
    }

    const proposal = response.data as PopulatedJobProposalRecord;

    if (proposal.applicant.id !== userId && proposal.job.owner !== userId) {
      throw new BadRequestException(
        'You are not authorized to view this proposal',
      );
    }

    return proposal;
  }

  async update(
    applicantId: string,
    id: string,
    dto: UpdateJobProposalDto,
  ): Promise<JobProposalRecord> {
    // 1. Fetch proposal
    const proposalCheck = await this.db.client
      .from('job_proposal')
      .select('*')
      .eq('id', id)
      .single();

    if (proposalCheck.error || !proposalCheck.data) {
      throw new NotFoundException('Proposal not found');
    }

    const proposal = proposalCheck.data as JobProposalRecord;

    // 2. Authorize applicant
    if (proposal.applicant !== applicantId) {
      throw new BadRequestException(
        'You are not authorized to update this proposal',
      );
    }

    // 3. Update fields
    const updateData: Partial<JobProposalRecord> = {
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.attachments !== undefined && { attachments: dto.attachments }),
      ...(dto.status !== undefined && { status: dto.status }),
      updated_at: new Date().toISOString(),
    };

    const response = await this.db.client
      .from('job_proposal')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to update proposal: ${response.error?.message}`,
      );
    }

    return response.data as JobProposalRecord;
  }

  async remove(applicantId: string, id: string): Promise<{ message: string }> {
    // 1. Fetch proposal
    const proposalCheck = await this.db.client
      .from('job_proposal')
      .select('*')
      .eq('id', id)
      .single();

    if (proposalCheck.error || !proposalCheck.data) {
      throw new NotFoundException('Proposal not found');
    }

    const proposal = proposalCheck.data as JobProposalRecord;

    // 2. Authorize applicant
    if (proposal.applicant !== applicantId) {
      throw new BadRequestException(
        'You are not authorized to delete this proposal',
      );
    }

    // 3. Check for associated orders
    const orderCheck = await this.db.client
      .from('order')
      .select('id')
      .eq('proposal', id)
      .limit(1);

    if (orderCheck.data && orderCheck.data.length > 0) {
      throw new BadRequestException(
        'Cannot delete proposal because it has associated orders',
      );
    }

    // 4. Delete proposal
    const response = await this.db.client
      .from('job_proposal')
      .delete()
      .eq('id', id);

    if (response.error) {
      throw new BadRequestException(
        `Failed to delete proposal: ${response.error.message}`,
      );
    }

    return { message: 'Proposal deleted successfully' };
  }

  async acceptProposal(
    ownerId: string,
    proposalId: string,
    totalPrice?: number,
    note?: string,
  ): Promise<{ order: any; message: string }> {
    // 1. Fetch proposal with job details
    const proposalResponse = await this.db.client
      .from('job_proposal')
      .select('*, job:job!job(*)')
      .eq('id', proposalId)
      .single();

    if (proposalResponse.error || !proposalResponse.data) {
      throw new NotFoundException('Proposal not found');
    }

    const proposal = proposalResponse.data as PopulatedJobProposalRecord;
    const job = proposal.job;

    // 2. Authorize: calling user must be the owner of the job
    if (job.owner !== ownerId) {
      throw new BadRequestException(
        'You are not authorized to accept this proposal',
      );
    }

    // 3. Verify status
    if (proposal.status === 'hired') {
      throw new BadRequestException('This proposal has already been hired');
    }

    // 4. Create Order
    const code = this.generateOrderCode();
    // Default price to 0 if not provided
    const finalPrice = totalPrice !== undefined ? totalPrice : 0;

    const orderInsert = {
      status: 'pending',
      code,
      buyer: ownerId, // job owner is buyer
      seller: proposal.applicant, // applicant is seller
      job: job.id,
      proposal: proposal.id,
      description: proposal.description,
      note: note || null,
      source: 'job',
      total_price: finalPrice,
      title: job.title,
      amount: 1,
      deadline: job.deadline,
    };

    const orderResponse = await this.db.client
      .from('order')
      .insert(orderInsert)
      .select('*')
      .single();

    if (orderResponse.error || !orderResponse.data) {
      throw new BadRequestException(
        `Failed to create order: ${orderResponse.error?.message}`,
      );
    }

    const orderData = orderResponse.data as unknown as OrderRecord;

    // 5. Update proposal status to 'hired'
    const proposalUpdate = await this.db.client
      .from('job_proposal')
      .update({ status: 'hired', updated_at: new Date().toISOString() })
      .eq('id', proposal.id);

    if (proposalUpdate.error) {
      // Rollback order if proposal update fails
      await this.db.client.from('order').delete().eq('id', orderData.id);
      throw new BadRequestException(
        `Failed to update proposal status: ${proposalUpdate.error.message}`,
      );
    }

    return {
      message: 'Proposal accepted and order created successfully',
      order: orderData,
    };
  }
}
