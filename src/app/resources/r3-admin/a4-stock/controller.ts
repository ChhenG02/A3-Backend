import { Body, Controller, Get, Query } from "@nestjs/common";
import { StockService } from "./service";
import UserDecorator from "@app/core/decorators/user.decorator";
import User from "@app/models/user/user.model";


@Controller()
export class StockController {
    constructor(private readonly stockService : StockService){}

    @Get()
    async view(
        @UserDecorator() user : User,
        //=====================> pagiantion
        @Query('page') page? : number,
        @Query('limit') limit? : number,
        //=====================> filter
        @Query('search') search? : string,
        @Query('sort') sort? : string,
        @Query('type') type? : string,
        //====================> Date Range
        @Query('startDate') startDate? : string,
        @Query('endDate') endDate? : string 
    ): Promise<any>{
        const params = {
            page: page || 1, 
            limit: limit || 10, 
            search, 
            sort, 
            type,
            startDate, 
            endDate}
        const result = await this.stockService.view(params)
    }

    // async createStock(
    //     @UserDecorator() user : User,
    //     @Body() body : createStockDto
    // ) : Promise<any>{

    // }

}   