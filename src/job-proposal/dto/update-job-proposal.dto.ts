import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { JobProposalAttachmentDto } from './create-job-proposal.dto';

export class UpdateJobProposalDto {
  @IsString()
  @IsNotEmpty({ message: 'Proposal description cannot be empty' })
  @IsOptional()
  description?: string;

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
