// ================================================================================================= Third Party Library
import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  Table,
} from 'sequelize-typescript';

// ================================================================================================= Custom Library
import OrderDetails from '@app/models/order/detail.model';
import User from '@app/models/user/user.model';
import ProductType from '../setup/type.model';
import Promotion from '../promotion/promotion.model';

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
  @Column({ onDelete: 'RESTRICT' })
  type_id: number;
  @ForeignKey(() => User) @Column({ onDelete: 'CASCADE' }) creator_id: number;
  @ForeignKey(() => Promotion) 
  @Column({ onDelete: 'CASCADE', allowNull: true })
  promotion_id?: number;

  // ============================================================================================= Field
  @Column({ allowNull: false, unique: true, type: DataType.STRING(100) })
  code: string;
  @Column({ allowNull: false, type: DataType.STRING(100) }) name: string;
  @Column({ allowNull: true, type: DataType.STRING(100) }) image?: string;
  @Column({ allowNull: true, type: DataType.DOUBLE }) unit_price?: number;

  @Column({ allowNull: false, type: DataType.DECIMAL(10, 2), defaultValue: 0 })
  discount: number;
  created_at: Date;
  // ===========================================================================================>> Many to One
  @BelongsTo(() => ProductType) type: ProductType;
  @BelongsTo(() => User) creator: User;
  @BelongsTo(() => Promotion, { foreignKey: 'promotion_id', as: 'promotion' })
  promotion: Promotion;

  // ===========================================================================================>> One to Many
  @HasMany(() => OrderDetails) pod: OrderDetails[];
}

export default Product;
