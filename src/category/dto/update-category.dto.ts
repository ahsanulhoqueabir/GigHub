import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  IsInt,
  IsBoolean,
  Min,
} from 'class-validator';

export class UpdateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Category name cannot be empty' })
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty({ message: 'Category slug cannot be empty' })
  @IsOptional()
  slug?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsUUID('4', { message: 'Parent ID must be a valid UUID' })
  @IsOptional()
  parent_id?: string;

  @IsInt({ message: 'Ordering must be an integer' })
  @Min(0, { message: 'Ordering must be a non-negative integer' })
  @IsOptional()
  ordering?: number;

  @IsBoolean({ message: 'Active status must be a boolean value' })
  @IsOptional()
  active?: boolean;
}
