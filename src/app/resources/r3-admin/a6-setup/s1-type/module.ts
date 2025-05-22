import { Module } from "@nestjs/common";
import { ProductTypeService } from "./service";
import { ProductTypeController } from "./controller";

@Module({
    providers:[ProductTypeService],
    controllers:[ProductTypeController],
})
export class ProductTypeModule {}