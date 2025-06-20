// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Custom Library
import { ReportService } from './report.service';
import { ReportController } from './report.controller';
import { SaleModule } from '@app/resources/r2-cashier/c1-sale/sale.module';
import { JsReportService } from '@app/services/js-report.service';

@Module({
  providers: [ReportService, JsReportService], 
  controllers: [ReportController],
  imports: [SaleModule], 
})
export class ReportModule {}