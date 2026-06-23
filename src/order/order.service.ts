import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { GigRecord } from '../gig/gig.service';
import { JobRecord } from '../job/job.service';
import { JobProposalRecord } from '../job-proposal/job-proposal.service';

export interface OrderRecord {
  id: string;
  status:
    | 'pending'
    | 'accepted'
    | 'in_progress'
    | 'in_review'
    | 'completed'
    | 'cancelled'
    | 'dispute';
  code: string;
  buyer: string;
  seller: string;
  gig?: string;
  job?: string;
  package?: 'basic' | 'standard' | 'premium' | 'custom';
  proposal?: string;
  description?: string;
  note?: string;
  source: 'job' | 'gig';
  total_price: number;
  title: string;
  amount: number;
  deadline?: string;
  cancellation_reason?: string;
  cancellation_request_by?: string;
  cancellation_request_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PopulatedOrderRecord extends Omit<
  OrderRecord,
  'buyer' | 'seller' | 'gig' | 'job'
> {
  buyer: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
  };
  seller: {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string | null;
  };
  gig?: {
    id: string;
    title: string;
    slug: string;
  } | null;
  job?: {
    id: string;
    title: string;
    slug: string;
  } | null;
}

interface GigPackageInfo {
  title: string;
  tier: 'basic' | 'standard' | 'premium' | 'custom';
  description: string;
  price: number;
  delivery_days: number;
  revision_limit: number;
  features: string[];
}

@Injectable()
export class OrderService {
  constructor(private readonly db: DatabaseService) {}

