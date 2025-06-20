// ===========================================================================>> Core Library
import UserDecorator from '@app/core/decorators/user.decorator';
import User from '@app/models/user/user.model';
import { Controller, Get, Query, Param } from '@nestjs/common';
import { ReportService } from './report.service';

// ===========================================================================>> Custom Library

@Controller()
export class ReportController {
    constructor(private readonly _service: ReportService) {}

    @Get('invoice')
    async generateSaleReportInDay(
        @UserDecorator() auth: User,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string
    ) {
        return this._service.generateSaleReportBaseOnStartDateAndEndDate(startDate, endDate, auth.id);
    }

    @Get('invoice/view/:id')
    async generateInvoiceById(
        @UserDecorator() auth: User,
        @Param('id') id: number
    ) {
        return this._service.generateInvoiceById(id, auth.id);
    }
}