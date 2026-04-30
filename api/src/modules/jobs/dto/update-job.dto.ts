import { IsEnum, IsOptional, IsString, MinLength, MaxLength, ValidateIf } from 'class-validator';
import { JobStatus } from '@/types/job.types';

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

  @ValidateIf((o: UpdateJobDto) => o.type === 'status')
  @IsEnum([JobStatus.OPEN, JobStatus.IN_PROGRESS, JobStatus.CLOSED, JobStatus.CANCELLED] as any)
  status?: JobStatus;
}