  private generateOrderCode(source: 'gig' | 'job'): string {
    const prefix = source === 'gig' ? 'G' : 'J';
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

  async create(buyerId: string, dto: CreateOrderDto): Promise<OrderRecord> {
    const code = this.generateOrderCode(dto.source);
    let sellerId = '';
    let title = dto.title || '';
    let totalPrice = dto.total_price || 0;
    let deadline: string | null = dto.deadline
      ? new Date(dto.deadline).toISOString()
      : null;

    if (dto.source === 'gig') {
      if (!dto.gig) {
        throw new BadRequestException('Gig is required for gig-sourced orders');
      }

      // 1. Fetch gig details
      const gigResponse = await this.db.client
        .from('gig')
        .select('*')
        .eq('id', dto.gig)
        .single();

      if (gigResponse.error || !gigResponse.data) {
        throw new NotFoundException('Gig not found');
      }

      const gig = gigResponse.data as GigRecord;
      if (gig.status !== 'active') {
        throw new BadRequestException('Cannot order a gig that is not active');
      }

      if (gig.seller === buyerId) {
        throw new BadRequestException('You cannot purchase your own gig');
      }

      sellerId = gig.seller;
      if (!title) {
        title = gig.title;
      }

      // 2. Parse price and delivery days from packages if package is provided
      if (dto.package) {
        const packages = (gig.packages || []) as GigPackageInfo[];
        const pkg = packages.find((p) => p.tier === dto.package);
        if (!pkg) {
          throw new BadRequestException(
            `Package tier '${dto.package}' not found on this gig`,
          );
        }
        totalPrice = pkg.price * (dto.amount || 1);

        if (!deadline && pkg.delivery_days) {
          const deadlineDate = new Date();
          deadlineDate.setDate(deadlineDate.getDate() + pkg.delivery_days);
          deadline = deadlineDate.toISOString();
        }
      } else {
        if (totalPrice <= 0) {
          throw new BadRequestException(
            'Price must be specified if no package tier is selected',
          );
        }
      }
    } else {
      // source is 'job'
      if (!dto.job) {
        throw new BadRequestException('Job is required for job-sourced orders');
      }

      const jobResponse = await this.db.client
        .from('job')
        .select('*')
        .eq('id', dto.job)
        .single();

      if (jobResponse.error || !jobResponse.data) {
        throw new NotFoundException('Job not found');
      }

      const job = jobResponse.data as JobRecord;
      if (job.owner !== buyerId) {
        throw new BadRequestException(
          'Only the job owner can place an order for this job',
        );
      }

      if (!title) {
        title = job.title;
      }
      if (!deadline) {
        deadline = job.deadline;
      }

      if (dto.proposal) {
        // Fetch proposal
        const proposalResponse = await this.db.client
          .from('job_proposal')
          .select('*')
          .eq('id', dto.proposal)
          .single();

        if (proposalResponse.error || !proposalResponse.data) {
          throw new NotFoundException('Job proposal not found');
        }

        const proposal = proposalResponse.data as JobProposalRecord;
        if (proposal.job !== dto.job) {
          throw new BadRequestException(
            'Proposal does not belong to the specified job',
          );
        }

        sellerId = proposal.applicant;
      } else {
        throw new BadRequestException(
          'Proposal is required to determine the seller for a job-sourced order',
        );
      }
    }

    // Insert Order
    const insertData = {
      status: 'pending',
      code,
      buyer: buyerId,
      seller: sellerId,
      gig: dto.gig || null,
      job: dto.job || null,
      package: dto.package || null,
      proposal: dto.proposal || null,
      description: dto.description || null,
      note: dto.note || null,
      source: dto.source,
      total_price: totalPrice,
      title,
      amount: dto.amount || 1,
      deadline,
    };

    const response = await this.db.client
      .from('order')
      .insert(insertData)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to place order: ${response.error?.message}`,
      );
    }

    // If order was created based on a proposal, update proposal status to hired
    if (dto.proposal) {
      await this.db.client
        .from('job_proposal')
        .update({ status: 'hired', updated_at: new Date().toISOString() })
        .eq('id', dto.proposal);
    }

    return response.data as OrderRecord;
  }

  async findAll(userId: string): Promise<OrderRecord[]> {
    const response = await this.db.client
      .from('order')
      .select(
        '*, buyer:profile!buyer(id, name, username, email, avatar), seller:profile!seller(id, name, username, email, avatar), gig:gig(id, title, slug), job:job(id, title, slug)',
      )
      .or(`buyer.eq.${userId},seller.eq.${userId}`)
      .order('created_at', { ascending: false });

    if (response.error) {
      throw new BadRequestException(
        `Failed to retrieve orders: ${response.error.message}`,
      );
    }

    return (response.data || []) as OrderRecord[];
  }

  async findOne(userId: string, id: string): Promise<PopulatedOrderRecord> {
    const response = await this.db.client
      .from('order')
      .select(
        '*, buyer:profile!buyer(id, name, username, email, avatar), seller:profile!seller(id, name, username, email, avatar), gig:gig(id, title, slug), job:job(id, title, slug)',
      )
      .eq('id', id)
      .maybeSingle();

    if (response.error || !response.data) {
      throw new NotFoundException('Order not found');
    }

    const order = response.data as PopulatedOrderRecord;
    if (order.buyer.id !== userId && order.seller.id !== userId) {
      throw new BadRequestException(
        'You are not authorized to view this order',
      );
    }

    return order;
  }

  async updateStatus(
    userId: string,
    id: string,
    dto: UpdateOrderStatusDto,
  ): Promise<OrderRecord> {
    // 1. Fetch order
    const orderCheck = await this.db.client
      .from('order')
      .select('*')
      .eq('id', id)
      .single();

    if (orderCheck.error || !orderCheck.data) {
      throw new NotFoundException('Order not found');
    }

    const order = orderCheck.data as OrderRecord;

    // 2. Authorize
    if (order.buyer !== userId && order.seller !== userId) {
      throw new BadRequestException(
        'You are not authorized to update this order',
      );
    }

    const updateData: Partial<OrderRecord> = {
      status: dto.status,
      updated_at: new Date().toISOString(),
    };

    // 3. Status Transition Logic & Rules
    if (dto.status === 'accepted') {
      if (order.status !== 'pending') {
        throw new BadRequestException(
          'Order can only be accepted if it is in pending status',
        );
      }
      if (userId !== order.seller) {
        throw new BadRequestException('Only the seller can accept the order');
      }
    }

    if (dto.status === 'cancelled') {
      if (order.status === 'completed' || order.status === 'cancelled') {
        throw new BadRequestException(
          'Order cannot be cancelled after completion or already cancelled',
        );
      }
      updateData.cancellation_reason =
        dto.cancellation_reason || 'No reason provided';
      updateData.cancellation_request_by = userId;
      updateData.cancellation_request_at = new Date().toISOString();
    }

    const response = await this.db.client
      .from('order')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to update order status: ${response.error?.message}`,
      );
    }

    return response.data as OrderRecord;
  }
}
