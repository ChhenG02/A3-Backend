import { IsNotEmpty, IsNumber, IsDate, IsString, IsDateString } from "class-validator";

export class CreatePromotionDto {
  @IsNumber()
  @IsNotEmpty()
  discount_value: number;

  @IsNotEmpty()
  @IsDateString()
  start_date: string;

  @IsNotEmpty()
  @IsDateString()
  end_date: string;
}

export class updatePromotionDto extends CreatePromotionDto{};