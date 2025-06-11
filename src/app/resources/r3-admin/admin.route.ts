// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { DashboardModule } from './a1-dashboard/module';
import { SaleModule } from './a2-sale/module';
import { ProductModule } from './a3-product/product.module';
import { StockModule } from './a4-stock/stock.module';
import { UserModule } from './a5-user/module';
import { SetupModule } from './a6-setup/module';
import { SetupRoutes } from './a6-setup/setup.route';

// ===========================================================================>> Custom Library

export const adminRoutes: Routes = [
  {
    path: 'dashboard',
    module: DashboardModule,
  },
  {
    path: 'sales',
    module: SaleModule,
  },
  {
    path: 'products',
    module: ProductModule,
  },

  {
    path: 'stocks',
    module: StockModule,
  },

  {
    path: 'users',
    module: UserModule,
  },

  {
    path: 'settings',
    children: SetupRoutes,
  },
];
