// src/upload/upload.service.ts
import { Injectable } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  PutObjectCommandInput,
} from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

dotenv.config();

@Injectable()
export class UploadService {
  private s3: S3Client;
  private bucket = process.env.MINIO_BUCKET;

  constructor() {
    this.s3 = new S3Client({
      region: process.env.MINIO_REGION,
      endpoint: process.env.MINIO_ENDPOINT, // e.g. http://localhost:9000
      credentials: {
        accessKeyId: process.env.MINIO_ACCESS_KEY,
        secretAccessKey: process.env.MINIO_SECRET_KEY,
      },
      forcePathStyle: true, // required for MinIO
    });
  }

  async uploadFile(file: Express.Multer.File): Promise<string> {
    const key = `uploads/${Date.now()}-${uuidv4()}-${file.originalname}`;

    const params: PutObjectCommandInput = {
      Bucket: this.bucket,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    await this.s3.send(new PutObjectCommand(params));

    // If you're using MinIO, the URL might be in this format:
    return `${process.env.MINIO_ENDPOINT}/${this.bucket}/${key}`;
  }
}
