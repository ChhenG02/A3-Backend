// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';
import { StockController } from './stock.controller';
import { StockService } from './stock.service';

// ===========================================================================>> Costom Library

@Module({
  controllers: [StockController],
  providers: [StockService],
})
export class StockModule {}
