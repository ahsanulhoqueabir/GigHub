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

import { GigImageDto, GigPackageDto } from './create-gig.dto';

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
