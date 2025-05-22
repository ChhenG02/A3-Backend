// src/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { UploadController } from './controller';
import { UploadService } from './service';


@Module({
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
