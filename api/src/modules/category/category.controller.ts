import { Controller, Get, Param, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { CategoryService } from './category.service';
import { Public } from '@/common/decorators/public.decorator';

@Public()
@Controller('categories')
export class CategoryController {
  @Get()
  async getAll() {
    const result = await CategoryService.getAllActive();
    if (!result.success) throw new InternalServerErrorException(result.error);
    return result;
  }

  @Get(':slug')
  async getBySlug(@Param('slug') slug: string) {
    const result = await CategoryService.getBySlug(slug);
    if (!result.success) {
      if (result.status === 404) throw new NotFoundException('Category not found');
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }
}
