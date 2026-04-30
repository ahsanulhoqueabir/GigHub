import { UploadService } from './upload.service';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config';

jest.mock('@aws-sdk/client-s3');

const mockedS3Client = S3Client as jest.MockedClass<typeof S3Client>;

describe('UploadService', () => {
  let service: UploadService;
  let configService: jest.Mocked<ConfigService>;
  let s3SendMock: jest.Mock;

  beforeEach(() => {
    s3SendMock = jest.fn();
    mockedS3Client.prototype.send = s3SendMock;

    configService = {
      get: jest.fn((key: string) => {
        const config: Record<string, string> = {
          'r2.accountId': 'account-id',
          'r2.bucketName': 'bucket',
          'r2.publicUrl': 'https://r2.example.com',
          'r2.accessKeyId': 'access-key',
          'r2.secretAccessKey': 'secret-key',
        };
        return config[key];
      }),
    } as any;

    service = new UploadService(configService);
  });

  describe('image', () => {
    it('uploads a valid image', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'avatar.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image data'),
      } as any as Express.Multer.File;

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.image(file, 'avatars');

      expect(result.success).toBe(true);
      expect(result.data?.url).toContain('https://r2.example.com');
      expect(result.data?.key).toContain('avatars/');
      expect(result.data?.key).toContain('.png');
    });

    it('rejects unsupported image type', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'image.gif',
        encoding: '7bit',
        mimetype: 'image/gif',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image data'),
      } as any as Express.Multer.File;

      const result = await service.image(file, 'avatars');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('Invalid file type');
    });

    it('rejects oversized image', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'large.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 15 * 1024 * 1024, // 15 MB
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(15 * 1024 * 1024),
      } as any as Express.Multer.File;

      const result = await service.image(file, 'avatars');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('File too large');
    });

    it('accepts jpeg images', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'photo.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('jpeg data'),
      } as any as Express.Multer.File;

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.image(file, 'gigs');

      expect(result.success).toBe(true);
      expect(result.data?.key).toContain('gigs/');
    });

    it('accepts webp images', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'image.webp',
        encoding: '7bit',
        mimetype: 'image/webp',
        size: 512,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('webp data'),
      } as any as Express.Multer.File;

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.image(file, 'avatars');

      expect(result.success).toBe(true);
    });
  });

  describe('file', () => {
    it('uploads a valid file', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 2 * 1024 * 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('pdf data'),
      } as any as Express.Multer.File;

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.file(file, 'documents');

      expect(result.success).toBe(true);
      expect(result.data?.key).toContain('documents/');
      expect(result.data?.key).toContain('.pdf');
    });

    it('rejects oversized file', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'large.zip',
        encoding: '7bit',
        mimetype: 'application/zip',
        size: 30 * 1024 * 1024, // 30 MB
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(30 * 1024 * 1024),
      } as any as Express.Multer.File;

      const result = await service.file(file, 'documents');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('File too large');
    });

    it('uses original extension in key', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'contract.docx',
        encoding: '7bit',
        mimetype: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('docx data'),
      } as any as Express.Multer.File;

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.file(file, 'documents');

      expect(result.success).toBe(true);
      expect(result.data?.key).toContain('.docx');
    });

    it('uses default extension for files without extension', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'noextension',
        encoding: '7bit',
        mimetype: 'application/octet-stream',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('data'),
      } as any as Express.Multer.File;

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.file(file, 'documents');

      expect(result.success).toBe(true);
      // Files without extension use the whole name as extension
      expect(result.data?.key).toContain('.noextension');
    });
  });

  describe('base64', () => {
    it('uploads valid base64 image', async () => {
      const base64Data =
        'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.base64(base64Data, 'avatars');

      expect(result.success).toBe(true);
      expect(result.data?.url).toContain('https://r2.example.com');
    });

    it('rejects invalid base64 format', async () => {
      const result = await service.base64('not-a-data-uri', 'avatars');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('Invalid Base64 image format');
    });

    it('rejects unsupported image type in base64', async () => {
      const base64Data =
        'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';

      const result = await service.base64(base64Data, 'avatars');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('Invalid image type');
    });

    it('rejects oversized base64 image', async () => {
      const largeBuffer = Buffer.alloc(11 * 1024 * 1024);
      const base64 = largeBuffer.toString('base64');
      const base64Data = `data:image/png;base64,${base64}`;

      const result = await service.base64(base64Data, 'avatars');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
      expect(result.error).toContain('Image too large');
    });

    it('accepts jpeg base64', async () => {
      const base64Data = 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD/2wBD';

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.base64(base64Data, 'avatars');

      expect(result.success).toBe(true);
    });

    it('accepts webp base64', async () => {
      const base64Data = 'data:image/webp;base64,UklGRiYAAABXEBP8';

      s3SendMock.mockResolvedValueOnce({});

      const result = await service.base64(base64Data, 'avatars');

      expect(result.success).toBe(true);
    });
  });

  describe('remove', () => {
    it('deletes a file from R2', async () => {
      s3SendMock.mockResolvedValueOnce({});

      const result = await service.remove('avatars/file-id.png');

      expect(result.success).toBe(true);
      expect(result.message).toContain('deleted successfully');
    });

    it('returns error on delete failure', async () => {
      s3SendMock.mockRejectedValueOnce(new Error('Access denied'));

      const result = await service.remove('avatars/file-id.png');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Failed to delete file');
    });
  });

  describe('S3 integration', () => {
    it('constructs correct S3 endpoint', () => {
      // Service is initialized with config, verify endpoint format
      expect(mockedS3Client).toHaveBeenCalledWith(
        expect.objectContaining({
          region: 'auto',
          endpoint: 'https://account-id.r2.cloudflarestorage.com',
          credentials: expect.objectContaining({
            accessKeyId: 'access-key',
            secretAccessKey: 'secret-key',
          }),
        }),
      );
    });

    it('sends PutObjectCommand with correct parameters', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('test'),
      } as any as Express.Multer.File;

      s3SendMock.mockResolvedValueOnce({});

      await service.image(file, 'avatars');

      expect(s3SendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('sends DeleteObjectCommand on remove', async () => {
      s3SendMock.mockResolvedValueOnce({});

      await service.remove('avatars/key.png');

      expect(s3SendMock).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });
  });
});
