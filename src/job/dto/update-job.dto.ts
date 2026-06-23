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
import { JobAttachmentDto } from './create-job.dto';

export class UpdateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Job title cannot be empty' })
  @IsOptional()
  title?: string;

  @IsUUID('4', { message: 'Category must be a valid UUID' })
  @IsOptional()
  category?: string;

  @IsString()
  @IsNotEmpty({ message: 'Job description cannot be empty' })
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobAttachmentDto)
  @IsOptional()
  attachments?: JobAttachmentDto[];

  @IsString()
  @IsOptional()
  @IsIn(['parttime', 'fulltime', 'contract', 'tution', 'volunteer', 'other'])
  type?:
    | 'parttime'
    | 'fulltime'
    | 'contract'
    | 'tution'
    | 'volunteer'
    | 'other';

  @IsString()
  @IsOptional()
  @IsIn(['<$100', '$100-500', '$500-1000', '$1000+'])
  budget?: '<$100' | '$100-500' | '$500-1000' | '$1000+';

  @IsString()
  @IsOptional()
  deadline?: string;

  @IsString()
  @IsNotEmpty({ message: 'Location cannot be empty' })
  @IsOptional()
  location?: string;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  required_skills?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'active', 'closed'])
  status?: 'draft' | 'active' | 'closed';
}
