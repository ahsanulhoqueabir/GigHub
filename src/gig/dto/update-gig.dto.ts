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
import { GigImageDto, GigPackageDto, GigFaqDto } from './create-gig.dto';

export class UpdateGigDto {
  @IsString()
  @IsNotEmpty({ message: 'Gig title cannot be empty' })
  @IsOptional()
  title?: string;

  @IsUUID('4', { message: 'Category must be a valid UUID' })
  @IsOptional()
  category?: string;

  @IsString()
  @IsNotEmpty({ message: 'Gig description cannot be empty' })
  @IsOptional()
  description?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GigImageDto)
  @IsOptional()
  images?: GigImageDto[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tags?: string[];

  @IsString()
  @IsOptional()
  @IsIn(['draft', 'active', 'paused', 'archived'])
  status?: 'draft' | 'active' | 'paused' | 'archived';

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GigPackageDto)
  @IsOptional()
  packages?: GigPackageDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GigFaqDto)
  @IsOptional()
  faq?: GigFaqDto[];
}
