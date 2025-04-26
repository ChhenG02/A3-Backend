// ===========================================================================>> Core Library
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

// ===========================================================================>> Custom Library

import { DeviceTrackerMiddleware } from 'src/app/core/middlewares/device-tracker.middleware';
import { UserMiddleware } from 'src/app/core/middlewares/user.middleware';
import { SaleModule } from './c1-sale/module';
import { OrderModule } from './c2-order/module';


@Module({
    imports: [
        SaleModule,
        OrderModule
    ]
})

export class CashierModule implements NestModule {
    configure(consumer: MiddlewareConsumer) {
        consumer
            .apply(UserMiddleware, DeviceTrackerMiddleware)
            .forRoutes({ path: 'api/cashier/*path', method: RequestMethod.ALL });
    }
}