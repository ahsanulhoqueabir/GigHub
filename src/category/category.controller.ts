import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Auth } from '../auth/decorators/auth.decorator';
import { createSuccessResponse } from '../common/utils/response.util';

@Controller('categories')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @Auth({ roles: ['admin', 'moderator'] })
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    const result = await this.categoryService.create(createCategoryDto);
    return createSuccessResponse(result, 'Category created successfully');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @Auth({ roles: ['admin', 'moderator'] })
  @HttpCode(HttpStatus.OK)
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    const result = await this.categoryService.update(id, updateCategoryDto);
    return createSuccessResponse(result, 'Category updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @Auth({ roles: ['admin', 'moderator'] })
  @HttpCode(HttpStatus.OK)
  async remove(@Param('id') id: string) {
    const result = await this.categoryService.remove(id);
    return createSuccessResponse(result, 'Category deleted successfully');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll() {
    const result = await this.categoryService.findAll();
    return createSuccessResponse(result, 'Categories retrieved successfully');
  }

  @Get(':idOrSlug')
  @HttpCode(HttpStatus.OK)
  async findOne(@Param('idOrSlug') idOrSlug: string) {
    const result = await this.categoryService.findOne(idOrSlug);
    return createSuccessResponse(result, 'Category retrieved successfully');
  }
}
