// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { ProductTypeModule } from './s1-type/module';
import { StockStatusModule } from './s3-stock_status/module';
import { PromotionModule } from './s2-promotion/module';

// ===========================================================================>> Custom Library

export const SetupRoutes: Routes = [
  {
    path: 'products/types',
    module: ProductTypeModule,
  },
  {
    path: 'promotion',
    module: PromotionModule
  },
  {
    path: 'stock_status',
    module : StockStatusModule
  }
];
