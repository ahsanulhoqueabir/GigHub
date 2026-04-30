import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: jest.Mocked<UploadService>;

  beforeEach(() => {
    uploadService = {
      image: jest.fn(),
      file: jest.fn(),
      base64: jest.fn(),
      remove: jest.fn(),
    } as any;

    controller = new UploadController(uploadService);
  });

  describe('uploadImage', () => {
    it('uploads image to specified folder', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'avatar.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image'),
      } as any as Express.Multer.File;

      uploadService.image.mockResolvedValueOnce({
        success: true,
        data: { url: 'https://r2.example.com/avatars/key.png', key: 'avatars/key.png' },
      });

      const result = await controller.uploadImage(file, 'avatars');

      expect(result.success).toBe(true);
      expect(uploadService.image).toHaveBeenCalledWith(file, 'avatars');
    });

    it('defaults to misc folder', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'image.jpg',
        encoding: '7bit',
        mimetype: 'image/jpeg',
        size: 500,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image'),
      } as any as Express.Multer.File;

      uploadService.image.mockResolvedValueOnce({
        success: true,
        data: { url: 'https://r2.example.com/misc/key.jpg', key: 'misc/key.jpg' },
      });

      await controller.uploadImage(file);

      expect(uploadService.image).toHaveBeenCalledWith(file, 'misc');
    });

    it('throws BadRequestException when no file provided', async () => {
      await expect(controller.uploadImage(undefined as any, 'avatars')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException for invalid folder', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image'),
      } as any as Express.Multer.File;

      await expect(controller.uploadImage(file, 'invalid_folder' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when service returns 400', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'image.gif',
        encoding: '7bit',
        mimetype: 'image/gif',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image'),
      } as any as Express.Multer.File;

      uploadService.image.mockResolvedValueOnce({
        success: false,
        status: 400,
        error: 'Invalid file type',
      });

      await expect(controller.uploadImage(file, 'misc')).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException when service fails with 500', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'image.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image'),
      } as any as Express.Multer.File;

      uploadService.image.mockResolvedValueOnce({
        success: false,
        error: 'R2 connection failed',
      });

      await expect(controller.uploadImage(file, 'avatars')).rejects.toThrow(
        InternalServerErrorException,
      );
    });

    it('allows all valid folders', async () => {
      const validFolders = ['avatars', 'gigs', 'deliveries', 'chat', 'documents', 'misc'];
      const file = {
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image'),
      } as any as Express.Multer.File;

      uploadService.image.mockResolvedValue({
        success: true,
        data: { url: 'https://r2.example.com/test.png', key: 'test.png' },
      });

      for (const folder of validFolders) {
        await controller.uploadImage(file, folder as any);
        expect(uploadService.image).toHaveBeenCalledWith(file, folder);
      }
    });
  });

  describe('uploadFile', () => {
    it('uploads file to specified folder', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'document.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 2048,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('pdf'),
      } as any as Express.Multer.File;

      uploadService.file.mockResolvedValueOnce({
        success: true,
        data: { url: 'https://r2.example.com/documents/key.pdf', key: 'documents/key.pdf' },
      });

      const result = await controller.uploadFile(file, 'documents');

      expect(result.success).toBe(true);
      expect(uploadService.file).toHaveBeenCalledWith(file, 'documents');
    });

    it('defaults to documents folder', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'file.zip',
        encoding: '7bit',
        mimetype: 'application/zip',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('zip'),
      } as any as Express.Multer.File;

      uploadService.file.mockResolvedValueOnce({
        success: true,
        data: { url: 'https://r2.example.com/documents/key.zip', key: 'documents/key.zip' },
      });

      await controller.uploadFile(file);

      expect(uploadService.file).toHaveBeenCalledWith(file, 'documents');
    });

    it('throws BadRequestException when no file provided', async () => {
      await expect(controller.uploadFile(undefined as any, 'documents')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException for invalid folder', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'file.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('pdf'),
      } as any as Express.Multer.File;

      await expect(controller.uploadFile(file, 'invalid' as any)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when service returns 400', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'huge.zip',
        encoding: '7bit',
        mimetype: 'application/zip',
        size: 30 * 1024 * 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.alloc(30 * 1024 * 1024),
      } as any as Express.Multer.File;

      uploadService.file.mockResolvedValueOnce({
        success: false,
        status: 400,
        error: 'File too large',
      });

      await expect(controller.uploadFile(file, 'documents')).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException when service fails', async () => {
      const file = {
        fieldname: 'file',
        originalname: 'file.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('pdf'),
      } as any as Express.Multer.File;

      uploadService.file.mockResolvedValueOnce({
        success: false,
        error: 'Upload failed',
      });

      await expect(controller.uploadFile(file, 'documents')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('remove', () => {
    it('deletes file by key', async () => {
      uploadService.remove.mockResolvedValueOnce({
        success: true,
        message: 'File deleted successfully',
      });

      const result = await controller.remove('avatars/file-id.png');

      expect(result.success).toBe(true);
      expect(uploadService.remove).toHaveBeenCalledWith('avatars/file-id.png');
    });

    it('throws BadRequestException when key is missing', async () => {
      await expect(controller.remove('')).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when key is not provided', async () => {
      await expect(controller.remove(undefined as any)).rejects.toThrow(BadRequestException);
    });

    it('throws InternalServerErrorException when delete fails', async () => {
      uploadService.remove.mockResolvedValueOnce({
        success: false,
        error: 'Failed to delete file',
      });

      await expect(controller.remove('avatars/key.png')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('folder allowlist', () => {
    it('enforces strict folder allowlist', async () => {
      const disallowedFolders = [
        'admin',
        'system',
        'secret',
        'backup',
        '../../../etc',
        '..\\..\\..\\windows',
      ];

      const file = {
        fieldname: 'file',
        originalname: 'test.png',
        encoding: '7bit',
        mimetype: 'image/png',
        size: 100,
        destination: '',
        filename: '',
        path: '',
        buffer: Buffer.from('image'),
      } as any as Express.Multer.File;

      for (const folder of disallowedFolders) {
        await expect(controller.uploadImage(file, folder as any)).rejects.toThrow(
          BadRequestException,
        );
      }
    });
  });
});
