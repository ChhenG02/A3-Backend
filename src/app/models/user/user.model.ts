// ================================================================================================= Third Party Library
import { BelongsTo, BelongsToMany, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';
import * as bcrypt from 'bcryptjs';

// ================================================================================================= Custom Library
import { ActiveEnum } from 'src/app/enums/active.enum';


import Role         from './role.model';
import UserOTP      from './user_otps.model';
import UserRoles from './user-role.model';

@Table({ tableName: 'user', createdAt: 'created_at', updatedAt: 'updated_at', deletedAt: 'deleted_at', paranoid: true })
class User extends Model<User> {

    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true }) declare                                      id: number;

    // ============================================================================================= Field
    @Column({ allowNull: true, type: DataType.STRING(200), defaultValue: 'static/avatar.png' }) declare    avatar: string;
    @Column({ allowNull: false, type: DataType.STRING(50) })                                    declare    name: string;
    @Column({ allowNull: true, type: DataType.STRING(100) })                                    declare    email: string;
    @Column({ allowNull: false,type: DataType.STRING(100) })                                    declare    phone: string;
    @Column({
        allowNull: false,
        type: DataType.STRING(100),
        set(value: string) {
            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(value, salt);
            this.setDataValue('password', hash); // Hash password before setting it
        },
    })
    declare password: string;
    
    @Column({ allowNull: false, type: DataType.INTEGER, defaultValue: ActiveEnum.ACTIVE })       declare    is_active: ActiveEnum;
    @Column({ allowNull: true, type: DataType.INTEGER })                                         declare   creator_id: number;
    @Column({ allowNull: true, type: DataType.INTEGER })                                         declare   updater_id: number;

    // ===========================================================================================>> Many to One
    @BelongsTo(() => User, { foreignKey: 'creator_id', as: 'creator' })                          declare   creator: User;
    @BelongsTo(() => User, { foreignKey: 'updater_id', as: 'updater' })                          declare   updater: User;
    @Column({ allowNull: true, type: DataType.DATE, defaultValue: new Date() })                  declare   last_login?: Date;
    declare created_at: Date
    // ===========================================================================================>> One to Many
    @HasMany(() => UserRoles)                                                                    declare   role: UserRoles[];
    @HasMany(() => UserOTP)                                                                      declare   otps: UserOTP[];
    // ===========================================================================================>> Many to Many
    @BelongsToMany(() => Role, () => UserRoles)                                                  declare   roles: Role[];
    
}
export default User;
