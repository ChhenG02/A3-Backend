// ===========================================================================>> Core Library
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UsePipes,
  Res
} from '@nestjs/common';
import { Response } from 'express';

// ===========================================================================>> Costom Library
import UserDecorator from '@app/core/decorators/user.decorator';

import User from '@app/models/user/user.model';
import Product from 'src/app/models/product/product.model';
import { CreateProductDto, UpdateProductDto } from './product.dto';
import { ProductService } from './product.service';
import { ProductTypeExistsPipe } from '@app/core/pipes/product.pipe';
import Promotion from '@app/models/setup/promotion.model';
@Controller()
export class ProductController {
  constructor(private _service: ProductService) {}

  @Get('setup-data')
  async setup() {
    return await this._service.getSetupData();
  }

  @Get('promotions')
  async getPromotions(@Res() res: Response): Promise<any> {
    const result = await this._service.getPromotion();
    return res.status(result.statusCode).json(result);
  }

  @Get('/')
  async getData(
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('key') key?: string,
    @Query('type') type?: number,
    @Query('creator') creator?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('sort_by') sort_by?: string,
    @Query('order') order?: string,
  ) {
    // Set defaul value if not defined.
    page = !page ? 10 : page;
    limit = !limit ? 10 : limit;
    key = key === undefined ? null : key;

    const params = {
      page,
      limit,
      key,
      type,
      creator,
      startDate,
      endDate,
      sort_by,
      order,
    };

    return await this._service.getData(params);
  }

  @Post('promotion')
  async applyPromotion(
    @Body() body : {promotionId : number, productIds : number[]}
  ): Promise<any>{
    return this._service.applyPromotion(body.promotionId, body.productIds);
  }

  @Get('/:id')
  async view(@Param('id', ParseIntPipe) id: number) {
    return await this._service.view(id);
  }

  @Post()
  @UsePipes(ProductTypeExistsPipe)
  async create(
    @Body() body: CreateProductDto,
    @UserDecorator() auth: User,
  ): Promise<{ data: Product; message: string }> {
    return await this._service.create(body, auth.id);
  }

  @Put(':id')
  @UsePipes(ProductTypeExistsPipe)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateProductDto,
  ) {
    return this._service.update(body, id);
  }

  @Delete(':id')
  async delete(@Param('id') id: number): Promise<{ message: string }> {
    return await this._service.delete(id);
  }

}
