import { Controller, Post, UseGuards, UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AdminGuard } from '../../common/guards/auth.guard';
import { UploadService, multerConfig, type UploadResult, type MulterFile } from './upload.service';

@Controller('api/upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(AdminGuard)
  @Post()
  @UseInterceptors(FileInterceptor('file', multerConfig))
  async upload(@UploadedFile() file: MulterFile): Promise<UploadResult> {
    return this.uploadService.processFile(file);
  }
}
