import { Module } from "@nestjs/common";
import { PromotionController } from "./controller";
import { PromotionService } from "./service";


@Module({
    controllers: [PromotionController],
    providers: [PromotionService],
})
export class PromotionModule {}