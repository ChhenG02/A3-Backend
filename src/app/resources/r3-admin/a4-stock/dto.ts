import ProductType from "@app/models/setup/type.model";
import { IsEnum, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString , Min} from "class-validator";


export class createProductStockDto{

    @IsOptional()
    @IsString()
    avatar? : string;

    @IsString()
    @IsNotEmpty()
    name : string;

    @IsString()
    @IsNotEmpty()
    code : string;

    @IsNumber()
    @IsNotEmpty()
    product_typ : number;

    @IsNumber()
    @IsNotEmpty()
    quanity : number;

    @IsNumber()
    @IsNotEmpty()
    unit_price : number;

    @IsNumber()
    @IsNotEmpty()
    selling_price : number;

}

export class updateProductDto{

    @IsOptional()
    @IsString()
    avatar : string;

    @IsString()
    @IsNotEmpty()
    name : string;

    @IsString()
    @IsNotEmpty()
    code : string;

    @IsNumber()
    @IsNotEmpty()
    product_typ : number;

    @IsNumber()
    @IsNotEmpty()
    quanity : number;

    @IsNumber()
    @IsNotEmpty()
    unit_price : number;

    @IsNumber()
    @IsNotEmpty()
    selling_price : number;

}


export enum StockAction {
    ADD = 'add',
    DEDUCT = 'deduct'
}

export class UpdateStockDto {
  @IsEnum(StockAction)
  @IsNotEmpty()
  action: StockAction;

  @IsInt()    
  @Min(1)
  @IsNotEmpty()
  quantity: number;
}