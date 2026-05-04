import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { JobType } from '@/types/job.types';

export class CreateJobDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(10000)
  description!: string;

  @IsString()
  category_id!: string;

  @IsEnum(JobType)
  job_type!: JobType;

  @ValidateIf((o: CreateJobDto) => o.job_type !== JobType.TUITION)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget_min?: number;

  @ValidateIf((o: CreateJobDto) => o.job_type !== JobType.TUITION)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  budget_max?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attachments?: string[];

  @IsOptional()
  @IsArray()
  @ArrayMinSize(0)
  @ArrayMaxSize(20)
  @IsString({ each: true })
  skills?: string[];
}
