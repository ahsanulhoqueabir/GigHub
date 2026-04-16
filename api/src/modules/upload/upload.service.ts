import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';
import { v4 as uuidv4 } from 'uuid';
import { successResponse, errorResponse } from '@/utils/service-response';
import type { ServiceResponse } from '@/types/services/common.types';
import type { UploadResult, UploadFolder } from '@/types/upload.types';

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_IMAGE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILE_SIZE = 25 * 1024 * 1024;  // 25 MB

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucket: string;
  private readonly publicUrl: string;

  constructor(private readonly config: ConfigService) {
    const accountId = config.get<string>('r2.accountId')!;
    this.bucket = config.get<string>('r2.bucketName')!;
    this.publicUrl = config.get<string>('r2.publicUrl')!;

    this.s3 = new S3Client({
      region: 'auto',
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: config.get<string>('r2.accessKeyId')!,
        secretAccessKey: config.get<string>('r2.secretAccessKey')!,
      },
    });
  }

  async uploadImage(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<ServiceResponse<UploadResult>> {
    if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
      return errorResponse('Invalid file type. Only JPG, PNG, and WebP are allowed.', undefined, 400);
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return errorResponse('File too large. Maximum size is 10MB.', undefined, 400);
    }
    return this.uploadToR2(file.buffer, file.mimetype, folder, file.originalname);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: UploadFolder,
  ): Promise<ServiceResponse<UploadResult>> {
    if (file.size > MAX_FILE_SIZE) {
      return errorResponse('File too large. Maximum size is 25MB.', undefined, 400);
    }
    return this.uploadToR2(file.buffer, file.mimetype, folder, file.originalname);
  }

  async uploadBase64Image(
    base64Data: string,
    folder: UploadFolder,
  ): Promise<ServiceResponse<UploadResult>> {
    const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
    if (!match) {
      return errorResponse('Invalid Base64 image format', undefined, 400);
    }

    const mimeType = match[1];
    const base64 = match[2];

    if (!ALLOWED_IMAGE_TYPES.includes(mimeType)) {
      return errorResponse('Invalid image type', undefined, 400);
    }

    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length > MAX_IMAGE_SIZE) {
      return errorResponse('Image too large. Maximum size is 10MB.', undefined, 400);
    }

    const ext = mimeType.split('/')[1];
    return this.uploadToR2(buffer, mimeType, folder, `upload.${ext}`);
  }

  async deleteFile(key: string): Promise<ServiceResponse<void>> {
    try {
      await this.s3.send(
        new DeleteObjectCommand({ Bucket: this.bucket, Key: key }),
      );
      return successResponse(undefined, 'File deleted successfully');
    } catch (error) {
      return errorResponse('Failed to delete file', error);
    }
  }

  private async uploadToR2(
    buffer: Buffer,
    contentType: string,
    folder: UploadFolder,
    originalName: string,
  ): Promise<ServiceResponse<UploadResult>> {
    const ext = originalName.split('.').pop() ?? 'bin';
    const key = `${folder}/${uuidv4()}.${ext}`;

    try {
      await this.s3.send(
        new PutObjectCommand({
          Bucket: this.bucket,
          Key: key,
          Body: buffer,
          ContentType: contentType,
        }),
      );

      const url = `${this.publicUrl}/${key}`;
      return successResponse({ url, key });
    } catch (error) {
      return errorResponse('Failed to upload file', error);
    }
  }
}
