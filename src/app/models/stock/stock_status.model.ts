import { Column, DataType, HasMany, Model, Table } from "sequelize-typescript";
import Stock from "./stock.model";
import Product from "../product/product.model";


@Table({
    tableName: 'stock_status',
    timestamps: true
})
class StockStatus extends Model<StockStatus> {
    @Column({primaryKey: true, autoIncrement : true}) declare id : number;
    @Column({allowNull : false, type: DataType.STRING(50)}) declare name : string;
    @Column({allowNull : false, type: DataType.STRING}) declare color :  string;
    @Column({allowNull : true, type: DataType.STRING})  declare avatar?: string;
    @Column({allowNull: false , type: DataType.INTEGER}) declare min_items : number;
    @Column({allowNull: true , type: DataType.INTEGER}) declare max_items : number;
    @Column({allowNull : true, type: DataType.DATE, defaultValue: new Date()}) declare created_at : Date;
    @Column({allowNull : true, type: DataType.DATE}) declare updated_at : Date;

    // @HasMany(() => Stock) stock : Stock[];
    @HasMany(() => Product ) product : Product[];
  
}

export default StockStatus;