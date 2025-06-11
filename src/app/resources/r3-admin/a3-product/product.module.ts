// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Third Party Library

// ===========================================================================>> Costom Library
// Custom Components:
import { FileService } from 'src/app/services/file.service'; // for uploading file


import { ProductService } from './product.service';
import { ProductController } from './product.controller';

@Module({
  controllers: [ProductController],
  providers: [FileService, ProductService],
})
export class ProductModule {}
