// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';
import { StockController } from './controller';
import { StockService } from './service';

// ===========================================================================>> Costom Library

@Module({
    controllers: [StockController],
    providers: [StockService]
})
export class StockModule { }
