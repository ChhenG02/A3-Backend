// ===========================================================================>> Core Library
import {
  BadRequestException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// ============================================================================>> Third Party Library
import { col, literal, Op, OrderItem, where } from 'sequelize';

// ===========================================================================>> Costom Library
import OrderDetails from '@app/models/order/detail.model';
import Order from '@app/models/order/order.model';
import User from '@app/models/user/user.model';
import { FileService } from 'src/app/services/file.service';
import Product from 'src/app/models/product/product.model';

import { CreateProductDto, UpdateProductDto } from './product.dto';
import { List } from './product.interface';
import { Fn, Col, Literal } from 'sequelize/types/utils';
import ProductType from 'src/app/models/setup/type.model';
import Promotion from '@app/models/setup/promotion.model';
import { ApiResponseDto } from '@app/core/dto/response.dto';
export type Orders = Fn | Col | Literal | OrderItem[];

@Injectable()
export class ProductService {
  constructor(private readonly fileService: FileService) {}

  // Method to retrieve the setup data for product types
  async getSetupData(): Promise<any> {
    // Fetch product types
    try {
      const productTypes = await ProductType.findAll({
        attributes: ['id', 'name'],
      });

      // Fetch users
      const users = await User.findAll({
        attributes: ['id', 'name'],
      });
      return {
        productTypes,
        users,
      };
    } catch (error) {
      console.error('Error in setup method:', error); // Log the error for debugging
      return {
        status: 'error',
        message: 'products/setup',
      };
    }
  }

  async getData(params?: {
    page?: number;
    limit?: number;
    key?: string;
    type?: number;
    creator?: number;
    startDate?: string;
    endDate?: string;
    sort_by?: string;
    order?: string;
  }): Promise<
    | { status: string; data: { products: Product[] }; pagination: any }
    | { status: string; message: string }
  > {
    try {
      // Ensure safe pagination values
      const page = Math.max(params?.page || 1, 1);
      const limit = Math.max(params?.limit || 10, 1);

      const toCambodiaDate = (dateString: string, isEndOfDay = false): Date => {
        const date = new Date(dateString);
        const utcOffset = 7 * 60; // UTC+7 offset in minutes
        const localDate = new Date(date.getTime() + utcOffset * 60 * 1000);

        if (isEndOfDay) {
          localDate.setHours(23, 59, 59, 999); // End of day
        } else {
          localDate.setHours(0, 0, 0, 0); // Start of day
        }
        return localDate;
      };

      // Date filtering
      const start = params?.startDate ? toCambodiaDate(params.startDate) : null;
      const end = params?.endDate ? toCambodiaDate(params.endDate, true) : null;

      // Where clause
      const where: any = {
        ...(params?.key && {
          [Op.or]: [
            { code: { [Op.iLike]: `%${params.key}%` } },
            { name: { [Op.iLike]: `%${params.key}%` } },
          ],
        }),
        ...(params?.type && { type_id: Number(params.type) }),
        ...(params?.creator && { creator_id: Number(params.creator) }),
        ...(start && end && { created_at: { [Op.between]: [start, end] } }),
      };

      // Sorting
      const sortFieldProcessed = params?.sort_by || 'id';
      const sortOrderProcessed = ['ASC', 'DESC'].includes(
        (params?.order || 'DESC').toUpperCase(),
      )
        ? (params?.order || 'DESC').toUpperCase()
        : 'DESC';

      const sort: OrderItem[] = [];

      switch (sortFieldProcessed) {
        case 'type_id':
          sort.push([col('type_id'), sortOrderProcessed]);
          break;
        case 'name':
          sort.push([col('name'), sortOrderProcessed]);
          break;
        case 'unit_price':
          sort.push([col('unit_price'), sortOrderProcessed]);
          break;
        case 'total_sale':
          sort.push([literal('"total_sale"'), sortOrderProcessed]);
          break;
        default:
          sort.push([sortFieldProcessed, sortOrderProcessed]);
          break;
      }

      // Count total before pagination
      const totalCount = await Product.count({ where });

      const totalPages = Math.ceil(totalCount / limit);
      const safePage = Math.min(page, totalPages === 0 ? 1 : totalPages);
      const offset = (safePage - 1) * limit;

      // Fetch rows
      const { rows: products } = await Product.findAndCountAll({
        attributes: [
          'id',
          'code',
          'name',
          'image',
          'discount',
          'unit_price',
          'created_at',
          'promotion_id', // Add this line
          [
            literal(`(
                        SELECT SUM(qty) 
                        FROM order_details AS od 
                        WHERE od.product_id = "Product"."id"
                    )`),
            'total_sale',
          ],
        ],
        include: [
          {
            model: ProductType,
            attributes: ['id', 'name'],
          },
          {
            model: User,
            attributes: ['id', 'name', 'avatar'],
          },
        ],
        where,
        distinct: true,
        offset,
        order: sort,
        limit,
      });

      return {
        status: 'success',
        data: {
          products,
        },
        pagination: {
          page: safePage,
          limit,
          totalPage: totalPages,
          total: totalCount,
        },
      };
    } catch (error) {
      console.error('Error in listing method:', error);
      return {
        status: 'error',
        message: 'products/getData',
      };
    }
  }

  async view(product_id: number) {
    const where: any = {
      product_id: product_id,
    };

    const data = await Order.findAll({
      attributes: [
        'id',
        'receipt_number',
        'total_price',
        'platform',
        'ordered_at',
      ],
      include: [
        {
          model: OrderDetails,
          where: where,
          attributes: ['id', 'unit_price', 'qty', 'order_id', 'product_id'],
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'code', 'image', 'promotion_id'],
              include: [{ model: ProductType, attributes: ['name'] }],
            },
          ],
        },
        { model: User, attributes: ['id', 'avatar', 'name'] },
      ],
      order: [['ordered_at', 'DESC']],
      limit: 10,
    });
    return { data: data };
  }

  // Method to create a new product
  async create(
    body: CreateProductDto,
    creator_id: number,
  ): Promise<{ data: Product; message: string }> {
    // Check if the product code already exists
    const checkExistCode = await Product.findOne({
      where: { code: body.code },
    });
    if (checkExistCode) {
      throw new BadRequestException('This code already exists in the system.');
    }

    // Check if the product name already exists
    const checkExistName = await Product.findOne({
      where: { name: body.name },
    });
    if (checkExistName) {
      throw new BadRequestException('This name already exists in the system.');
    }

    const result = await this.fileService.uploadBase64Image(
      'product',
      body.image,
    );
    if (result.error) {
      throw new BadRequestException(result.error);
    }
    // Replace base64 string by file URI from FileService
    body.image = result.file.uri;

    // Create the new product
    const product = await Product.create({
      ...body,
      creator_id,
    });
    const data = await Product.findByPk(product.id, {
      attributes: [
        'id',
        'code',
        'name',
        'image',
        'unit_price',
        'created_at',
        [
          literal(
            `(SELECT COUNT(*) FROM order_details AS od WHERE od.product_id = "Product"."id" )`,
          ),
          'total_sale',
        ],
      ],
      include: [
        {
          model: ProductType,
          attributes: ['id', 'name'],
        },
        {
          model: OrderDetails,
          as: 'pod',
          attributes: [],
        },
        {
          model: User,
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });
    return {
      data: data,
      message: 'Product has been created.',
    };
  }

  // Method to update an existing product
  async update(
    body: UpdateProductDto,
    id: number,
  ): Promise<{ data: Product; message: string }> {
    // Check if the product with the given ID exists
    const checkExist = await Product.findByPk(id);
    if (!checkExist) {
      throw new BadRequestException('No Data found for the provided ID.');
    }

    // Check if the updated code already exists for another product
    const checkExistCode = await Product.findOne({
      where: {
        id: { [Op.not]: id },
        code: body.code,
      },
    });
    if (checkExistCode) {
      throw new BadRequestException('This code already exists in the system.');
    }

    // Check if the updated name already exists for another product
    const checkExistName = await Product.findOne({
      where: {
        id: { [Op.not]: id },
        name: body.name,
      },
    });
    if (checkExistName) {
      throw new BadRequestException('This name already exists in the system.');
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

    // Update the product
    await Product.update(body, {
      where: { id: id },
    });
    const data = await Product.findByPk(id, {
      attributes: [
        'id',
        'code',
        'name',
        'image',
        'unit_price',
        'created_at',
        [
          literal(
            `(SELECT COUNT(*) FROM order_details AS od WHERE od.product_id = "Product"."id" )`,
          ),
          'total_sale',
        ],
      ],
      include: [
        {
          model: ProductType,
          attributes: ['id', 'name'],
        },
        {
          model: OrderDetails,
          as: 'pod',
          attributes: [],
        },
        {
          model: User,
          attributes: ['id', 'name', 'avatar'],
        },
      ],
    });
    // Retrieve and return the updated product
    return {
      data: data,
      message: 'Product has been updated.',
    };
  }

  // Method to delete a product by ID
  async delete(id: number): Promise<{ message: string }> {
    try {
      // Attempt to delete the product
      const rowsAffected = await Product.destroy({
        where: {
          id: id,
        },
      });

      // Check if the product was found and deleted
      if (rowsAffected === 0) {
        throw new NotFoundException('Product not found.');
      }

      return { message: 'This product has been deleted successfully.' };
    } catch (error) {
      // Handle any errors during the delete operation
      throw new BadRequestException(
        error.message ?? 'Something went wrong! Please try again later.',
        'Error Delete',
      );
    }
  }

  async getPromotion(): Promise<any> {
    const current_date = new Date();
    try {
      const promotion = await Promotion.findAll({
        where: {
          start_date: { [Op.lte]: current_date },
          end_date: { [Op.gte]: current_date },
        },
        attributes: ['id', 'discount_value'],
      });
      return ApiResponseDto.success(
        promotion,
        'promotion fetchs successfully',
        200,
      );
    } catch (error) {
      return ApiResponseDto.error(
        error.message || 'Internal server error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async applyPromotion(
    promotion_id: number | null,
    product_ids: number[],
  ): Promise<any> {
    try {
      if (!product_ids || product_ids.length === 0) {
        throw new BadRequestException('No product IDs provided');
      }

      if (promotion_id === null) {
        // Remove promotion from products
        const [updateCount] = await Product.update(
          {
            promotion_id: null,
            discount: 0,
          },
          {
            where: { id: { [Op.in]: product_ids } },
          },
        );

        // Fetch updated products
        const updatedProducts = await Product.findAll({
          where: { id: { [Op.in]: product_ids } },
          include: [Promotion],
        });

        return {
          status: 'success',
          message: `Promotion removed from ${updateCount} products`,
          data: updatedProducts.map((p) => ({
            id: p.id,
            name: p.name,
            original_price: p.unit_price,
            discount_percentage: p.discount || 0,
            final_price: p.unit_price,
            promotion: null,
          })),
        };
      }

      // Apply promotion
      const promotion = await Promotion.findByPk(promotion_id);
      if (!promotion) {
        throw new NotFoundException('Promotion not found');
      }

      // Update products with promotion_id and discount percentage
      const [updateCount] = await Product.update(
        {
          promotion_id: promotion.id,
          discount: promotion.discount_value,
        },
        {
          where: { id: { [Op.in]: product_ids } },
        },
      );

      // Return updated products with their new prices
      const updatedProducts = await Product.findAll({
        where: { id: { [Op.in]: product_ids } },
        include: [Promotion],
      });

      return {
        status: 'success',
        message: `Promotion applied to ${updateCount} products`,
        data: updatedProducts.map((p) => ({
          id: p.id,
          name: p.name,
          original_price: p.unit_price,
          discount_percentage: p.discount,
          final_price: p.unit_price * (1 - (p.discount || 0) / 100),
          promotion: p.promotion,
        })),
      };
    } catch (error) {
      console.error('Error in applyPromotion:', error);
      throw new BadRequestException(
        error.message || 'Failed to apply or remove promotion',
      );
    }
  }
}
