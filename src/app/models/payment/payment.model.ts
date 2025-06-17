// payment.model.ts
// ================================================================================================= Third Party Library
import { BelongsTo, Column, DataType, ForeignKey, Model, Table } from 'sequelize-typescript';
import Order from '../order/order.model';

// ================================================================================================= Custom Library

@Table({ tableName: 'payment', createdAt: 'created_at', updatedAt: 'updated_at' })
class Payment extends Model<Payment> {
    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true })                                              declare id: number;

    // ============================================================================================= Foreign Key
    @ForeignKey(() => Order) @Column({ allowNull: false, onDelete: 'CASCADE' })                     order_id: number;

    // ============================================================================================= Field
    @Column({ allowNull: false, type: DataType.ENUM('cash', 'scanpay') })                          payment_method: 'cash' | 'scanpay';
    @Column({ allowNull: false, type: DataType.DOUBLE })                                            amount_paid: number;
    @Column({ allowNull: true, type: DataType.DATE, defaultValue: new Date() })                     paid_at?: Date;
    created_at: Date;

    // ============================================================================================= Many to One
    @BelongsTo(() => Order)                                                                        order: Order;
}

export default Payment;