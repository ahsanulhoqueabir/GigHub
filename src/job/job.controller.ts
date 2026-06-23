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
import { JobService } from './job.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
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

@Controller('jobs')
export class JobController {
  constructor(private readonly jobService: JobService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createJobDto: CreateJobDto,
  ) {
    const result = await this.jobService.create(user.id, createJobDto);
    return createSuccessResponse(result, 'Job created successfully');
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
    const result = await this.jobService.findAllPublic(
      pageNum,
      limitNum,
      search,
    );
    return createSuccessResponse(result, 'Jobs retrieved successfully');
  }

  @Get(':idOrSlug')
  @HttpCode(HttpStatus.OK)
  async findOnePublic(@Param('idOrSlug') idOrSlug: string) {
    const result = await this.jobService.findOnePublic(idOrSlug);
    return createSuccessResponse(result, 'Job retrieved successfully');
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateJobDto: UpdateJobDto,
  ) {
    const result = await this.jobService.update(user.id, id, updateJobDto);
    return createSuccessResponse(result, 'Job updated successfully');
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const result = await this.jobService.remove(user.id, id);
    return createSuccessResponse(result, 'Job deleted successfully');
  }
}
