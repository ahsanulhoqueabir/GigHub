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
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import type { JwtPayload } from '@/types/auth.types';
import type { UploadFolder } from '@/types/upload.types';

const ALLOWED_FOLDERS: UploadFolder[] = ['avatars', 'gigs', 'deliveries', 'chat', 'documents', 'misc'];

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Query('folder') folder: UploadFolder = 'misc',
    @CurrentUser() _user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new BadRequestException(`folder must be one of: ${ALLOWED_FOLDERS.join(', ')}`);
    }

    const result = await this.uploadService.uploadImage(file, folder);
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
    @CurrentUser() _user: JwtPayload,
  ) {
    if (!file) throw new BadRequestException('No file provided');
    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw new BadRequestException(`folder must be one of: ${ALLOWED_FOLDERS.join(', ')}`);
    }

    const result = await this.uploadService.uploadFile(file, folder);
    if (!result.success) {
      if (result.status === 400) throw new BadRequestException(result.error);
      throw new InternalServerErrorException(result.error);
    }
    return result;
  }

  @Delete()
  async deleteFile(
    @Body('key') key: string,
    @CurrentUser() _user: JwtPayload,
  ) {
    if (!key) throw new BadRequestException('key is required');

    const result = await this.uploadService.deleteFile(key);
    if (!result.success) throw new InternalServerErrorException(result.error);
    return result;
  }
}
