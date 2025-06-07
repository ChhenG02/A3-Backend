import { Injectable } from '@nestjs/common';
import { BakongKHQR, khqrData, IndividualInfo } from 'bakong-khqr';
import * as dotenv from 'dotenv';

dotenv.config();

@Injectable()
export class KhqrService {
  generate(amount: number, billNumber: string, mobileNumber?: string) {
    const optionalData = {
      currency: khqrData.currency.usd,
      amount,
      billNumber,
      mobileNumber: mobileNumber || process.env.KHQR_MOBILE_NUMBER,
      storeLabel: process.env.KHQR_STORE_LABEL,
      terminalLabel: process.env.KHQR_TERMINAL_LABEL,
      expirationTimestamp: Date.now() + 2 * 60 * 1000, // 2 minutes
      merchantCategoryCode: '5999',
      isDynamic: true, 
    };

    const individualInfo = new IndividualInfo(
      process.env.KHQR_ID,
      khqrData.currency.usd,
      process.env.KHQR_NAME,
      process.env.KHQR_CITY,
      optionalData,
    );

    const khqr = new BakongKHQR();
    const qrString = khqr.generateIndividual(individualInfo);

    return qrString;
  }

  verify(khqrString: string) {
    const { isValid } = BakongKHQR.verify(khqrString);
    return isValid;
  }
}
