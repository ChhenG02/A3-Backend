import { IsNotEmpty, IsNumber, IsOptional, IsPositive, IsString } from 'class-validator';
import { IsBase64Image } from '@app/core/decorators/base64-image.decorator';

export class CreateStockDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsNumber()
  @IsPositive()
  type_id: number;

  @IsNumber()
  @IsPositive()
  qty: number;

  @IsNumber()
  @IsPositive()
  purchase_price: number;

  @IsNumber()
  @IsPositive()
  unit_price: number;

  @IsString()
  @IsNotEmpty()
  @IsBase64Image({ message: 'Invalid image format. Image must be base64 encoded JPEG or PNG.' })
  image: string;
}

export class UpdateStockInfoDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  code?: string;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  type_id?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  purchase_price?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  unit_price?: number;

  @IsOptional()
  @IsString()
  @IsBase64Image({ message: 'Invalid image format. Image must be base64 encoded JPEG or PNG.' })
  image?: string;
}

export class UpdateStockQtyDto {
  @IsNumber()
  @IsPositive()
  qty: number;

  @IsString()
  @IsNotEmpty()
  action: 'ADD' | 'DEDUCT';
}