import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Res, UseGuards } from "@nestjs/common";
import { PromotionService } from "./service";
import { Response } from "express";
import UserDecorator from "@app/core/decorators/user.decorator";
import User from "@app/models/user/user.model";
import { RolesDecorator } from "@app/core/decorators/roles.decorator";
import { RoleEnum } from "@app/enums/role.enum";
import { RoleGuard } from "@app/core/guards/role.guard";
import { CreatePromotionDto, updatePromotionDto } from "./dto";

@Controller()
export class PromotionController {
    constructor(private readonly promotionService: PromotionService) {}

    @Get()
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async getPromotions(
        @UserDecorator() user: User,
        @Res() res: Response,
        @Query('page') page: number = 1,
        @Query('limit') limit: number = 10
    ): Promise<any> {
        console.log('User ID:', user.id);
        const result = await this.promotionService.getPromotions(page, limit, user.id);
        return res.status(result.statusCode).json(result);
    }

    @Post()
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async createPromotion(
        @UserDecorator() user: User,
        @Res() res: Response,
        @Body() body : CreatePromotionDto
    ): Promise<any> {
        const result = await this.promotionService.createPromotion(user.id, body);
        return res.status(result.statusCode).json(result);
    }

    @Patch(':id')
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async updatePromotion(
        @UserDecorator() user: User,
        @Res() res: Response,
        @Body() body: updatePromotionDto,
        @Param('id') id: number
    ): Promise<any> {
        const result = await this.promotionService.updatePromotion(user.id, id, body);
        return res.status(result.statusCode).json(result);
    }

    @Delete(':id')
    @RolesDecorator(RoleEnum.ADMIN)
    @UseGuards(RoleGuard)
    async deletePromotion(
        @UserDecorator() user: User,
        @Res() res: Response,
        @Param('id') id: number
    ): Promise<any> {
        const result = await this.promotionService.deletePromotion(user.id, id);
        return res.status(result.statusCode).json(result);
    }
    
}