// user_logs.model.ts
import { Column, DataType, Table, Model, ForeignKey, BelongsTo } from "sequelize-typescript";
import User from "./user.model"; // Import User model to establish the relationship

@Table({ tableName: 'user_logs', createdAt: 'created_at', updatedAt: 'updated_at' })
class UsersLogs extends Model<UsersLogs> {
  @ForeignKey(() => User)
  @Column({ allowNull: false, type: DataType.INTEGER })
  user_id: number;

  @Column({ allowNull: false, type: DataType.STRING })
  action: string;

  @Column({ allowNull: true, type: DataType.STRING })
  details: string;

  @Column({ allowNull: false, type: DataType.STRING })
  ip_address: string;

  @Column({ allowNull: true, type: DataType.STRING })
  browser: string;

  @Column({ allowNull: true, type: DataType.STRING })
  os: string;

  @Column({ allowNull: true, type: DataType.STRING })
  platform: string;

  @Column({ allowNull: false, type: DataType.DATE })
  timestamp: Date;

      // ============================================================================================= Many to One
      @BelongsTo(() => User)                                                                          user: User;

}

export default UsersLogs;
