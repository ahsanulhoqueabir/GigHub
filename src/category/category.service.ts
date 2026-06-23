import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { CategoryRecord, CategoryTree } from '../types';

@Injectable()
export class CategoryService {
  constructor(private readonly db: DatabaseService) {}

  /**
   * Helper to check if a category is a parent/ancestor of another category to prevent circular reference.
   */
  private async isCircularReference(
    categoryId: string,
    parentId: string,
  ): Promise<boolean> {
    if (categoryId === parentId) return true;

    let currentParentId: string | null = parentId;
    while (currentParentId) {
      const response = await this.db.client
        .from('category')
        .select('parent_id')
        .eq('id', currentParentId)
        .single();

      if (response.error || !response.data) {
        break;
      }

      const parent = response.data;
      if (parent.parent_id === categoryId) {
        return true;
      }
      currentParentId = parent.parent_id;
    }
    return false;
  }

  /**
   * Helper to build a recursive category tree from a list of active categories.
   */
  private buildCategoryTree(categories: CategoryRecord[]): CategoryTree[] {
    const map = new Map<string, CategoryTree>();

    // First pass: add all categories to the map
    categories.forEach((cat) => {
      map.set(cat.id, { ...cat, subCategories: [] });
    });

    const roots: CategoryTree[] = [];

    // Second pass: build relationships
    categories.forEach((cat) => {
      const mapped = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        map.get(cat.parent_id)!.subCategories.push(mapped);
      } else {
        roots.push(mapped);
      }
    });

    // Recursive sorting function
    const sortTree = (node: CategoryTree) => {
      node.subCategories.sort((a, b) => a.ordering - b.ordering);
      node.subCategories.forEach(sortTree);
    };

    roots.forEach(sortTree);
    roots.sort((a, b) => a.ordering - b.ordering);

