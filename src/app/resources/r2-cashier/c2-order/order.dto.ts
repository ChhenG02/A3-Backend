import { IsEnum, IsJSON, IsNotEmpty } from 'class-validator';
import Product from '@app/models/product/product.model';

export class CreateOrderDto {
    @IsNotEmpty()
    @IsJSON()
    cart: string;

    @IsNotEmpty()
    platform: string;

    @IsNotEmpty()
    @IsEnum(['cash', 'scanpay'])
    payment_method: 'cash' | 'scanpay';
}

export interface ProductWithType extends Omit<Product, 'type'> {
    productType: string;
}