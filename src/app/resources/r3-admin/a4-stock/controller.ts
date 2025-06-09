import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import { StockService } from "./service";
import UserDecorator from "@app/core/decorators/user.decorator";
import User from "@app/models/user/user.model";
import { RolesDecorator } from "@app/core/decorators/roles.decorator";
import { RoleEnum } from "@app/enums/role.enum";
import { RoleGuard } from "@app/core/guards/role.guard";
import { Response} from 'express'
import AsyncQueue from "sequelize/types/dialects/mssql/async-queue";
import { createProductStockDto, updateProductDto, UpdateStockDto } from "./dto";


@Controller()
export class StockController {
    constructor(private readonly stockService : StockService){}

    @Get()
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async setup(
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
        @Query('endDate') endDate? : string ,
        @Res() res ?: Response
    ): Promise<any>{
        const params = {
            page: page || 1, 
            limit: limit || 10, 
            search, 
            sort, 
            type,
            startDate, 
            endDate}
        const result = await this.stockService.setup(params);
        return res.status(result.statusCode).json(result);
    }

    @Get(':id')
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async view(
        @Param() id : number,
        @UserDecorator() user : User,
        @Res() res : Response
    ){
        const result = await this.stockService.view(id, user.id)
        return res.status(result.statusCode).json(result);
    }

    @Post()
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async createStock(
        @UserDecorator() user : User,
        @Body() body : createProductStockDto,
        @Res() res : Response
    ) : Promise<any>{
        const result = await this.stockService.create(user.id, body);
        return res.status(result.statusCode).json(result);
    }

    @Patch(':id')
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async updateProductStock(
        @UserDecorator() user : User,
        @Body() body : updateProductDto,
        @Param('id') id : number,
        @Res() res : Response
    ) : Promise<any>{
        const result = await this.stockService.updateProduct(user.id, id ,  body);
        return res.status(result.statusCode).json(result);
    }

    @Patch('stock/:id')
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async updateStock(
        @UserDecorator() user : User,
        @Body() body : UpdateStockDto,
        @Param('id', new ParseIntPipe()) id : number,
        @Res() res : Response
    ) : Promise<any>{
        console.log(id)
        const result = await this.stockService.updateStock(user.id, id , body);
        return res.status(result.statusCode).json(result);
    }


    @Delete(':id')
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async deleteStock(@Param('id', new ParseIntPipe()) id : number, @Res() res: Response, @UserDecorator() user : User){
        const result = await this.stockService.deleteStock(id, user.id);
        return res.status(result.statusCode).json(result);
    }

}   