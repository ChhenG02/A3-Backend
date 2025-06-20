// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Costom Library
import { SaleService } from './sale.service';
import { SaleController } from './sale.controller';

@Module({
  providers: [SaleService],
  controllers: [SaleController],
  imports: [],
  exports: [SaleService],
})
export class SaleModule {}
