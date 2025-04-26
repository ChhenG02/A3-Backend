// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// ============================================================================>> Custom Library





import { SaleModule } from './a2-sale/module';

import { AdminMiddleware } from 'src/app/core/middlewares/admin.middleware';
import { DeviceTrackerMiddleware } from 'src/app/core/middlewares/device-tracker.middleware';
import { DashboardModule } from './a1-dashboard/module';
import { ProductModule } from './a3-product/module';
import { UserModule } from './a5-user/module';
import { StockModule } from './a4-stock/module';
import { SetupModule } from './a6-setup/module';

// ======================================= >> Code Starts Here << ========================== //
@Module({
    imports: [
        DashboardModule,
        SaleModule,
        ProductModule,
        StockModule,
        UserModule,
        SetupModule,
    ]
})

export class AdminModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(AdminMiddleware, DeviceTrackerMiddleware)
            .forRoutes({ path: 'api/admin/*path', method: RequestMethod.ALL });
    }
}