import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';

export class JobProposalAttachmentDto {
  @IsString()
  @IsNotEmpty()
  file: string;
}

export class CreateJobProposalDto {
  @IsUUID('4', { message: 'Job must be a valid UUID' })
  @IsNotEmpty({ message: 'Job is required' })
  job: string;

  @IsString()
  @IsNotEmpty({ message: 'Proposal description is required' })
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobProposalAttachmentDto)
  @IsOptional()
  attachments?: JobProposalAttachmentDto[];

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'active', 'expired', 'hired', 'rejected'])
  status?: 'draft' | 'active' | 'expired' | 'hired' | 'rejected';
}