    return roots;
  }

  /**
   * Create a new category.
   */
  async create(dto: CreateCategoryDto): Promise<CategoryRecord> {
    // 1. Check if slug is unique
    const slugCheck = await this.db.client
      .from('category')
      .select('id')
      .eq('slug', dto.slug)
      .maybeSingle();

    if (slugCheck.data) {
      throw new BadRequestException('Category slug must be unique');
    }

    // 2. Validate parent category if provided
    if (dto.parent_id) {
      const parentCheck = await this.db.client
        .from('category')
        .select('id')
        .eq('id', dto.parent_id)
        .single();

      if (parentCheck.error || !parentCheck.data) {
        throw new NotFoundException('Parent category not found');
      }
    }

    // 3. Insert record
    const insertData = {
      name: dto.name,
      description: dto.description || null,
      slug: dto.slug,
      image: dto.image || null,
      parent_id: dto.parent_id || null,
      ordering: dto.ordering ?? 0,
      active: dto.active ?? true,
    };

    const response = await this.db.client
      .from('category')
      .insert(insertData)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to create category: ${response.error?.message}`,
      );
    }

    return response.data as CategoryRecord;
  }

  /**
   * Update an existing category.
   */
  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryRecord> {
    // 1. Fetch current category
    const categoryCheck = await this.db.client
      .from('category')
      .select('*')
      .eq('id', id)
      .single();

    if (categoryCheck.error || !categoryCheck.data) {
      throw new NotFoundException('Category not found');
    }

    const category = categoryCheck.data as CategoryRecord;

    // 2. Check if slug is updated and unique
    if (dto.slug && dto.slug !== category.slug) {
      const slugCheck = await this.db.client
        .from('category')
        .select('id')
        .eq('slug', dto.slug)
        .neq('id', id)
        .maybeSingle();

      if (slugCheck.data) {
        throw new BadRequestException('Category slug must be unique');
      }
    }

    // 3. Validate parent category and check for circular references
    if (dto.parent_id !== undefined && dto.parent_id !== null) {
      if (dto.parent_id === id) {
        throw new BadRequestException('A category cannot be its own parent');
      }

      const parentCheck = await this.db.client
        .from('category')
        .select('id')
        .eq('id', dto.parent_id)
        .single();

      if (parentCheck.error || !parentCheck.data) {
        throw new NotFoundException('Parent category not found');
      }

      // Check circular references
      const isCircular = await this.isCircularReference(id, dto.parent_id);
      if (isCircular) {
        throw new BadRequestException(
          'Circular reference detected: A category cannot be a child of itself or its descendants',
        );
      }
    }

    // 4. Update the record
    const updateData: Partial<CategoryRecord> = {
      ...(dto.name !== undefined && { name: dto.name }),
      ...(dto.description !== undefined && { description: dto.description }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.image !== undefined && { image: dto.image }),
      ...(dto.parent_id !== undefined && { parent_id: dto.parent_id }),
      ...(dto.ordering !== undefined && { ordering: dto.ordering }),
      ...(dto.active !== undefined && { active: dto.active }),
      updated_at: new Date().toISOString(),
    };

    const response = await this.db.client
      .from('category')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to update category: ${response.error?.message}`,
      );
    }

    return response.data as CategoryRecord;
  }

  /**
   * Soft delete a category (sets active = false).
   * Prevents deletion if the category has children.
   */
  async remove(id: string): Promise<CategoryRecord> {
    // 1. Fetch current category
    const categoryCheck = await this.db.client
      .from('category')
      .select('*')
      .eq('id', id)
      .single();

    if (categoryCheck.error || !categoryCheck.data) {
      throw new NotFoundException('Category not found');
    }

    // 2. Check if category has children (either active or inactive)
    const childrenCheck = await this.db.client
      .from('category')
      .select('id')
      .eq('parent_id', id)
      .limit(1);

    if (childrenCheck.data && childrenCheck.data.length > 0) {
      throw new BadRequestException(
        'Cannot delete category because it has child categories',
      );
    }

    // 3. Soft delete (active = false)
    const response = await this.db.client
      .from('category')
      .update({ active: false, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*')
      .single();

    if (response.error || !response.data) {
      throw new BadRequestException(
        `Failed to delete category: ${response.error?.message}`,
      );
    }

    return response.data as CategoryRecord;
  }

  /**
   * Get all active categories with their nested sub-categories.
   */
  async findAll(): Promise<CategoryTree[]> {
    const response = await this.db.client
      .from('category')
      .select('*')
      .eq('active', true)
      .order('ordering', { ascending: true });

    if (response.error) {
      throw new BadRequestException(
        `Failed to retrieve categories: ${response.error.message}`,
      );
    }

    const categories = (response.data || []) as CategoryRecord[];
    return this.buildCategoryTree(categories);
  }

  /**
   * Get category details by id or slug (only active categories).
   */
  async findOne(idOrSlug: string): Promise<CategoryTree> {
    const isUuid =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        idOrSlug,
      );

    let query = this.db.client.from('category').select('*');
    if (isUuid) {
      query = query.eq('id', idOrSlug);
    } else {
      query = query.eq('slug', idOrSlug);
    }

    const response = await query.single();
    const category = response.data as CategoryRecord | null;

    if (response.error || !category) {
      throw new NotFoundException('Category not found');
    }

    if (!category.active) {
      throw new NotFoundException('Category not found or inactive');
    }

    // Construct the active tree to get all nested descendants of this category
    const activeResponse = await this.db.client
      .from('category')
      .select('*')
      .eq('active', true)
      .order('ordering', { ascending: true });

    const activeCategories = (activeResponse.data || []) as CategoryRecord[];
    const tree = this.buildCategoryTree(activeCategories);

    // Find our category node recursively in the tree
    const findNode = (nodes: CategoryTree[]): CategoryTree | null => {
      for (const node of nodes) {
        if (node.id === category.id) {
          return node;
        }
        const found = findNode(node.subCategories);
        if (found) return found;
      }
      return null;
    };

    const foundNode = findNode(tree);
    if (foundNode) {
      return foundNode;
    }

    return {
      ...category,
      subCategories: [],
    };
  }
}
