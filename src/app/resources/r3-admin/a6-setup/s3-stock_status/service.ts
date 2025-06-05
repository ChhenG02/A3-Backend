import { PaginationMeta } from "@app/core/dto/pagination.dto";
import { ApiResponseDto } from "@app/core/dto/response.dto";
import StockStatus from "@app/models/stock/stock_status.model";
import { BadRequestException, HttpStatus, Injectable } from "@nestjs/common";
import { CreateStockStatusDto, UpdateStockStatusDto } from "./dto";
import { FileService } from "@app/services/file.service";


@Injectable()
export class StockStatusService{
    constructor (private readonly fileSerive : FileService){}

    private isValidBase64(str: string): boolean {
        const base64Pattern = /^data:image\/(jpeg|png|gif|bmp|webp);base64,[a-zA-Z0-9+/]+={0,2}$/;
        return base64Pattern.test(str);
    }

    async getAll(page: number = 1, limit: number = 10, userId : number): Promise<ApiResponseDto<any>> {
        
        try{
            const {count, rows} = await StockStatus.findAndCountAll({
                attributes: ['id', 'name', 'color', 'min_items', 'max_items', 'created_at'],
                order: [['created_at', 'DESC']],
            });
           // calculate total pagination
           const totalPages = Math.ceil(count / 10); // Assuming a limit of 10 items per page
           const offset = (page - 1) * limit; // Calculate offset based on the current page

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
                {StockStatus: rows},
                'Stock Status retrieved successfully',
                200,
                pagination
            )
        }catch (error) {
            return ApiResponseDto.error(
                'Failed to retrieve stock-status',
                500,
                error.message || 'Internal Server Error',
                { timestamp: new Date().toISOString() }
            )
        }

    }

    async createStockStatus(userId : number, body : CreateStockStatusDto): Promise<ApiResponseDto<any>>{
        try{
            // check if the image exists and  it's not already a file base64
        if(body.avatar && !body.avatar.startsWith('upload/file/')){
            if(this.isValidBase64(body.avatar)){
                // upload the base64 image format into file service 
                const result = await this.fileSerive.uploadBase64Image('stock_status', body.avatar);
                if(result.error){
                    // Trow the error if the upload fails
                    throw new BadRequestException(result.error, 'Not matchs the format of image provided');
                };
                // Replace the base64 string with the file URI from the file service
                body.avatar = result?.file.uri;
            }else{
                throw new BadRequestException('Ivalid base64 image format')
            }
        }

        const stock_status = await StockStatus.create({
            name: body.name,
            color : body.color,
            avatar : body.avatar || null,
            min_items : body.min_items,
            max_items : body.max_items
        });

        return ApiResponseDto.success(
            {stock_status},
            'stock status creates successfully',
            200,
            {timestamp: new Date().toISOString()}
        )
        }catch(error){
            return ApiResponseDto.error(
                error.message || 'Internal server error',
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async updateStockStatus(userId : number, id : number,  body : UpdateStockStatusDto): Promise<ApiResponseDto<any>>{
        try{
            // check if stock status exists or not 
            const stockStatus = await StockStatus.findByPk(id);
            if(!stockStatus){
                throw new BadRequestException('stock status is not found')
            } 
            // check if the image exists and  it's not already a file base64
            if(body.avatar && !body.avatar.startsWith('upload/file/')){
                if(this.isValidBase64(body.avatar)){
                    // upload the base64 image format into file service 
                    const result = await this.fileSerive.uploadBase64Image('stock_status', body.avatar);
                    if(result.error){
                        // Trow the error if the upload fails
                        throw new BadRequestException(result.error, 'Not matchs the format of image provided');
                    };
                    // Replace the base64 string with the file URI from the file service
                    body.avatar = result?.file.uri;
                }else{
                    throw new BadRequestException('Ivalid base64 image format')
                }
            }

            await StockStatus.update({
                name: body.name,
                color : body.color,
                avatar : body.avatar || null,
                min_items : body.min_items,
                max_items : body.max_items
            }, {where: {id : id}})

            const getstockStatus = await StockStatus.findOne({
                where: {id : id},
                attributes: ['id', 'name', 'color', 'avatar', 'min_items', 'max_items']
            })

            return ApiResponseDto.success(
                getstockStatus,
                'stock status updated successfully',
                200,
            )
        }catch(error){
            return ApiResponseDto.error(
                error.message  || 'Internal server error',
                500
            )
        }
    }

    async deleteStockStatus(userId : number, id : number): Promise<ApiResponseDto<any>>{
        try{
            // check if the stock status exists or not
            const  stockStatus = await StockStatus.findByPk(id);
            if(!stockStatus){
                throw new BadRequestException('stock status is not found')
            }
            await StockStatus.destroy({where: {id : id}});

            return ApiResponseDto.success(
                'stock status deleted successfully',
            )
        }catch(error){
            return ApiResponseDto.error(
                error.message || 'Internal sevrer error',
                500
            )
        }
    }

}