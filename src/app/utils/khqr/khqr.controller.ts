import { Controller, Post, Body } from '@nestjs/common';
import { KhqrService } from '@app/services/khqr.service';

@Controller('api/')
export class KhqrController {
  constructor(private readonly qrService: KhqrService) {}

  @Post('khqr')
  async generateQr(@Body() body: any) {
    const result = await this.qrService.generateQr(body);
    return result; // { qr: string, md5: string }
  }

  @Post('check-payment')
  async checkPayment(@Body() body: { md5: string }) {
    const status = await this.qrService.checkPayment(body.md5);
    return { status }; // returns { status: "PAID" } or { status: "UNPAID" }
  }
}
