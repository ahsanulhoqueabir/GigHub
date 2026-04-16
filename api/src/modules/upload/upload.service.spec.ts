import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UploadService } from './upload.service';
import { PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

jest.mock('@aws-sdk/client-s3', () => {
  const original = jest.requireActual('@aws-sdk/client-s3');
  return {
    ...original,
    S3Client: jest.fn().mockImplementation(() => ({
      send: jest.fn(),
    })),
  };
});

describe('UploadService', () => {
  let service: UploadService;
  let s3SendMock: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              const config: Record<string, string> = {
                'r2.accountId': 'test-account-id',
                'r2.bucketName': 'test-bucket',
                'r2.publicUrl': 'https://cdn.example.com',
                'r2.accessKeyId': 'access-key',
                'r2.secretAccessKey': 'secret-key',
              };
              return config[key];
            }),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    // Access the mocked S3 send method
    s3SendMock = (service as any).s3.send as jest.Mock;
  });

  afterEach(() => jest.clearAllMocks());

  // ─── uploadImage ───────────────────────────────────────────────────────────

  describe('uploadImage', () => {
    const mockFile = (mimetype: string, size: number): Express.Multer.File => ({
      fieldname: 'file',
      originalname: 'test.jpg',
      encoding: '7bit',
      mimetype,
      size,
      buffer: Buffer.from('fake-image-data'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    });

    it('should upload a valid JPG image and return URL + key', async () => {
      s3SendMock.mockResolvedValueOnce({});

      const result = await service.uploadImage(mockFile('image/jpeg', 1024), 'avatars');

      expect(result.success).toBe(true);
      expect(result.data?.url).toMatch(/^https:\/\/cdn\.example\.com\/avatars\//);
      expect(result.data?.key).toMatch(/^avatars\//);
      expect(s3SendMock).toHaveBeenCalledWith(expect.any(PutObjectCommand));
    });

    it('should reject an invalid file type', async () => {
      const result = await service.uploadImage(mockFile('image/gif', 1024), 'misc');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });

    it('should reject a file exceeding 10MB', async () => {
      const result = await service.uploadImage(mockFile('image/png', 11 * 1024 * 1024), 'misc');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });

    it('should return error when S3 send fails', async () => {
      s3SendMock.mockRejectedValueOnce(new Error('S3 error'));

      const result = await service.uploadImage(mockFile('image/jpeg', 1024), 'avatars');

      expect(result.success).toBe(false);
    });
  });

  // ─── uploadFile ────────────────────────────────────────────────────────────

  describe('uploadFile', () => {
    const mockFile = (size: number): Express.Multer.File => ({
      fieldname: 'file',
      originalname: 'document.pdf',
      encoding: '7bit',
      mimetype: 'application/pdf',
      size,
      buffer: Buffer.from('pdf-content'),
      stream: null as any,
      destination: '',
      filename: '',
      path: '',
    });

    it('should upload any file type under 25MB', async () => {
      s3SendMock.mockResolvedValueOnce({});

      const result = await service.uploadFile(mockFile(1024 * 1024), 'documents');

      expect(result.success).toBe(true);
    });

    it('should reject a file exceeding 25MB', async () => {
      const result = await service.uploadFile(mockFile(26 * 1024 * 1024), 'documents');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
  });

  // ─── uploadBase64Image ─────────────────────────────────────────────────────

  describe('uploadBase64Image', () => {
    const validBase64 = `data:image/png;base64,${Buffer.from('fake-png').toString('base64')}`;

    it('should decode Base64 and upload to R2', async () => {
      s3SendMock.mockResolvedValueOnce({});

      const result = await service.uploadBase64Image(validBase64, 'avatars');

      expect(result.success).toBe(true);
      expect(result.data?.url).toMatch(/^https:\/\/cdn\.example\.com\/avatars\//);
    });

    it('should reject invalid Base64 format', async () => {
      const result = await service.uploadBase64Image('not-a-valid-base64-uri', 'avatars');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });

    it('should reject unsupported image type in Base64', async () => {
      const gifBase64 = `data:image/gif;base64,${Buffer.from('gif').toString('base64')}`;

      const result = await service.uploadBase64Image(gifBase64, 'avatars');

      expect(result.success).toBe(false);
      expect(result.status).toBe(400);
    });
  });

  // ─── deleteFile ────────────────────────────────────────────────────────────

  describe('deleteFile', () => {
    it('should delete file from R2 and return success', async () => {
      s3SendMock.mockResolvedValueOnce({});

      const result = await service.deleteFile('avatars/test-uuid.png');

      expect(result.success).toBe(true);
      expect(s3SendMock).toHaveBeenCalledWith(expect.any(DeleteObjectCommand));
    });

    it('should return error when S3 delete fails', async () => {
      s3SendMock.mockRejectedValueOnce(new Error('S3 delete error'));

      const result = await service.deleteFile('avatars/test-uuid.png');

      expect(result.success).toBe(false);
    });
  });
});
