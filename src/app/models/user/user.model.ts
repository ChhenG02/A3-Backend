// ================================================================================================= Third Party Library
import { Column, DataType, Table,  HasMany, Model, BelongsToMany } from "sequelize-typescript";


// ================================================================================================= Custom Library
import UserRoles from "./user-role.model";
import Role from "./role.model";
import { ActiveEnum } from "../../enums/active.enum";

@Table({ tableName: 'user', createdAt: 'created_at', updatedAt: 'updated_at', deletedAt: 'deleted_at', paranoid: true })
class User extends Model<User>  {

    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true })                                              u_id: number;
    
    // ============================================================================================= Field
    @Column({ allowNull: false, type: DataType.STRING(50) })                                        name: string;
    @Column({ allowNull: true, type: DataType.STRING(100) })                                        email: string;
    @Column({ allowNull: false,type: DataType.STRING(100) })                                        phone: string;    
    @Column({ allowNull: false,type: DataType.STRING(100) })                                        password: string;

    @Column({ allowNull: false, type: DataType.INTEGER, defaultValue: ActiveEnum.ACTIVE })          is_active: ActiveEnum;

    // ===========================================================================================>> One to Many
    @HasMany(() => UserRoles) userRoles: UserRoles[];

    // ===========================================================================================>> Many to Many
    @BelongsToMany(() => Role, () => UserRoles) roles: Role[];

}
export default User;