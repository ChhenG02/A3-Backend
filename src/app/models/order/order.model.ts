// order.model.ts
// ================================================================================================= Third Party Library
import { BelongsTo, Column, DataType, ForeignKey, HasMany, Model, Table } from 'sequelize-typescript';

// ================================================================================================= Custom Library
import Notifications from '@app/models/notification/notification.model';
import User from '@app/models/user/user.model';
import OrderDetails from './detail.model';
import Payment from '../payment/payment.model';


@Table({ tableName: 'order', createdAt: 'created_at', updatedAt: 'updated_at' })
class Order extends Model<Order> {
    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true })                                              declare id: number;

    // ============================================================================================= Foreign Key
    @ForeignKey(() => User) @Column({ onDelete: 'CASCADE' })                                        cashier_id: number;
    @ForeignKey(() => Payment) @Column({ allowNull: true, onDelete: 'SET NULL' })                   payment_id?: number; // Foreign key to Payment

    // ============================================================================================= Field
    @Column({ allowNull: false, unique: true, type: DataType.STRING(10) })                          receipt_number: string;
    @Column({ allowNull: true, type: DataType.DOUBLE })                                             sub_total_price?: number; // Price before discounts
    @Column({ allowNull: true, type: DataType.DOUBLE })                                             discount_price?: number;  // Total discount (sub_total_price - total_price)
    @Column({ allowNull: true, type: DataType.DOUBLE })                                             total_price?: number;     // Final price after discounts
    @Column({ allowNull: true, type: DataType.DATE, defaultValue: new Date() })                     ordered_at?: Date;
    @Column({ allowNull: true, type: DataType.STRING(20), defaultValue: 'Web' })                    platform: string;
    created_at: Date;

    // ============================================================================================= Many to One
    @BelongsTo(() => User)                                                                          cashier: User;
    @BelongsTo(() => Payment)                                                                       payment: Payment;

    // ============================================================================================= One to Many
    @HasMany(() => OrderDetails)                                                                    details: OrderDetails[];
    @HasMany(() => Notifications)                                                                   notifications: Notifications[];
}

export default Order;