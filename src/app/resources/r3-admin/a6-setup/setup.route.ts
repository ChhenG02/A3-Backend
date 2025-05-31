// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';
import { ProductTypeModule } from './s1-type/module';
import { PromotionModule } from './s1-promotion/module';

// ===========================================================================>> Custom Library

export const SetupRoutes: Routes = [
  {
    path: 'products/types',
    module: ProductTypeModule,
  },
  {
    path: 'promotion',
    module: PromotionModule
  }
];
