import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  InternalServerErrorException,
  NotFoundException,
  Patch,
  Post,
  Param,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { Public } from '@/common/decorators/public.decorator';
import type { JwtPayload } from '@/types/auth.types';
import { JobsService } from './jobs.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post()
  async create(@CurrentUser() user: JwtPayload, @Body() dto: CreateJobDto) {
    const result = await this.jobsService.create(user.profile_id, dto);
    if (!result.success) {
      if (result.status === 400) throw new BadRequestException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser() user: JwtPayload,
    @Body() dto: UpdateJobDto,
  ) {
    if (dto.type === 'edit') {
      const result = await this.jobsService.updateEdit(id, user.profile_id, dto);
      if (!result.success) {
        if (result.status === 403) throw new ForbiddenException(result.error);
        if (result.status === 404) throw new NotFoundException(result.error);
        if (result.status === 400) throw new BadRequestException(result.error);
        throw new InternalServerErrorException(result.error);
      }
      return result;
    }

    if (dto.type === 'status') {
      if (!dto.status) throw new BadRequestException('status is required for type status');
      const result = await this.jobsService.updateStatus(id, user.profile_id, dto.status as any);
      if (!result.success) {
        if (result.status === 403) throw new ForbiddenException(result.error);
        if (result.status === 404) throw new NotFoundException(result.error);
        throw new InternalServerErrorException(result.error);
      }
      return result;
    }

    throw new BadRequestException('Invalid update type');
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const result = await this.jobsService.remove(id, user.profile_id);
    if (!result.success) {
      if (result.status === 403) throw new ForbiddenException(result.error);
      if (result.status === 404) throw new NotFoundException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Public()
  @Get()
  async list(@Query() query: any) {
    const result = await this.jobsService.list(query);
    if (!result.success) throw new InternalServerErrorException(result.error);
    return result;
  }

  @Public()
  @Get(':slug')
  async detail(@Param('slug') slug: string) {
    const result = await this.jobsService.detail(slug);
    if (!result.success) {
      if (result.status === 404) throw new NotFoundException('Job not found');
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Get('me')
  async mine(@CurrentUser() user: JwtPayload, @Query('page') page = 1, @Query('limit') limit = 20) {
    const result = await this.jobsService.mine(user.profile_id, Number(page), Number(limit));
    if (!result.success) throw new InternalServerErrorException(result.error);
    return result;
  }
}
