import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import { StockStatusService } from "./service";
import UserDecorator from "@app/core/decorators/user.decorator";
import User from "@app/models/user/user.model";
import { RoleEnum } from "@app/enums/role.enum";
import { RoleGuard } from "@app/core/guards/role.guard";
import { RolesDecorator } from "@app/core/decorators/roles.decorator";
import {Response} from 'express'
import { CreateStockStatusDto, UpdateStockStatusDto } from "./dto";


@Controller()
export class StockStatusController {
    constructor(private readonly stockStatusService : StockStatusService){}

    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    @Get()
    async getAll(
        @UserDecorator() user : User,
        @Query('page') page? : number,
        @Query('limit') limit? : number,
        @Res() res?: Response
    ): Promise<any>{
        const result = await this.stockStatusService.getAll(page, limit, user.id);
        return res.status(result.statusCode).json(result);
    }


    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    @Post()
    async createStock(
        @UserDecorator() user : User,
        @Body() Body : CreateStockStatusDto,
        @Res() res : Response
    ) : Promise<any>{
        const result = await this.stockStatusService.createStockStatus(user.id, Body);
        return res.status(result.statusCode).json(result);
    }

    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    @Patch(':id')
    async updateStock(
        @UserDecorator() user : User,
        @Param('id') id : number,
        @Body() Body : UpdateStockStatusDto,
        @Res() res : Response
    ) : Promise<any>{
        const result = await this.stockStatusService.updateStockStatus(user.id, id , Body);
        return res.status(result.statusCode).json(result);
    }

    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    @Delete(':id')
    async deleteStockStatus (
        @UserDecorator() user : User,
        @Param('id') id : number,
        @Res() res : Response
    ): Promise<any>{
        const result = await this.stockStatusService.deleteStockStatus(user.id, id);
        return res.status(result.statusCode).json(result);
    }

}