import { Module } from "@nestjs/common";
import { StockStatusController } from "./controller";
import { StockStatusService } from "./service";
import { FileService } from "@app/services/file.service";



@Module({
    controllers: [StockStatusController],
    providers: [StockStatusService, FileService]
})
export class StockStatusModule {}