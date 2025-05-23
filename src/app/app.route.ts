// ===========================================================================>> Core Library
import { Routes } from '@nestjs/core';

// ===========================================================================>> Custom Library


import { accountRoutes } from './resources/r1-account/account.route';
import { cashierRoutes } from './resources/r2-cashier/cashier.route';

import { utilsRoutes } from './utils/route';
import { testingRoutes } from './resources/r4-testing/testing.route';
import { adminRoutes } from './resources/r3-admin/admin.route';

export const appRoutes: Routes = [{
    path: 'api',
    children: [
        {
            path: 'account',
            children: accountRoutes
        },
        {
            path: 'admin',
            children: adminRoutes
        },
        {
            path: 'cashier',
            children: cashierRoutes
        },
        {
            path: 'share',
            children: utilsRoutes
        },

        {
            path: 'testing',
            children: testingRoutes
        },
    ]
}];