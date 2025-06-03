// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';
import { ProductTypeModule } from './s1-type/module';
import { PromotionModule } from './s1-promotion/module';
import { StockStatusModule } from './s3-stock_status/module';

// ===========================================================================>> Costom Library

@Module({
    imports: [
        ProductTypeModule,
        PromotionModule,
        StockStatusModule
    ]
})
export class SetupModule { 

}
