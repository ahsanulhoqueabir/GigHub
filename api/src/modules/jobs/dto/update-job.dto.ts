import { Type } from 'class-transformer';
import {
  IsEnum,
  IsOptional,
  IsString,
  MinLength,
  MaxLength,
  ValidateIf,
  IsNumber,
  Min,
  IsArray,
} from 'class-validator';
import { JobStatus, JobType } from '@/types/job.types';

export class UpdateJobDto {
  @IsEnum(['edit', 'status'] as any)
  type!: 'edit' | 'status';

  @ValidateIf((o: UpdateJobDto) => o.type === 'edit')
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string;

  @ValidateIf((o: UpdateJobDto) => o.type === 'edit')
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description?: string;

  @ValidateIf((o: UpdateJobDto) => o.type === 'edit')
  @IsOptional()
  @IsString()
  category_id?: string;

  @ValidateIf((o: UpdateJobDto) => o.type === 'edit')
  @IsOptional()
  @IsEnum(JobType)
  job_type?: JobType;

  @ValidateIf((o: UpdateJobDto) => o.type === 'edit')
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget_min?: number;

  @ValidateIf((o: UpdateJobDto) => o.type === 'edit')
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget_max?: number;

  @ValidateIf((o: UpdateJobDto) => o.type === 'edit')
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  skills?: string[];

  @ValidateIf((o: UpdateJobDto) => o.type === 'edit')
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @ValidateIf((o: UpdateJobDto) => o.type === 'status')
  @IsEnum(JobStatus)
  status?: JobStatus;
}
