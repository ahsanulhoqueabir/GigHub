import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { UploadService } from './upload.service';
import type { UploadFolder } from '@/types/upload.types';

const ALLOWED_FOLDERS: UploadFolder[] = [
  'avatars',
  'gigs',
  'deliveries',
  'chat',
  'documents',
  'misc',
];

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: UploadFolder = 'misc',
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new BadRequestException(`folder must be one of: ${ALLOWED_FOLDERS.join(', ')}`);
    }

    const result = await this.uploadService.image(file, folder);
    if (!result.success) {
      if (result.status === 400) throw new BadRequestException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Post('file')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: UploadFolder = 'documents',
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new BadRequestException(`folder must be one of: ${ALLOWED_FOLDERS.join(', ')}`);
    }

    const result = await this.uploadService.file(file, folder);
    if (!result.success) {
      if (result.status === 400) throw new BadRequestException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Delete()
  async remove(@Body('key') key: string) {
    if (!key) throw new BadRequestException('key is required');

    const result = await this.uploadService.remove(key);
    if (!result.success) throw new InternalServerErrorException(result.error);
    return result;
  }
}
