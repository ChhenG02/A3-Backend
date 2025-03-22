// ================================================================================================= Third Party Library
import { Column, DataType, Table , HasMany, Model, BelongsToMany} from "sequelize-typescript";

// ================================================================================================= Custom Library
import UserRoles from "./user-role.model";
import User from "./user.model";
@Table ({tableName: 'role', timestamps: false})
class Role extends Model<Role> {

    // ============================================================================================= Primary Key
    @Column({primaryKey: true, autoIncrement: true})                                                r_id: number;
    
    // ============================================================================================= Fields
    @Column({ allowNull: false, type: DataType.STRING(100) })                                       name: string;
    @Column({ allowNull: false, type: DataType.STRING(100) })                                       slug: string;

    // ===========================================================================================>> One to Many
    @HasMany(() => UserRoles)                                                                       user: UserRoles[];


}
export default Role;