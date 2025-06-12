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
} from '@nestjs/common';
import { StockService } from './stock.service';
import { CreateStockDto, UpdateStockInfoDto, UpdateStockQtyDto } from './stock.dto';
import UserDecorator from '@app/core/decorators/user.decorator';
import User from '@app/models/user/user.model';
import { ProductTypeExistsPipe } from '@app/core/pipes/product.pipe';

@Controller()
export class StockController {
  constructor(private readonly stockService: StockService) {}

  @Get('setup-data')
  async getSetupData() {
    return await this.stockService.getSetupData();
  }

  @Get()
  async getAll(
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
    return await this.stockService.getAll(params);
  }

  @Get(':id')
  async getOne(@Param('id', ParseIntPipe) id: number) {
    return await this.stockService.getOne(id);
  }

  @Post()
  @UsePipes(ProductTypeExistsPipe)
  async create(
    @Body() body: CreateStockDto,
    @UserDecorator() auth: User,
  ) {
    return await this.stockService.create(body, auth.id);
  }

  @Put(':id')
  @UsePipes(ProductTypeExistsPipe)
  async updateInfo(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStockInfoDto,
  ) {
    return await this.stockService.updateInfo(id, body);
  }

  @Put(':id/qty')
  async updateQty(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: UpdateStockQtyDto,
  ) {
    return await this.stockService.updateQty(id, body);
  }

  @Delete(':id')
  async delete(@Param('id', ParseIntPipe) id: number) {
    return await this.stockService.delete(id);
  }
}