// ================================================================================================= Third Party Library
import { BelongsToMany, Column, DataType, HasMany, Model, Table } from 'sequelize-typescript';

// ================================================================================================= Custom Library

import User from './user.model';
import UserRoles from './user-role.model';

@Table({ tableName: 'role', timestamps: false })
class Role extends Model<Role> {

    // ============================================================================================= Primary Key
    @Column({ primaryKey: true, autoIncrement: true }) declare                                      id: number;

    // ============================================================================================= Fields
    @Column({ allowNull: false, type: DataType.STRING(100) })                                       name: string;
    @Column({ allowNull: false, type: DataType.STRING(100) })                                       slug: string;

    // ===========================================================================================>> One to Many
    @HasMany(() => UserRoles)                                                                       roles: UserRoles[]
    
    // ===========================================================================================>> Many to Many
    @BelongsToMany(() => User, () => UserRoles)                                                     users: User[];
}

export default Role;
