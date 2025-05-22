
import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, ParseIntPipe, Post, Put } from "@nestjs/common";
import { ProductTypeService } from "./service";
import { CreateProductTypeDto, UpdateProductTypeDto } from "./dto";
import ProductType from "@app/models/setup/type.model";

@Controller()
export class ProductTypeController {
    constructor(private readonly _service: ProductTypeService) {}

    // =============================================>> Get Data
  @Get("data")
  async getData(){
    return await this._service.getData();
  }

  // =============================================>> Create
  @Post()
  async create(
    @Body() body: CreateProductTypeDto
  ): Promise<{ data: ProductType; message: string }> {
    return await this._service.create(body);
  }

  // =============================================>> Update
  @Put(":id")
  async update(
    @Param("id", ParseIntPipe) id: number,
    @Body() body: UpdateProductTypeDto
  ): Promise<any> {
    return this._service.update(body, id);
  }

  // =============================================>> Delete
  @Delete(":id")
  @HttpCode(HttpStatus.OK)
  async delete(@Param("id") id: number): Promise<{ message: string }> {
    return await this._service.delete(id);
  }
}