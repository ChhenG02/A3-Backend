// ===========================================================================>> Custom Library
import { IsBase64Image } from '@app/core/decorators/base64-image.decorator';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateProductTypeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @IsBase64Image({
    message: 'Invalid image format. Image must be base64 encoded JPEG or PNG.',
  })
  image: string;
}

export class UpdateProductTypeDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @IsBase64Image({
    message: 'Invalid image format. Image must be base64 encoded JPEG or PNG.',
  })
  image?: string;
}
