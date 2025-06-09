// api/src/app/services/khqr.service.ts

import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';

@Injectable()
export class KhqrService {
  async generateQr(payload: any): Promise<{ qr: string; md5: string }> {
    return new Promise((resolve, reject) => {
      const scriptPath = join(
        process.cwd(),
        'src',
        'app',
        'utils',
        'khqr',
        'generate_qr.py',
      );

      const python = spawn('python3', [scriptPath, JSON.stringify(payload)]);

      let result = '';
      let error = '';

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
        console.error('Python stderr:', error);
      });

      python.on('close', (code) => {
        if (code === 0) {
          try {
            const parsed = JSON.parse(result.trim());
            resolve(parsed);
          } catch (err) {
            reject('Failed to parse QR JSON');
          }
        } else {
          reject(`QR generation failed: ${error}`);
        }
      });
    });
  }

  async checkPayment(md5: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const scriptPath = join(
        process.cwd(),
        'src',
        'app',
        'utils',
        'khqr',
        'check_payment.py',
      );

      const python = spawn('python3', [scriptPath, md5]);

      let result = '';
      let error = '';

      python.stdout.on('data', (data) => {
        result += data.toString();
      });

      python.stderr.on('data', (data) => {
        error += data.toString();
      });

      python.on('close', (code) => {
        if (code === 0) {
          resolve(result.trim());
        } else {
          reject(`Check payment failed: ${error}`);
        }
      });
    });
  }
}
