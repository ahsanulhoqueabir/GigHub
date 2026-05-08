import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GigPackageTier, GigStatus } from '@/types/gig.types';

export class GigImageDto {
  @IsString()
  url!: string;

  @IsInt()
  @Min(0)
  sort_order!: number;
}

export class GigPackageDto {
  @IsEnum(GigPackageTier)
  tier!: GigPackageTier;

  @IsString()
  @MinLength(3)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(10)
  @MaxLength(1500)
  description!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(1)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(180)
  delivery_days!: number;

  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(20)
  revision_count!: number;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  features?: string[];
}

export class CreateGigDto {
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title!: string;

  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description!: string;

  @IsString()
  category_id!: string;

  @IsOptional()
  @IsEnum(GigStatus)
  status?: GigStatus = GigStatus.ACTIVE;

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags!: string[];

  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => GigPackageDto)
  packages!: GigPackageDto[];

  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @ValidateNested({ each: true })
  @Type(() => GigImageDto)
  images?: GigImageDto[];
}
