// ===========================================================================>> Core Library
import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';

// ===========================================================================>> Custom Library
import UserDecorator from '@app/core/decorators/user.decorator';
import User from '@app/models/user/user.model';
import { SaleService } from './sale.service';
import { RoleGuard } from '@app/core/guards/role.guard';
import { RoleEnum } from '@app/enums/role.enum';
import { RolesDecorator } from '@app/core/decorators/roles.decorator';

@Controller()
export class SaleController {
  constructor(private readonly _service: SaleService) {}

  @Get('/setup')
  @UseGuards(RoleGuard)
  @RolesDecorator(RoleEnum.CASHIER, RoleEnum.ADMIN)
  async getUser() {
    return await this._service.getUser();
  }

  @Get()
  async getAllSale(
    @UserDecorator() auth: User,
    @Query('page_size') page_size?: number,
    @Query('page') page?: number,
    @Query('key') key?: string,
    @Query('platform') platform?: string,
    @Query('cashier') cashier?: number, // Add cashier parameter
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    if (!page_size) page_size = 10;
    if (!page) page = 1;
    return await this._service.getData(
      auth.id,
      page_size,
      page,
      key,
      platform,
      cashier,
      startDate,
      endDate,
    );
  }

  @Get(':id/view')
  async view(@Param('id') id: number) {
    return await this._service.view(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: number): Promise<{ message: string }> {
    return await this._service.delete(id);
  }
}
