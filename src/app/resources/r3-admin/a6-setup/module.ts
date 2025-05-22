// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';
import { ProductTypeModule } from './s1-type/module';

// ===========================================================================>> Costom Library

@Module({
    imports: [
        ProductTypeModule
    ]
})
export class SetupModule { 

}
