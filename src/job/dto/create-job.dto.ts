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

export class JobAttachmentDto {
  @IsString()
  @IsNotEmpty()
  file: string;
}

export class CreateJobDto {
  @IsString()
  @IsNotEmpty({ message: 'Job title is required' })
  title: string;

  @IsUUID('4', { message: 'Category must be a valid UUID' })
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Job description is required' })
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => JobAttachmentDto)
  @IsOptional()
  attachments?: JobAttachmentDto[];

  @IsString()
  @IsNotEmpty({ message: 'Job type is required' })
  @IsIn(['parttime', 'fulltime', 'contract', 'tution', 'volunteer', 'other'])
  type: 'parttime' | 'fulltime' | 'contract' | 'tution' | 'volunteer' | 'other';

  @IsString()
  @IsNotEmpty({ message: 'Budget range is required' })
  @IsIn(['<$100', '$100-500', '$500-1000', '$1000+'])
  budget: '<$100' | '$100-500' | '$500-1000' | '$1000+';

  @IsString()
  @IsNotEmpty({ message: 'Deadline is required' })
  deadline: string;

  @IsString()
  @IsNotEmpty({ message: 'Location is required' })
  location: string;

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
