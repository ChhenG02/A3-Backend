// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { OrderModule } from './c2-order/order.module';
import { SaleModule } from './c1-sale/sale.module';


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