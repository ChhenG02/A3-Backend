import { PaginationMeta } from "@app/core/dto/pagination.dto";
import { ApiResponseDto } from "@app/core/dto/response.dto"
import { toCambodiaDate } from "@app/core/utils/date.utils"
import OrderDetails from "@app/models/order/detail.model";
import Product from "@app/models/product/product.model";
import ProductType from "@app/models/setup/type.model";
import Stock from "@app/models/stock/stock.model";
import User from "@app/models/user/user.model";
import { BadRequestException, HttpStatus, Injectable, InternalServerErrorException } from "@nestjs/common";
import { createProductStockDto, StockAction, updateProductDto, UpdateStockDto } from "./dto";
import StockStatus from "@app/models/stock/stock_status.model";
import { FileService } from "@app/services/file.service";
import { Sequelize, Op, where } from "sequelize";




@Injectable()
export class StockService {

    constructor(private readonly fileSerive : FileService){}
    private isValidBase64(str: string): boolean {
        const base64Pattern = /^data:image\/(jpeg|png|gif|bmp|webp);base64,[a-zA-Z0-9+/]+={0,2}$/;
        return base64Pattern.test(str);
    }

    
    async setup(
        params?:{
            page?: number,
            limit?: number,
            search?: string,
            sort_by?: string,
            type?: string
            startDate?: string,
            endDate?: string
        },
    ): Promise<ApiResponseDto<any>>{

        try{
            // Calculate offset for pagination
        const offset = (params?.page - 1) * params?.limit;

        // Calculate start and end dates for the filter
        const start = params?.startDate ? toCambodiaDate(params.startDate) : null;
        const end = params?.endDate ? toCambodiaDate(params.endDate) : null;

        //Construct the `where` cluase 
        const where : any = {
            ...(params?.search
                ? {
                    [Op.or] : [
                        {name : {[Op.like]: `%${params?.search}%`}}
                    ]
                }: {}
            ),
            ...(params?.type ? { type: Number(params?.type)} : {}),
            ...(start && end ? {created_at: {[Op.between] : [start, end]}} : {})
        };
        if(params?.type){
            where["type_id"] = params.type
        }
        
        let order : any[] = [];
        
        // switch(params?.sort_by){
        //     case 'high-to-low': 
        //     order = [[{model: Product, as: 'product'}, 'qty', 'DESC']];
        //     break
        //     case 'low-to-high':
        //     order = [[{model: Product, as: 'product'}, 'qty', 'ASC']];
        //     break
        //     default : 
        //     order = [[{model : Product, as: 'product'}, 'id', 'ASC']]
        //     break
        // }

        // Retrieves Product with associated product stock 
        const { rows, count } = await Product.findAndCountAll({
  attributes: ['id', 'name', 'image', 'qty', 'unit_price', 'purchase_price', 'created_at'],
  include: [
    {
      model: User,
      as: 'creator',
      attributes: ['id', 'name', 'avatar'],
      required: false,  // Optional association
    },
    {
      model: ProductType,
      as: 'product_type',
      attributes: ['id', 'name', 'image'],
      required: false,  // Optional association
    },
  ],
  where: { ...where },
  order: [['qty', params?.sort_by === 'high-to-low' ? 'DESC' : 'ASC']],  // Simplified sort
  offset: offset,
  limit: params?.limit,
});

        // calculate total pages
        const totalPages = Math.ceil(count / params?.limit);
        const pagination : PaginationMeta =  {
            page: params?.page,
            limit: params?.limit,
            totalCount: count,
            totalPages: totalPages,
            hasNext: params?.page < totalPages,
            hasPrevious: totalPages < 1,
            timestamp: new Date().toISOString()
        }
        const formattedData = rows.map(row => ({
  id: row.id,
  name: row.name,
  image: row.image,
  qty: row.qty,  // Include quantity in response
  unit_price: row.unit_price,
  created_at: row.created_at,
  creator: row.creator ? {
    id: row.creator.id,
    name: row.creator.name,
    avatar: row.creator.avatar,
  } : null,
  product_type: row.product_type ? {
    id: row.product_type.id,
    name: row.product_type.name,
    image: row.product_type.image,  // Fixed typo
  } : null,
}));

        return ApiResponseDto.success(
            {data : formattedData},
            'product with stock fetch successfully',
            200,
            pagination
        )
        }catch(error){
            return ApiResponseDto.error(
                error.message || 'error server',
                HttpStatus.BAD_REQUEST
            )
        }
    }

