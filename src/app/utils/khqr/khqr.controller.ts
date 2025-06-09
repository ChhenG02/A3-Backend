// src/qr/qr.controller.ts

import { KhqrService } from '@app/services/khqr.service';
import { Controller, Post, Body } from '@nestjs/common';


@Controller('api/khqr')
export class KhqrController {
  constructor(private readonly qrService: KhqrService) {}

  @Post()
  async generateQr(@Body() body: any) {
    const qrString = await this.qrService.generateQr(body);
    return { qr: qrString };
  }
}
