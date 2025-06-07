import { KhqrService } from '@app/services/khqr.service';
import { Body, Controller, Post } from '@nestjs/common';


@Controller('khqr')
export class KhqrController {
  constructor(private readonly khqrService: KhqrService) {}

  @Post('generate')
  generate(@Body() body: { amount: number; billNumber: string; mobileNumber?: string }) {
    const { amount, billNumber, mobileNumber } = body;
    const qrString = this.khqrService.generate(amount, billNumber, mobileNumber);

    return {
      qrString,
      expiresAt: new Date(Date.now() + 2 * 60 * 1000),
    };
  }

  @Post('verify')
  verify(@Body() body: { qrString: string }) {
    const isValid = this.khqrService.verify(body.qrString);
    return { isValid };
  }
}
