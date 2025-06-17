import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { col, literal, Op, OrderItem } from 'sequelize';
import { FileService } from '@app/services/file.service';
import Product from '@app/models/product/product.model';
import ProductType from '@app/models/setup/type.model';
import User from '@app/models/user/user.model';
import StockStatus from '@app/models/stock/stock_status.model';
import { CreateStockDto, UpdateStockInfoDto, UpdateStockQtyDto } from './stock.dto';
import { List } from './stock.interface';
import { toCambodiaDate } from '@app/core/utils/date.utils';

@Injectable()
export class StockService {
  constructor(private readonly fileService: FileService) {}

  async getSetupData(): Promise<any> {
    try {
      const productTypes = await ProductType.findAll({
        attributes: ['id', 'name'],
      });
      const users = await User.findAll({
        attributes: ['id', 'name'],
      });
      const stockStatuses = await StockStatus.findAll({
        attributes: ['id', 'name', 'min_items', 'max_items'],
      });
      return {
        productTypes,
        users,
        stockStatuses,
      };
    } catch (error) {
      console.error('Error in setup method:', error);
      return {
        status: 'error',
        message: 'stocks/setup',
      };
    }
  }

  async getAll(params?: {
    page?: number;
    limit?: number;
    key?: string;
    type?: number;
    creator?: number;
    startDate?: string;
    endDate?: string;
    sort_by?: string;
    order?: string;
  }): Promise<List | { status: string; message: string }> {
    try {
      const page = Math.max(params?.page || 1, 1);
      const limit = Math.max(params?.limit || 10, 1);

      const start = params?.startDate ? toCambodiaDate(params.startDate) : null;
      const end = params?.endDate ? toCambodiaDate(params.endDate, true) : null;

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
        case 'qty':
          sort.push([col('qty'), sortOrderProcessed]);
          break;
        case 'stock_status_id':
          sort.push([col('stock_status_id'), sortOrderProcessed]);
          break;
        default:
          sort.push([sortFieldProcessed, sortOrderProcessed]);
          break;
      }

      const totalCount = await Product.count({ where });
      const totalPages = Math.ceil(totalCount / limit);
      const safePage = Math.min(page, totalPages === 0 ? 1 : totalPages);
      const offset = (safePage - 1) * limit;

      const { rows } = await Product.findAndCountAll({
        attributes: [
          'id',
          'code',
          'name',
          'image',
          'qty',
          'unit_price',
          'purchase_price',
          'created_at',
        ],
        include: [
          {
            model: ProductType,
            attributes: ['id', 'name'],
            as: 'product_type',
          },
          {
            model: User,
            attributes: ['id', 'name', 'avatar'],
            as: 'creator',
          },
          {
            model: StockStatus,
            attributes: ['id', 'name', 'color', 'avatar', 'min_items', 'max_items'],
            as: 'stock_status',
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
        data: rows,
        pagination: {
          page: safePage,
          limit,
          totalPage: totalPages,
          total: totalCount,
        },
      };
    } catch (error) {
      console.error('Error in getAll method:', error);
      return {
        status: 'error',
        message: 'stocks/getAll',
      };
    }
  }

  async getOne(id: number): Promise<{ data: any; message: string }> {
    try {
      const product = await Product.findByPk(id, {
        attributes: [
          'id',
          'code',
          'name',
          'image',
          'qty',
          'unit_price',
          'purchase_price',
          'created_at',
        ],
        include: [
          {
            model: ProductType,
            attributes: ['id', 'name'],
            as: 'product_type',
          },
          {
            model: User,
            attributes: ['id', 'name', 'avatar'],
            as: 'creator',
          },
          {
            model: StockStatus,
            attributes: ['id', 'name', 'color', 'avatar', 'min_items', 'max_items'],
            as: 'stock_status',
          },
        ],
      });

      if (!product) {
        throw new NotFoundException('Stock not found.');
      }

      return {
        data: product,
        message: 'Stock fetched successfully.',
      };
    } catch (error) {
      console.error('Error in getOne method:', error);
      throw new BadRequestException(error.message || 'stocks/getOne');
    }
  }

  // Helper method to determine stock_status_id based on qty
  private async getStockStatusId(qty: number): Promise<number> {
  const statuses = await StockStatus.findAll({
    attributes: ['id', 'min_items', 'max_items'],
    order: [['min_items', 'ASC']] // Important for correct threshold checking
  });
  for (const status of statuses) {
    if (qty >= status.min_items && qty <= status.max_items) {
      return status.id;
    }
  }

  // If no status matches (shouldn't happen with proper configuration)
  return statuses[0]?.id || null;
}

  async create(
    body: CreateStockDto,
    creator_id: number,
  ): Promise<{ data: Product; message: string }> {
    try {
      const checkExistCode = await Product.findOne({
        where: { code: body.code },
      });
      if (checkExistCode) {
        throw new BadRequestException('This code already exists in the system.');
      }

      const checkExistName = await Product.findOne({
        where: { name: body.name },
      });
      if (checkExistName) {
        throw new BadRequestException('This name already exists in the system.');
      }

      const result = await this.fileService.uploadBase64Image('stock', body.image);
      if (result.error) {
        throw new BadRequestException(result.error);
      }
      body.image = result.file.uri;

      // Determine stock_status_id based on qty
      const stock_status_id = await this.getStockStatusId(body.qty);

      const product = await Product.create({
        ...body,
        creator_id,
        stock_status_id,
      });

      const data = await Product.findByPk(product.id, {
        attributes: [
          'id',
          'code',
          'name',
          'image',
          'qty',
          'unit_price',
          'purchase_price',
          'created_at',
        ],
        include: [
          {
            model: ProductType,
            attributes: ['id', 'name'],
            as: 'product_type',
          },
          {
            model: User,
            attributes: ['id', 'name', 'avatar'],
            as: 'creator',
          },
          {
            model: StockStatus,
            attributes: ['id', 'name', 'color', 'avatar', 'min_items', 'max_items'],
            as: 'stock_status',
          },
        ],
      });

      return {
        data,
        message: 'Stock has been created.',
      };
    } catch (error) {
      console.error('Error in create method:', error);
      throw new BadRequestException(error.message || 'stocks/create');
    }
  }

  async updateInfo(
    id: number,
    body: UpdateStockInfoDto,
  ): Promise<{ data: Product; message: string }> {
    try {
      const product = await Product.findByPk(id);
      if (!product) {
        throw new NotFoundException('Stock not found.');
      }

      if (body.code) {
        const checkExistCode = await Product.findOne({
          where: {
            id: { [Op.not]: id },
            code: body.code,
          },
        });
        if (checkExistCode) {
          throw new BadRequestException('This code already exists in the system.');
        }
      }

      if (body.name) {
        const checkExistName = await Product.findOne({
          where: {
            id: { [Op.not]: id },
            name: body.name,
          },
        });
        if (checkExistName) {
          throw new BadRequestException('This name already exists in the system.');
        }
      }

      if (body.image) {
        const result = await this.fileService.uploadBase64Image('stock', body.image);
        if (result.error) {
          throw new BadRequestException(result.error);
        }
        body.image = result.file.uri;
      } else {
        body.image = undefined;
      }

      await Product.update(body, { where: { id } });

      const data = await Product.findByPk(id, {
        attributes: [
          'id',
          'code',
          'name',
          'image',
          'qty',
          'unit_price',
          'purchase_price',
          'created_at',
        ],
        include: [
          {
            model: ProductType,
            attributes: ['id', 'name'],
            as: 'product_type',
          },
          {
            model: User,
            attributes: ['id', 'name', 'avatar'],
            as: 'creator',
          },
          {
            model: StockStatus,
            attributes: ['id', 'name', 'color', 'avatar', 'min_items', 'max_items'],
            as: 'stock_status',
          },
        ],
      });

      return {
        data,
        message: 'Stock has been updated.',
      };
    } catch (error) {
      console.error('Error in updateInfo method:', error);
      throw new BadRequestException(error.message || 'stocks/updateInfo');
    }
  }

  async updateQty(
    id: number,
    body: UpdateStockQtyDto,
  ): Promise<{ data: Product; message: string }> {
    const transaction = await Product.sequelize.transaction();
    try {
      const product = await Product.findByPk(id, { transaction });
      if (!product) {
        await transaction.rollback();
        throw new NotFoundException('Stock not found.');
      }

      let newQty = product.qty || 0;
      if (body.action === 'ADD') {
        newQty += body.qty;
      } else if (body.action === 'DEDUCT') {
        if (newQty < body.qty) {
          await transaction.rollback();
          throw new BadRequestException('Insufficient stock quantity.');
        }
        newQty -= body.qty;
      }

      // Update stock_status_id based on new qty
      const stock_status_id = await this.getStockStatusId(newQty);

      await Product.update(
        { qty: newQty, stock_status_id },
        { where: { id }, transaction }
      );

      await transaction.commit();

      const data = await Product.findByPk(id, {
        attributes: [
          'id',
          'code',
          'name',
          'image',
          'qty',
          'unit_price',
          'purchase_price',
          'created_at',
        ],
        include: [
          {
            model: ProductType,
            attributes: ['id', 'name'],
            as: 'product_type',
          },
          {
            model: User,
            attributes: ['id', 'name', 'avatar'],
            as: 'creator',
          },
          {
            model: StockStatus,
            attributes: ['id', 'name', 'color', 'avatar', 'min_items', 'max_items'],
            as: 'stock_status',
          },
        ],
      });

      return {
        data,
        message: 'Stock quantity updated successfully.',
      };
    } catch (error) {
      await transaction.rollback();
      console.error('Error in updateQty method:', error);
      throw new BadRequestException(error.message || 'stocks/updateQty');
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const rowsAffected = await Product.destroy({ where: { id } });
      if (rowsAffected === 0) {
        throw new NotFoundException('Stock not found.');
      }
      return { message: 'Stock has been deleted successfully.' };
    } catch (error) {
      console.error('Error in delete method:', error);
      throw new BadRequestException(error.message || 'stocks/delete');
    }
  }
}