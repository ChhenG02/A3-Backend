import { IsNotEmpty, IsNumber, IsOptional, IsString, Min } from "class-validator";


export class CreateStockStatusDto{

    @IsString()
    @IsNotEmpty()
    status_name : string;

    @IsString()
    @IsNotEmpty()
    status_color : string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    min_items : number;

    @IsNumber()
    @IsNotEmpty()
    max_items : number;

    @IsString()
    @IsOptional()
    avatar? : string;
}

export class UpdateStockStatusDto{


    @IsString()
    @IsNotEmpty()
    status_name : string;

    @IsString()
    @IsNotEmpty()
    status_color : string;

    @IsNumber()
    @IsNotEmpty()
    @Min(0)
    min_items : number;

    @IsNumber()
    @IsNotEmpty()
    max_items : number;

    @IsString()
    @IsOptional()
    avatar? : string;
}