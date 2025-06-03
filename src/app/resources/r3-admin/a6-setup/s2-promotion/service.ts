import { PaginationMeta } from '@app/core/dto/pagination.dto';
import { ApiResponseDto } from '@app/core/dto/response.dto';
import Promotion from '@app/models/setup/promotion.model';
import { BadRequestException, Injectable } from '@nestjs/common';
import { CreateProductDto } from '../../a3-product/dto';
import { CreatePromotionDto, updatePromotionDto } from './dto';
import { start } from 'repl';

@Injectable()
export class PromotionService {
  async getPromotions(
    page: number = 1,
    limit: number = 10,
    userId: number,
  ): Promise<ApiResponseDto<any>> {
    try {
      const { count, rows } = await Promotion.findAndCountAll({
        where: {
          creator_id: userId,
        },
        order: [['created_at', 'DESC']],
      });
      // calculate total pagination
      const totalPages = Math.ceil(count / 10); 
      const offset = (page - 1) * limit; 

      const pagination: PaginationMeta = {
        page: page,
        limit: limit,
        totalCount: count,
        totalPages: totalPages,
        hasNext: page < totalPages,
        hasPrevious: page > 1,
        timestamp: new Date().toISOString(),
      };

      return ApiResponseDto.success(
        { Promotion: rows },
        'Promotions retrieved successfully',
        200,
        pagination,
      );
    } catch (error) {
      return ApiResponseDto.error(
        'Failed to retrieve promotions',
        500,
        error.message || 'Internal Server Error',
        { timestamp: new Date().toISOString() },
      );
    }
  }

  async createPromotion(
    userId: number,
    body: CreatePromotionDto,
  ): Promise<ApiResponseDto<any>> {
    try {
      const startDate = new Date(body.start_date);
      const endDate = new Date(body.end_date);
      const promotion = await Promotion.create({
        creator_id: userId,
        start_date: startDate,
        end_date: endDate,
        discount_value: body.discount_value,
      });

      return ApiResponseDto.success(
        { promotion },
        'Promotion created successfully',
        201,
        { timestamp: new Date().toISOString() },
      );
    } catch (error) {
      return ApiResponseDto.error(
        'Failed to create promotion',
        500,
        error.message || 'Internal Server Error',
        { timestamp: new Date().toISOString() },
      );
    }
  }

  async updatePromotion(
    userId: number,
    id: number,
    body: updatePromotionDto,
  ): Promise<ApiResponseDto<any>> {
    try {
      const promotion = await Promotion.findByPk(id);
      if (!promotion) {
        throw new BadRequestException('Promotion not found with id' + id);
      }
      // Update the promotion with the new data
      await promotion.update({
        start_date: new Date(body.start_date),
        end_date: new Date(body.end_date),
        discount_value: body.discount_value,
        updater_id: userId,
      });

      return ApiResponseDto.success(
        { promotion },
        'Promotion updated successfully',
        200,
        { timestamp: new Date().toISOString() },
      );
    } catch (error) {
      return ApiResponseDto.error(
        'Failed to update promotion',
        500,
        error.message || 'Internal Server Error',
        { timestamp: new Date().toISOString() },
      );
    }
  }

  async deletePromotion(userId: number, id: number): Promise<any> {
    try {
      //check if the promotion exists
      const promotion = await Promotion.findByPk(id);
      if (!promotion) {
        throw new BadRequestException('Promotion not found with id ' + id);
      }

      await Promotion.destroy({ where: { id } });
      return {
        statusCode: 200,
        success: true,
        message: 'Promotion deleted successfully',
        meta: { timestamp: new Date().toISOString() },
      };
    } catch (error) {
      throw new BadRequestException(
        'error occured during was deleting promotion: ' + error.message ||
          'Internal Server Error',
      );
    }
  }
}
