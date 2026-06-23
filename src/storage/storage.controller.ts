import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { StorageService } from './storage.service';
import { GeneratePresignedUrlDto } from './dto/generate-presigned-url.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createSuccessResponse } from '../common/utils/response.util';

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private readonly storageService: StorageService) {}

  @Post('presigned-url')
  async getPresignedUrl(
    @CurrentUser() user: { id: string },
    @Body() dto: GeneratePresignedUrlDto,
  ) {
    const result = await this.storageService.getPresignedUploadUrl(
      user.id,
      dto,
    );
    return createSuccessResponse(
      result,
      'Pre-signed upload URL generated successfully',
    );
  }
}
