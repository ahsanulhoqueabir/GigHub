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
import { JobProposalService } from './job-proposal.service';
import { CreateJobProposalDto } from './dto/create-job-proposal.dto';
import { UpdateJobProposalDto } from './dto/update-job-proposal.dto';
import { AcceptProposalDto } from './dto/accept-proposal.dto';
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

@Controller('job-proposals')
@UseGuards(JwtAuthGuard)
export class JobProposalController {
  constructor(private readonly jobProposalService: JobProposalService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() createJobProposalDto: CreateJobProposalDto,
  ) {
    const result = await this.jobProposalService.create(
      user.id,
      createJobProposalDto,
    );
    return createSuccessResponse(result, 'Job proposal submitted successfully');
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('jobId') jobId?: string,
  ) {
    const result = await this.jobProposalService.findAll(user.id, jobId);
    return createSuccessResponse(
      result,
      'Job proposals retrieved successfully',
    );
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const result = await this.jobProposalService.findOne(user.id, id);
    return createSuccessResponse(result, 'Job proposal retrieved successfully');
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() updateJobProposalDto: UpdateJobProposalDto,
  ) {
    const result = await this.jobProposalService.update(
      user.id,
      id,
      updateJobProposalDto,
    );
    return createSuccessResponse(result, 'Job proposal updated successfully');
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    const result = await this.jobProposalService.remove(user.id, id);
    return createSuccessResponse(result, 'Job proposal deleted successfully');
  }

  @Post(':id/accept')
  @HttpCode(HttpStatus.OK)
  async accept(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() acceptProposalDto: AcceptProposalDto,
  ) {
    const result = await this.jobProposalService.acceptProposal(
      user.id,
      id,
      acceptProposalDto.total_price,
      acceptProposalDto.note,
    );
    return createSuccessResponse(result.order, result.message);
  }
}