    async view(id : number, userId : number): Promise<ApiResponseDto<any>>{
        try{
            // check if the product stock exists
            const product = await Product.findOne({
                where: {id : id},
                attributes: ['id', 'code', 'name', 'image', 'unit_price', 'qty' ,'purchase_price', 'created_at'],
                include: [
                    {
                        model: ProductType,
                        as : 'product_type',
                        attributes: ['id', 'name', 'image']
                    },
                    {
                        model: StockStatus,
                        as: 'stock-status',
                        attributes: ['id', 'name', 'color', 'avatar', 'min_items', 'max_items']
                    },
                ]
            })

            const responseData = {
                id : product.id,
                name : product.name,
                image : product.image,
                unit_price : product.unit_price,
                purchase_price : product.purchase_price,
                qty : product.qty,
                created_at : product.created_at,
                product_type : {
                    id : product.product_type.id,
                    name : product.product_type.name,
                    image : product.product_type.image
                },
                stock_status : {
                    id : product.stock_status.id,
                    name : product.stock_status.name,
                    color : product.stock_status.color,
                    avatar : product.stock_status.avatar || null,
                    min_items : product.stock_status.min_items,
                    max_items :product.stock_status.max_items
                }
            };

            return ApiResponseDto.success(
                {product: responseData},
                'product stock fetched successfully',
                200
            )
        }catch(error){
            return ApiResponseDto.error(
                error.message || ''
            )
        }
    }

    async create(userId : number, body : createProductStockDto): Promise<ApiResponseDto<any>>{
        try{
            // check if product stock exists 
            const productStock = await Product.findOne({where: {name : body.name}});
            if(productStock){
                throw new BadRequestException('product exists in the product stock')
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

            const product = await Product.create({
                name : body.name,
                code: body.code,
                image : body.avatar,
                type_id : body.product_typ,
                creator_id: userId,
                qty: body.quanity,
                purchase_price: body.unit_price,
                unit_price: body.selling_price
            })

            return ApiResponseDto.success(
                {product: product},
                'product stock created successfully',
                200
            )

        }catch(error){
            return ApiResponseDto.error(
                error.message || 'Internal Server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

    async updateProduct(userId: number, id : number , body : updateProductDto): Promise<ApiResponseDto<any>>{
        try{
            // check if product exsits 
            const product = await Product.findByPk(id);
            if(!product){
                throw new BadRequestException('product not found ')
            }
            console.log(body);

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

            const productupdate = await Product.update({
                name: body.name,
                image : body.avatar,
                code : body.code,
                type_id: body.product_typ,
                purchase_price : body.unit_price,
                qty : body.quanity,
                unit_price : body.selling_price
            }, {where: {id: id}})

            return ApiResponseDto.success(
                {updateStock : productupdate},
                'Product stock updated successfully',
                200
            )
        }catch(error){
            return ApiResponseDto.error(
                error.message || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

async updateStock(userId: number, id: number, body: UpdateStockDto): Promise<any> {
  const transaction = await Product.sequelize.transaction();
  try {
    // Find product with transaction
    const product = await Product.findOne({
      where: { id },
      transaction,
      rejectOnEmpty: false 
    });

    if (!product) {
      await transaction.rollback();
      throw new BadRequestException('Product not found');
    }

    // Initialize qty if null
    if (product.qty === null || product.qty === undefined) {
      product.qty = 0;
    }

    // Handle stock actions
    if (body.action === StockAction.ADD) {
      product.qty += body.quantity;
    } else if (body.action === StockAction.DEDUCT) {
      if (product.qty < body.quantity) {
        await transaction.rollback();
        throw new BadRequestException('Insufficient stock quantity');
      }
      product.qty -= body.quantity;
    }

    console.log('Updating stock for product:', id, 'with action:', body.action, 'quantity:', body.quantity);

    // Save with transaction
    await product.save({ transaction });
    await transaction.commit();

    return {
      statusCode: 200,
      message: 'Product quantity updated successfully',
      product_quantity: product.qty
    };

  } catch (error) {
    await transaction.rollback();
    console.error('Error in updateStock:', error);
    if (error instanceof BadRequestException) {
      throw error;
    }
    throw new InternalServerErrorException('Failed to update stock quantity');
  }
}

    async deleteStock(id : number, userId : number): Promise<ApiResponseDto<any>>{
        try{
            // check if the stock exists 
            const stock = await Product.findByPk(id);
            if(!stock){
                throw new BadRequestException(`stock is not found with id ${id}`)
            }
            await Stock.destroy({where: {id : id}});
            return ApiResponseDto.success('Stock deleted successfully')
        }catch(error){
            return ApiResponseDto.error(error.message
                || 'Internal server error',
                HttpStatus.INTERNAL_SERVER_ERROR
            )
        }
    }

}