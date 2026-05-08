import {
  Controller,
  Post,
  Delete,
  Body,
  UploadedFile,
  UseInterceptors,
  Query,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { throwOnError } from '@/utils/service-error.util';
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
    throwOnError(result);
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
    throwOnError(result);
    return result;
  }

  @Delete()
  async remove(@Body('key') key: string) {
    if (!key) throw new BadRequestException('key is required');

    const result = await this.uploadService.remove(key);
    throwOnError(result);
    return result;
  }
}
