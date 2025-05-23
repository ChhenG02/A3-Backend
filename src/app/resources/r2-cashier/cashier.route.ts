// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { SaleModule } from './c1-sale/module';
import { OrderModule } from './c2-order/module';

// ===========================================================================>> Custom Library


export const cashierRoutes: Routes = [
    {
        path: 'ordering',
        module: OrderModule
    },
    {
        path: 'sales',
        module: SaleModule
    },
];