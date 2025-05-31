import Product from '@app/models/product/product.model';
import ProductType from '@app/models/setup/type.model';
import { FileService } from '@app/services/file.service';
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Op, Sequelize } from 'sequelize';
import { CreateProductTypeDto, UpdateProductTypeDto } from './dto';

@Injectable()
export class ProductTypeService {
  constructor(private readonly fileService: FileService) {}

  // ==========================================>> get data
  async getData() {
    try {
      const data = await ProductType.findAll({
        attributes: [
          'id',
          'name',
          'image',
          'created_at',
          [
            Sequelize.fn('COUNT', Sequelize.col('products.id')),
            'n_of_products',
          ],
        ],
        include: [
          {
            model: Product,
            attributes: [], // We don't need any product attributes, just the count
          },
        ],
        group: ['ProductType.id'], // Group by the ProductType id
        order: [['name', 'ASC']], // Order by name
      });

      return {
        data: data,
      };
    } catch (error) {
      throw new BadRequestException('admin/product/type/getData', error);
    }
  }

  // ==========================================>> create
  async create(
    body: CreateProductTypeDto,
  ): Promise<{ data: ProductType; message: string }> {
    // Check for duplicate name
    const checkExistName = await ProductType.findOne({
      where: { name: body.name },
    });

    if (checkExistName) {
      throw new BadRequestException('ឈ្មោះនេះមានក្នុងប្រព័ន្ធ');
    }

    // Upload image
    const result = await this.fileService.uploadBase64Image(
      'product',
      body.image,
    );
    if (result.error) {
      throw new BadRequestException(result.error);
    }

    // Replace base64 string with uploaded file URI
    const imageUri = result.file.uri;

    // Create product type with image URI
    const productType = await ProductType.create({
      name: body.name,
      image: imageUri, //  use uploaded image URI here
    });

    return {
      data: productType,
      message: 'Product type has been created.',
    };
  }

  // ==========================================>> update
  async update(
    body: UpdateProductTypeDto,
    id: number,
  ): Promise<{ data: ProductType; message: string }> {
    const checkExist = await ProductType.findByPk(id);
    if (!checkExist) {
      throw new BadRequestException('No Data in the system');
    }
    if (body.image) {
      const result = await this.fileService.uploadBase64Image(
        'product',
        body.image,
      );
      if (result.error) {
        throw new BadRequestException(result.error);
      }
      // Replace base64 string by file URI from FileService
      body.image = result.file.uri;
    } else {
      body.image = undefined;
    }
    const checkExistName = await ProductType.findOne({
      where: {
        id: { [Op.not]: id },
        name: body.name,
      },
    });
    if (checkExistName) {
      throw new BadRequestException('ឈ្មោះនេះមានក្នុងប្រព័ន្ធ');
    }
    await ProductType.update(body, {
      where: { id: id },
    });

    const dataFormat = {
      data: await ProductType.findByPk(id, {
        attributes: ['id', 'name', 'image', 'updated_at'],
      }),
      message: 'Product type has been created.',
    } as { data: ProductType; message: string };
    return dataFormat;
  }

  // ==========================================>> delete
  async delete(id: number): Promise<{ message: string }> {
    try {
      // Check if there are associated products
      const productsCount = await Product.count({
        where: {
          type_id: id,
        },
      });

      if (productsCount > 0) {
        throw new BadRequestException(
          'Cannot delete. Products are associated with this ProductType.',
        );
      }

      // No associated products, proceed with deletion
      const rowsAffected = await ProductType.destroy({
        where: {
          id: id,
        },
      });

      if (rowsAffected === 0) {
        throw new NotFoundException('Products type not found.');
      }

      return { message: 'Data has been deleted successfully.' };
    } catch (error) {
      throw new BadRequestException(
        error || 'error while deleting product type',
      );
    }
  }
}
