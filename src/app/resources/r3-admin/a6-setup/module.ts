// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';
import { ProductTypeModule } from './s1-type/module';
import { PromotionModule } from './s1-promotion/module';

// ===========================================================================>> Costom Library

@Module({
    imports: [
        ProductTypeModule,
        PromotionModule
    ]
})
export class SetupModule { 

}
