// src/khqr/khqr.module.ts
import { Module } from '@nestjs/common';
import { KhqrController } from './khqr.controller';
import { KhqrService } from '@app/services/khqr.service';


@Module({
  controllers: [KhqrController],
  providers: [KhqrService],
})
export class KhqrModule {}
