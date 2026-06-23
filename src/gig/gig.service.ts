import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateGigDto } from './dto/create-gig.dto';
import { UpdateGigDto } from './dto/update-gig.dto';

export interface GigRecord {
  id: string;
  seller: string;
  category: string;
  title: string;
  slug: string;
  description: string;
  images: any;
  tags: string[];
  status: 'draft' | 'active' | 'paused' | 'archived';
  views: number;
  packages: any;
  faq: any;
  created_at: string;
  updated_at: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  avatar: string | null;
  verified: boolean;
  bio?: string | null;
}

export interface PublicCategory {
  id: string;
  name: string;
  slug: string;
}

export interface PopulatedGigRecord extends Omit<
  GigRecord,
  'seller' | 'category'
> {
  seller: PublicProfile;
  category: PublicCategory;
}

@Injectable()
export class GigService {
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

  async create(sellerId: string, dto: CreateGigDto): Promise<GigRecord> {
    // 1. Generate unique slug
    const slug = this.generateSlug(dto.title);

    // 2. Validate category exists
    const categoryCheck = await this.db.client
      .from('category')
      .select('id')
      .eq('id', dto.category)
      .eq('active', true)
      .maybeSingle();

    if (!categoryCheck.data) {
      throw new NotFoundException('Active category not found');
    }

    // 3. Insert gig
    const response = await this.db.client
      .from('gig')
      .insert({
        seller: sellerId,
        category: dto.category,
        title: dto.title,
        slug,
        description: dto.description,
        images: dto.images || [],
        tags: dto.tags || [],
        status: dto.status || 'draft',
        packages: dto.packages || [],
        faq: dto.faq || [],
      })
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to create gig: ${response.error?.message}`,
      );
    }

    return response.data as GigRecord;
  }

  async findAllPublic(
    page: number = 1,
    limit: number = 10,
    search?: string,
  ): Promise<{ data: PopulatedGigRecord[]; meta: any }> {
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = this.db.client
      .from('gig')
      .select(
        '*, seller:profile!seller(id, name, username, email, avatar, verified), category:category!category(id, name, slug)',
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
        `Failed to fetch gigs: ${response.error.message}`,
      );
    }

    const count = response.count || 0;
    const lastPage = Math.ceil(count / limit);

    return {
      data: (response.data || []) as PopulatedGigRecord[],
      meta: {
        total: count,
        page,
        limit,
        lastPage,
      },
    };
  }

  async findOnePublic(idOrSlug: string): Promise<PopulatedGigRecord> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    let query = this.db.client
      .from('gig')
      .select(
        '*, seller:profile!seller(id, name, username, email, avatar, bio, verified), category:category!category(id, name, slug)',
      );

    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const response = await query.maybeSingle();

    if (response.error) {
      throw new BadRequestException(
        `Failed to retrieve gig: ${response.error.message}`,
      );
    }

    const gig = response.data as PopulatedGigRecord | null;
    if (!gig) {
      throw new NotFoundException('Gig not found');
    }

    if (gig.status !== 'active') {
      throw new BadRequestException(
        `Gig status is ${gig.status}. Details are only available for active gigs.`,
      );
    }

    // Increment views
    await this.db.client
      .from('gig')
      .update({ views: (gig.views || 0) + 1 })
      .eq('id', gig.id);

    gig.views += 1;
    return gig;
  }

  async update(
    sellerId: string,
    id: string,
    dto: UpdateGigDto,
  ): Promise<GigRecord> {
    // 1. Fetch current gig
    const gigCheck = await this.db.client
      .from('gig')
      .select('*')
      .eq('id', id)
      .single();

    if (gigCheck.error || !gigCheck.data) {
      throw new NotFoundException('Gig not found');
    }

    const gig = gigCheck.data as GigRecord;

    // 2. Authorize
    if (gig.seller !== sellerId) {
      throw new BadRequestException(
        'You are not authorized to update this gig',
      );
    }

    // 3. Handle fields update
    const updateData: Partial<GigRecord> = {
      ...(dto.category !== undefined && { category: dto.category }),
      ...(dto.title !== undefined && {
        title: dto.title,
        slug: this.generateSlug(dto.title),
      }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.images !== undefined && { images: dto.images }),
      ...(dto.tags !== undefined && { tags: dto.tags }),
      ...(dto.status !== undefined && { status: dto.status }),
      ...(dto.packages !== undefined && { packages: dto.packages }),
      ...(dto.faq !== undefined && { faq: dto.faq }),
      updated_at: new Date().toISOString(),
    };

    // If category is updated, validate it exists
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
      .from('gig')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to update gig: ${response.error?.message}`,
      );
    }

    return response.data as GigRecord;
  }

  async remove(sellerId: string, id: string): Promise<{ message: string }> {
    // 1. Fetch gig
    const gigCheck = await this.db.client
      .from('gig')
      .select('*')
      .eq('id', id)
      .single();

    if (gigCheck.error || !gigCheck.data) {
      throw new NotFoundException('Gig not found');
    }

    const gig = gigCheck.data as GigRecord;

    // 2. Authorize
    if (gig.seller !== sellerId) {
      throw new BadRequestException(
        'You are not authorized to delete this gig',
      );
    }

    // 3. Check for associated orders
    const orderCheck = await this.db.client
      .from('order')
      .select('id')
      .eq('gig', id)
      .limit(1);

    if (orderCheck.data && orderCheck.data.length > 0) {
      throw new BadRequestException(
        'Cannot delete gig because it has associated orders',
      );
    }

    // 4. Delete the gig
    const response = await this.db.client.from('gig').delete().eq('id', id);

    if (response.error) {
      throw new BadRequestException(
        `Failed to delete gig: ${response.error.message}`,
      );
    }

    return { message: 'Gig deleted successfully' };
  }
}
