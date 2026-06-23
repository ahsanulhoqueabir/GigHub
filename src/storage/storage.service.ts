import { Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { r2Config } from '../config/env.config';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';

@Injectable()
export class StorageService {
  private readonly logger = new Logger(StorageService.name);
  private s3Client: S3Client;

  constructor() {
    const accountId = r2Config.accountId.trim();
    const accessKeyId = r2Config.accessKeyId.trim();
    const secretAccessKey = r2Config.secretAccessKey.trim();

    this.s3Client = new S3Client({
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      region: 'auto',
    });
  }

  async getPresignedUploadUrl(userId: string, dto: GeneratePresignedUrlDto) {
    const { fileName, contentType, folder = 'general' } = dto;

    // Generate a unique file name to avoid collisions
    const timestamp = Date.now();
    const randomStr = Math.random().toString(36).substring(2, 8);
    const cleanFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueFileName = `${userId}/${folder}/${timestamp}-${randomStr}-${cleanFileName}`;

    const command = new PutObjectCommand({
      Bucket: r2Config.bucket.trim(),
      Key: uniqueFileName,
      ContentType: contentType,
    });

    // URL expires in 15 minutes (900 seconds)
    const uploadUrl = await getSignedUrl(this.s3Client, command, {
      expiresIn: 900,
    });

    const cdnUrl = r2Config.publicUrl
      ? `${r2Config.publicUrl.trim().replace(/\/$/, '')}/${uniqueFileName}`
      : `https://${r2Config.bucket.trim()}.r2.cloudflarestorage.com/${uniqueFileName}`;

    return {
      uploadUrl,
      key: uniqueFileName,
      cdnUrl,
    };
  }
}
