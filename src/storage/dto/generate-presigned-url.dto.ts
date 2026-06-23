import { IsNotEmpty, IsString, IsOptional } from 'class-validator';

export class GeneratePresignedUrlDto {
  @IsString()
  @IsNotEmpty()
  fileName: string;

  @IsString()
  @IsNotEmpty()
  contentType: string;

  @IsString()
  @IsOptional()
  folder?: string;
}
