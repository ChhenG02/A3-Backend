import { IsNotEmpty, IsNumber, IsDate } from "class-validator";

export class CreatePromotionDto {
  @IsNumber()
  @IsNotEmpty()
  discount_value: number;

  @IsDate()
  @IsNotEmpty()
  start_date: Date;

  @IsDate()
  @IsNotEmpty()
  end_date: Date;
}

export class updatePromotionDto extends CreatePromotionDto{};