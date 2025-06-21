// ===========================================================================>> Core Library
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// ===========================================================================>> Third party Library
import { Op, Sequelize } from 'sequelize';

// ===========================================================================>> Custom Library
import OrderDetails from '@app/models/order/detail.model';
import Product from '@app/models/product/product.model';
import ProductType from '@app/models/setup/type.model';
import User from '@app/models/user/user.model';
import Order from 'src/app/models/order/order.model';
import { List } from './sale.interface';
import Payment from '@app/models/payment/payment.model';
import { ApiResponseDto } from '@app/core/dto/response.dto';

@Injectable()
export class SaleService {
  async getUser(): Promise<any> {
    const data = await User.findAll({
      attributes: ['id', 'name'],
    });
    return ApiResponseDto.success(
      data,
      'User list retrieved successfully.',
      200
    )
  }

  async getData(
    userId: number,
    page_size: number = 10,
    page: number = 1,
    key?: string,
    platform?: string,
    cashier?: number,
    startDate?: string,
    endDate?: string,
  ) {
    try {
      const offset = (page - 1) * page_size;
      const toCambodiaDate = (dateString: string, isEndOfDay = false): Date => {
        const date = new Date(dateString);
        const utcOffset = 7 * 60;
        const localDate = new Date(date.getTime() + utcOffset * 60 * 1000);
        if (isEndOfDay) localDate.setHours(23, 59, 59, 999);
        else localDate.setHours(0, 0, 0, 0);
        return localDate;
      };
      const start = startDate ? toCambodiaDate(startDate) : null;
      const end = endDate ? toCambodiaDate(endDate, true) : null;
      const where: any = {
        cashier_id: cashier || userId, // Use cashier if provided, else userId
        [Op.and]: [
          key
            ? Sequelize.where(
                Sequelize.literal(`CAST("receipt_number" AS TEXT)`),
                { [Op.like]: `%${key}%` },
              )
            : null,
          platform !== null && platform !== undefined ? { platform } : null,
          start && end ? { ordered_at: { [Op.between]: [start, end] } } : null,
        ].filter(Boolean),
      };
      const data = await Order.findAll({
        attributes: [
          'id',
          'receipt_number',
          'sub_total_price',
          'total_price',
          'platform',
          'ordered_at',
        ],
        include: [
          {
            model: OrderDetails,
            attributes: ['id', 'unit_price', 'qty'],
            include: [
              {
                model: Product,
                attributes: ['id', 'name', 'code', 'image', 'discount', 'promotion_id'],
                include: [{ model: ProductType, attributes: ['name'] }],
              },
            ],
          },
          { model: User, attributes: ['id', 'avatar', 'name'] },
          { model: Payment, attributes: ['payment_method'] }, // Include payment method
        ],
        where: where,
        order: [['ordered_at', 'DESC']],
        limit: page_size,
        offset,
      });
      const totalCount = await Order.count({ where });
      const totalPages = Math.ceil(totalCount / page_size);
      const dataFormat: List = {
        status: 'success',
        data: data,
        pagination: {
          currentPage: page,
          perPage: page_size,
          totalItems: totalCount,
          totalPages: totalPages,
        },
      };
      return dataFormat;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  // sale.service.ts, in the view method
  async view(id: number) {
    try {
      const data = await Order.findByPk(id, {
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
            attributes: ['id', 'unit_price', 'qty'],
            include: [
              {
                model: Product,
                attributes: [
                  'id',
                  'name',
                  'code',
                  'image',
                  'promotion_id',
                  'discount',
                ],
                include: [
                  {
                    model: ProductType,
                    attributes: ['name'],
                  },
                ],
              },
            ],
          },
          {
            model: User,
            attributes: ['id', 'avatar', 'name'],
          },
          { model: Payment, attributes: ['payment_method'] }, // Include payment method
        ],
      });

      if (!data) {
        throw new NotFoundException('Sale record not found.');
      }

      const dataFormat = {
        status: 'success',
        data: data,
      };

      return dataFormat;
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  async delete(id: number): Promise<{ message: string }> {
    try {
      const rowsAffected = await Order.destroy({
        where: {
          id: id,
        },
      });

      if (rowsAffected === 0) {
        throw new NotFoundException('Sale record not found.');
      }

      return { message: 'This order has been deleted successfully.' };
    } catch (error) {
      throw new BadRequestException(
        error.message ?? 'Something went wrong!. Please try again later.',
        'Error Delete',
      );
    }
  }
}