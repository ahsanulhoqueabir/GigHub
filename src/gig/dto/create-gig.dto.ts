import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsArray,
  ValidateNested,
  IsBoolean,
  IsIn,
  IsNumber,
  IsInt,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class GigImageDto {
  @IsString()
  @IsNotEmpty()
  image: string;

  @IsBoolean()
  isCover: boolean;
}

export class GigPackageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  @IsIn(['basic', 'standard', 'premium', 'custom'])
  tier: 'basic' | 'standard' | 'premium' | 'custom';

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsInt()
  @Min(1)
  delivery_days: number;

  @IsInt()
  @Min(-1) // -1 can mean unlimited revisions
  revision_limit: number;

  @IsArray()
  @IsString({ each: true })
  features: string[];
}

export class GigFaqDto {
  @IsString()
  @IsNotEmpty()
  question: string;

  @IsString()
  @IsNotEmpty()
  answer: string;
}

export class CreateGigDto {
  @IsString()
  @IsNotEmpty({ message: 'Gig title is required' })
  title: string;

  @IsUUID('4', { message: 'Category must be a valid UUID' })
  @IsNotEmpty({ message: 'Category is required' })
  category: string;

  @IsString()
  @IsNotEmpty({ message: 'Gig description is required' })
  description: string;

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
