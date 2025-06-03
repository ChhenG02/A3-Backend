import { PaginationMeta } from "@app/core/dto/pagination.dto";
import { ApiResponseDto } from "@app/core/dto/response.dto"
import { toCambodiaDate } from "@app/core/utils/date.utils"
import OrderDetails from "@app/models/order/detail.model";
import Product from "@app/models/product/product.model";
import ProductType from "@app/models/setup/type.model";
import Stock from "@app/models/stock/stock.model";
import User from "@app/models/user/user.model";
import { HttpStatus } from "@nestjs/common";
import { Model, Op, or } from "sequelize";


export class StockService {
    
    async view(
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
        
        switch(params?.sort_by){
            case 'high-to-low': 
            order = [[{model: Stock, as: 'stock'}, 'quantity', 'DESC']];
            break
            case 'low-to-high':
            order = [[{model: Stock, as: 'stock'}, 'quantity', 'ASC']];
            break
            default : 
            order = [[{model : Stock, as: 'stock'}, 'id', 'ASC']]
            break
        }

        // Retrieves Product with associated product stock 
        const {rows, count} = await Product.findAndCountAll({
            attributes: [
                'id',
                'name',
                'image',
                'unit_price',
                'created_at'
            ],
            include: [
                {
                    model : User,
                    as: 'creator',
                    attributes: ['id', 'name', 'avatar']
                },
                {
                    model: ProductType,
                    as: 'product_type',
                    attributes: ['id','name', 'image']
                },
                {
                    model: Stock,
                    as: 'stock',
                    attributes: ['id', 'quantity']
                }
            ],
            where: {...where},
            order: order,
            offset: offset,
            limit: params?.limit
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
            unit_price: row.unit_price,
            created_at: row.created_at,
            creator: {
                id : row.creator.id,
                name : row.creator.name,
                avatar : row.creator.avatar
            },
            product_type: {
                id : row.product_type.id,
                name : row.product_type.name,
                iamge : row.product_type.image
            },
            stock: {
                id : row.stock.id,
                quantity : row.stock.quantity
            }
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

}