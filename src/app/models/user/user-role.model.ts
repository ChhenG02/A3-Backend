// ================================================================================================= Third Party Library
import { Column, DataType, ForeignKey, Table, Model } from "sequelize-typescript";

// ================================================================================================= Custom Library
import Role from "./role.model";
import User from "./user.model";

@Table ({tableName: 'user_roles', timestamps: false})
class UserRoles extends Model<UserRoles> {

    // ============================================================================================= Primary Key
    @Column({primaryKey: true, autoIncrement: true})                                                ur_id: number;
    
    // ============================================================================================= Foreign Key
    @ForeignKey(() => User) @Column({ onDelete: 'CASCADE' })                                        user_id: number;
    @ForeignKey(() => Role) @Column({ onDelete: 'CASCADE' })                                        role_id: number;

    // ============================================================================================= Fields
    @Column({ allowNull: false, type: DataType.DATE })                                              created_at?: Date;
    @Column({ allowNull: false, type: DataType.BOOLEAN, defaultValue: false })                      is_default: boolean;

}
export default UserRoles;