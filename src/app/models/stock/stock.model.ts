import { BelongsTo, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import Product from "../product/product.model";
import StockStatus from "./stock_status.model";


@Table({
    tableName: 'stock',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
})
class Stock extends Model<Stock>{
    @Column({primaryKey: true, allowNull: false, autoIncrement: true}) 
    declare id : number
    @Column({allowNull: true, type: DataType.INTEGER}) 
    declare quantity : number
    @Column({allowNull : false, type: DataType.DATE}) 
    declare created_at: Date;
    @Column({allowNull : true, type: DataType.DATE}) 
    declare updated_at : Date;
    @ForeignKey(() => Product)
    @Column({allowNull: false, type: DataType.INTEGER, onDelete: 'CASCADE'})
    declare product_id : number;
    @ForeignKey(() => StockStatus)
    @Column({allowNull : true, type: DataType.INTEGER, onDelete : 'CASCADE'})
    declare stock_status_id : number;
    

    @BelongsTo(()=> Product, {foreignKey: 'product_id', as: 'product'}) product : Product;
    @BelongsTo(() => StockStatus, {foreignKey: 'stock_status_id', as: 'stock_status'}) stock_status : StockStatus;

}

export default Stock;