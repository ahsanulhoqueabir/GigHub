import { Injectable } from '@nestjs/common';
import directusApi from '@/utils/directus.api';
import { fail, ok, paginated } from '@/utils/service-response';
import type { PaginatedServiceResponse, ServiceResponse } from '@/types/services/common.types';
import type { Gig, GigDetail, GigPackage, GigQuery } from '@/types/gig.types';
import { GigPackageTier, GigStatus } from '@/types/gig.types';
import type { CreateGigDto, GigPackageDto } from './dto/create-gig.dto';
import type { UpdateGigDto } from './dto/update-gig.dto';

@Injectable()
export class GigsService {
  private readonly gigsCollection = 'gh_gigs';
  private readonly packagesCollection = 'gh_gig_packages';

  private gigFields(): string {
    return [
      'id',
      'seller',
      'category',
      'title',
      'slug',
      'description',
      'tags',
      'images',
      'status',
      'avg_rating',
      'total_reviews',
      'total_orders',
      'view_count',
      'created_at',
      'updated_at',
    ].join(',');
  }

  private packageFields(): string {
    return [
      'id',
      'gig',
      'tier',
      'title',
      'description',
      'price',
      'delivery_days',
      'revision_count',
      'features',
    ].join(',');
  }

  private slugify(input: string): string {
    return input
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  private async ensureUniqueSlug(title: string, excludeId?: string): Promise<string> {
    const base = this.slugify(title) || 'gig';
    let attempt = 0;

    while (attempt < 30) {
      const candidate = attempt === 0 ? base : `${base}-${attempt + 1}`;
      const filter: Record<string, unknown> = { slug: { _eq: candidate } };
      if (excludeId) {
        filter['id'] = { _neq: excludeId };
      }

      const { data } = await directusApi.get<{ data: Array<{ id: string }> }>(
        `/items/${this.gigsCollection}`,
        {
          params: { filter, fields: 'id', limit: 1 },
        },
      );

      if (!data.data.length) {
        return candidate;
      }

      attempt += 1;
    }

    return `${base}-${Date.now()}`;
  }

  private ensureValidPackages(packages: GigPackageDto[]): ServiceResponse<never> | null {
    const tiers = new Set(packages.map((item) => item.tier));

    if (!tiers.has(GigPackageTier.BASIC)) {
      return fail('At least one basic package is required', undefined, 400);
    }

    if (tiers.size !== packages.length) {
      return fail('Duplicate package tiers are not allowed', undefined, 400);
    }

    return null;
  }

  private async getOwnedGig(gigId: string, sellerId: string): Promise<ServiceResponse<Gig>> {
    try {
      const { data } = await directusApi.get<{ data: Gig }>(
        `/items/${this.gigsCollection}/${gigId}`,
        {
          params: { fields: this.gigFields() },
        },
      );

      if (!data.data) {
        return fail('Gig not found', undefined, 404);
      }

      if (data.data.seller !== sellerId) {
        return fail('You are not allowed to modify this gig', undefined, 403);
      }

      return ok(data.data);
    } catch (error) {
      return fail('Failed to fetch gig', error);
    }
  }

  async create(sellerId: string, dto: CreateGigDto): Promise<ServiceResponse<GigDetail>> {
    const packageValidation = this.ensureValidPackages(dto.packages);
    if (packageValidation) {
      return packageValidation;
    }

    try {
      const slug = await this.ensureUniqueSlug(dto.title);

      const gigPayload = {
        seller: sellerId,
        category: dto.category_id,
        title: dto.title,
        slug,
        description: dto.description,
        tags: dto.tags,
        images: dto.images ?? [],
        status: GigStatus.DRAFT,
      };

      const { data: gigData } = await directusApi.post<{ data: Gig }>(
        `/items/${this.gigsCollection}`,
        gigPayload,
      );

      const packagesPayload = dto.packages.map((item) => ({
        gig: gigData.data.id,
        tier: item.tier,
        title: item.title,
        description: item.description,
        price: item.price,
        delivery_days: item.delivery_days,
        revision_count: item.revision_count,
        features: item.features ?? [],
      }));

      const { data: packageData } = await directusApi.post<{ data: GigPackage[] }>(
        `/items/${this.packagesCollection}`,
        packagesPayload,
      );

      return ok({ ...gigData.data, packages: packageData.data });
    } catch (error) {
      return fail('Failed to create gig', error);
    }
  }

  async updateEdit(
    gigId: string,
    sellerId: string,
    dto: UpdateGigDto,
  ): Promise<ServiceResponse<GigDetail>> {
    const owned = await this.getOwnedGig(gigId, sellerId);
    if (!owned.success || !owned.data) {
      return owned as ServiceResponse<GigDetail>;
    }

    if (dto.packages && dto.packages.length) {
      const packageValidation = this.ensureValidPackages(dto.packages);
      if (packageValidation) {
        return packageValidation;
      }
    }

    try {
      const payload: Record<string, unknown> = {};

      if (dto.title) {
        payload['title'] = dto.title;
        payload['slug'] = await this.ensureUniqueSlug(dto.title, gigId);
      }
      if (dto.description !== undefined) payload['description'] = dto.description;
      if (dto.category_id !== undefined) payload['category'] = dto.category_id;
      if (dto.tags !== undefined) payload['tags'] = dto.tags;
      if (dto.images !== undefined) payload['images'] = dto.images;

      const { data: updatedGigData } = await directusApi.patch<{ data: Gig }>(
        `/items/${this.gigsCollection}/${gigId}`,
        payload,
      );

      if (dto.packages?.length) {
        for (const item of dto.packages) {
          const { data: existingData } = await directusApi.get<{ data: GigPackage[] }>(
            `/items/${this.packagesCollection}`,
            {
              params: {
                filter: { gig: { _eq: gigId }, tier: { _eq: item.tier } },
                fields: 'id',
                limit: 1,
              },
            },
          );

          if (existingData.data[0]) {
            await directusApi.patch(
              `/items/${this.packagesCollection}/${existingData.data[0].id}`,
              {
                title: item.title,
                description: item.description,
                price: item.price,
                delivery_days: item.delivery_days,
                revision_count: item.revision_count,
                features: item.features ?? [],
              },
            );
          } else {
            await directusApi.post(`/items/${this.packagesCollection}`, {
              gig: gigId,
              tier: item.tier,
              title: item.title,
              description: item.description,
              price: item.price,
              delivery_days: item.delivery_days,
              revision_count: item.revision_count,
              features: item.features ?? [],
            });
          }
        }
      }

      const packages = await this.getPackages(gigId);
      if (!packages.success) {
        return fail(
          packages.error ?? 'Failed to fetch gig packages',
          packages.details,
          packages.status,
        );
      }

      return ok({ ...updatedGigData.data, packages: packages.data ?? [] });
    } catch (error) {
      return fail('Failed to update gig', error);
    }
  }

  async updateStatus(
    gigId: string,
    sellerId: string,
    status: GigStatus.ACTIVE | GigStatus.PAUSED,
  ): Promise<ServiceResponse<Gig>> {
    const owned = await this.getOwnedGig(gigId, sellerId);
    if (!owned.success || !owned.data) return owned;

    try {
      const { data } = await directusApi.patch<{ data: Gig }>(
        `/items/${this.gigsCollection}/${gigId}`,
        {
          status,
        },
      );
      return ok(data.data);
    } catch (error) {
      return fail('Failed to update gig status', error);
    }
  }

  async remove(gigId: string, sellerId: string): Promise<ServiceResponse<Gig>> {
    const owned = await this.getOwnedGig(gigId, sellerId);
    if (!owned.success || !owned.data) return owned;

    try {
      const { data } = await directusApi.patch<{ data: Gig }>(
        `/items/${this.gigsCollection}/${gigId}`,
        {
          status: GigStatus.DELETED,
        },
      );
      return ok(data.data, 'Gig deleted successfully');
    } catch (error) {
      return fail('Failed to delete gig', error);
    }
  }

  async list(query: GigQuery): Promise<PaginatedServiceResponse<Gig>> {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 20);
    const offset = (page - 1) * limit;

    const filter: Record<string, unknown> = {
      status: { _eq: GigStatus.ACTIVE },
    };

    if (query.category) {
      filter['category'] = { _eq: query.category };
    }
    if (query.seller_id) {
      filter['seller'] = { _eq: query.seller_id };
    }
    if (query.min_rating !== undefined) {
      filter['avg_rating'] = { _gte: query.min_rating };
    }
    if (query.tags) {
      filter['tags'] = { _contains: query.tags };
    }
    if (query.search) {
      filter['_or'] = [
        { title: { _icontains: query.search } },
        { description: { _icontains: query.search } },
      ];
    }

    const sortMap: Record<string, string[]> = {
      price_asc: ['price_from'],
      price_desc: ['-price_from'],
      rating: ['-avg_rating'],
      orders: ['-total_orders'],
    };

    try {
      const { data } = await directusApi.get<{ data: Gig[]; meta?: { filter_count?: number } }>(
        `/items/${this.gigsCollection}`,
        {
          params: {
            filter,
            fields: this.gigFields(),
            sort: sortMap[query.sort ?? ''] ?? ['-created_at'],
            page,
            limit,
            offset,
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
      return fail('Failed to fetch gigs', error) as PaginatedServiceResponse<Gig>;
    }
  }

  async detail(slug: string): Promise<ServiceResponse<GigDetail>> {
    try {
      const { data } = await directusApi.get<{ data: Gig[] }>(`/items/${this.gigsCollection}`, {
        params: {
          filter: { slug: { _eq: slug }, status: { _eq: GigStatus.ACTIVE } },
          fields: this.gigFields(),
          limit: 1,
        },
      });

      const gig = data.data[0];
      if (!gig) {
        return fail('Gig not found', undefined, 404);
      }

      const packages = await this.getPackages(gig.id);
      if (!packages.success) {
        return fail(
          packages.error ?? 'Failed to fetch gig packages',
          packages.details,
          packages.status,
        );
      }

      return ok({ ...gig, packages: packages.data ?? [] });
    } catch (error) {
      return fail('Failed to fetch gig', error);
    }
  }

  async mine(profileId: string, page = 1, limit = 20): Promise<PaginatedServiceResponse<Gig>> {
    const query: GigQuery = {
      page,
      limit,
      seller_id: profileId,
    };

    const pageNumber = Number(query.page ?? 1);
    const limitNumber = Number(query.limit ?? 20);

    try {
      const { data } = await directusApi.get<{ data: Gig[]; meta?: { filter_count?: number } }>(
        `/items/${this.gigsCollection}`,
        {
          params: {
            filter: { seller: { _eq: query.seller_id } },
            fields: this.gigFields(),
            sort: ['-created_at'],
            page: pageNumber,
            limit: limitNumber,
            offset: (pageNumber - 1) * limitNumber,
            meta: 'filter_count',
          },
        },
      );

      const totalCount = data.meta?.filter_count ?? data.data.length;
      const totalPages = Math.max(1, Math.ceil(totalCount / limitNumber));

      return paginated(data.data, {
        currentPage: pageNumber,
        totalPages,
        totalCount,
        hasNextPage: pageNumber < totalPages,
        hasPrevPage: pageNumber > 1,
      });
    } catch (error) {
      return fail('Failed to fetch your gigs', error) as PaginatedServiceResponse<Gig>;
    }
  }

  private async getPackages(gigId: string): Promise<ServiceResponse<GigPackage[]>> {
    try {
      const { data } = await directusApi.get<{ data: GigPackage[] }>(
        `/items/${this.packagesCollection}`,
        {
          params: {
            filter: { gig: { _eq: gigId } },
            fields: this.packageFields(),
            sort: ['tier'],
          },
        },
      );
      return ok(data.data);
    } catch (error) {
      return fail('Failed to fetch gig packages', error);
    }
  }
}
