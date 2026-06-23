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
  Query,
  UseGuards,
} from '@nestjs/common';
import { GigService } from './gig.service';
import { CreateGigDto } from './dto/create-gig.dto';
import { UpdateGigDto } from './dto/update-gig.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createSuccessResponse } from '../common/utils/response.util';

interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  active: boolean;
  verified: boolean;
}

@Controller('gigs')
export class GigController {
  constructor(private readonly gigService: GigService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createGigDto: CreateGigDto,
  ) {
    const result = await this.gigService.create(user.id, createGigDto);
    return createSuccessResponse(result, 'Gig created successfully');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAllPublic(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 10;
    const result = await this.gigService.findAllPublic(
      pageNum,
      limitNum,
      search,
    );
    return createSuccessResponse(result, 'Gigs retrieved successfully');
  }

  @Get(':idOrSlug')
  @HttpCode(HttpStatus.OK)
  async findOnePublic(@Param('idOrSlug') idOrSlug: string) {
    const result = await this.gigService.findOnePublic(idOrSlug);
    return createSuccessResponse(result, 'Gig retrieved successfully');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateGigDto: UpdateGigDto,
  ) {
    const result = await this.gigService.update(user.id, id, updateGigDto);
    return createSuccessResponse(result, 'Gig updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const result = await this.gigService.remove(user.id, id);
    return createSuccessResponse(result, 'Gig deleted successfully');
  }
}
