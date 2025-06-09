import { Injectable } from '@nestjs/common';
import { spawn } from 'child_process';
import { join } from 'path';

@Injectable()
export class KhqrService {
  async generateQr(payload: any): Promise<string> {
    return new Promise((resolve, reject) => {
      const scriptPath = join(
        process.cwd(), // will resolve to: api/
        'src',
        'app',
        'utils',
        'khqr',
        'generate_qr.py'
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
          resolve(result.trim());
        } else {
          reject(`QR generation failed: ${error}`);
        }
      });
    });
  }
}
