// ================================================================================================= Third Party Library
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  HasOne,
  Model,
  Table,
} from 'sequelize-typescript';

// ================================================================================================= Custom Library
import OrderDetails from '@app/models/order/detail.model';
import User from '@app/models/user/user.model';
import ProductType from '../setup/type.model';
import Promotion from '../setup/promotion.model';
import StockStatus from '../stock/stock_status.model';


@Table({
  tableName: 'product',
  createdAt: 'created_at',
  updatedAt: 'updated_at',
})
class Product extends Model<Product> {
  // ============================================================================================= Primary Key
  @Column({ primaryKey: true, autoIncrement: true }) declare id: number;

  // ============================================================================================= Foreign Key
  @ForeignKey(() => ProductType)
  @Column({ onDelete: 'RESTRICT', type: DataType.INTEGER }) declare type_id: number;
  
  @ForeignKey(() => User) 
  @Column({ onDelete: 'CASCADE', type: DataType.INTEGER }) declare creator_id: number;
  
  @ForeignKey(() => StockStatus)
  @Column({ allowNull: true, onDelete: 'SET NULL', type: DataType.INTEGER }) 
  declare stock_status_id: number;
  
  @ForeignKey(() => Promotion)
  @Column({ allowNull: true, onDelete: 'SET NULL', type: DataType.INTEGER })
  declare promotion_id: number;

  // ============================================================================================= Field
  @Column({ allowNull: false, unique: true, type: DataType.STRING(100) }) declare code: string;
  @Column({ allowNull: false, type: DataType.STRING(100) }) declare name: string;
  @Column({ allowNull: true, type: DataType.STRING(100) }) declare image?: string;
  
  // Stock-related fields
  @Column({ allowNull: false, type: DataType.INTEGER, defaultValue: 0 }) 
  declare qty: number;
  
  @Column({ allowNull: false, type: DataType.INTEGER }) 
  declare purchase_price: number;
  
  @Column({ allowNull: true, type: DataType.DOUBLE }) 
  declare unit_price?: number;
  
  @Column({ allowNull: false, type: DataType.DECIMAL(10, 2), defaultValue: 0 }) 
  declare discount: number;

  created_at: Date;

  // ===========================================================================================>> Many to One
  @BelongsTo(() => ProductType, {foreignKey: 'type_id', as: 'product_type'}) 
  product_type: ProductType;
  
  @BelongsTo(() => User, {foreignKey: 'creator_id', as: 'creator'}) 
  creator: User;
  
  @BelongsTo(() => StockStatus, {foreignKey: 'stock_status_id', as: 'stock_status'}) 
  stock_status: StockStatus;
  
  @BelongsTo(() => Promotion, {foreignKey: 'promotion_id', as: 'promotion'})
  promotion: Promotion;

  // ===========================================================================================>> One to Many
  @HasMany(() => OrderDetails) 
  pod: OrderDetails[];
}

export default Product;
