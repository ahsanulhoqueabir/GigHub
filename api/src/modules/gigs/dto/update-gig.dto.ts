import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { GigPackageTier, GigStatus, type GigUpdateType } from '@/types/gig.types';

class GigImageDto {
  @IsString()
  url!: string;

  @IsInt()
  @Min(0)
  sort_order!: number;
}

class GigPackageDto {
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
  revisions!: number;
}

export class UpdateGigDto {
  @IsIn(['edit', 'status'])
  type!: GigUpdateType;

  @ValidateIf((o: UpdateGigDto) => o.type === 'edit')
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(120)
  title?: string;

  @ValidateIf((o: UpdateGigDto) => o.type === 'edit')
  @IsOptional()
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description?: string;

  @ValidateIf((o: UpdateGigDto) => o.type === 'edit')
  @IsOptional()
  @IsString()
  category_id?: string;

  @ValidateIf((o: UpdateGigDto) => o.type === 'edit')
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  tags?: string[];

  @ValidateIf((o: UpdateGigDto) => o.type === 'edit')
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(3)
  @ValidateNested({ each: true })
  @Type(() => GigPackageDto)
  packages?: GigPackageDto[];

  @ValidateIf((o: UpdateGigDto) => o.type === 'edit')
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(15)
  @ValidateNested({ each: true })
  @Type(() => GigImageDto)
  images?: GigImageDto[];

  @ValidateIf((o: UpdateGigDto) => o.type === 'status')
  @IsIn([GigStatus.ACTIVE, GigStatus.PAUSED])
  status?: GigStatus.ACTIVE | GigStatus.PAUSED;
}
