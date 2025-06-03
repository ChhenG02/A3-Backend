import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from "sequelize-typescript";
import User from "../user/user.model";
import Product from "../product/product.model";


@Table({
    tableName: 'promotion',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    timestamps: true
    })
class Promotion extends Model<Promotion> {

    @Column({ primaryKey: true, autoIncrement: true })
    declare id: number;
    @Column({ allowNull: false, type: DataType.INTEGER})
    declare discount_value:  number;
    @Column({ allowNull: false, type: DataType.DATE })
    declare start_date: Date;
    @Column({ allowNull: false, type: DataType.DATE })
    declare end_date: Date;

    @ForeignKey(() => User)
    @Column({ onDelete: 'CASCADE', allowNull: false }) 
    declare creator_id: number;
    @ForeignKey(() => User)
    @Column({ onDelete: 'CASCADE', allowNull: true })
    declare updater_id?: number;

    @BelongsTo(() => User, { foreignKey: 'creator_id', as: 'creator'})
    creator: User;
    @BelongsTo(() => User, { foreignKey: 'updater_id', as: 'updater'})
    updater: User;

    @HasMany(() => Product) products: Product[];

}
export default Promotion;