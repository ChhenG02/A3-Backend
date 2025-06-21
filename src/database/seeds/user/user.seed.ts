import { RoleEnum } from 'src/app/enums/role.enum';
import { CreationAttributes } from 'sequelize';
import Role from 'src/app/models/user/role.model';
import UserRoles from '@app/models/user/user_roles.model';

import User from 'src/app/models/user/user.model';

export class UserSeeder {
  public static seed = async () => {
    try {
      await UserSeeder.seedRoles();
      await UserSeeder.seedUsers();
      await UserSeeder.seedUserRoles();
    } catch (error) {
      // console.error('\x1b[31m\nError seeding data user:', error);
    }
  };

  private static async seedRoles() {
    try {
      await Role.bulkCreate(data.roles as CreationAttributes<Role>[]);
      console.log('\x1b[32mRoles data inserted successfully.');
    } catch (error) {
      console.error('\x1b[31m\nError seeding roles:', error);
      throw error;
    }
  }

  private static async seedUsers() {
    try {
      await User.bulkCreate(
        data.users as unknown as CreationAttributes<User>[],
      );
      console.log('\x1b[32mUsers data inserted successfully.');
    } catch (error) {
      console.error('Error seeding users:', error);
      throw error;
    }
  }

  private static async seedUserRoles() {
    try {
      await UserRoles.bulkCreate(
        data.user_roles as CreationAttributes<UserRoles>[],
      );
      console.log('\x1b[32mUser Roles data inserted successfully.');
    } catch (error) {
      console.error('Error seeding user roles:', error);
      throw error;
    }
  }
}

// Mock-data
const data = {
  roles: [
    { name: 'Admin', slug: 'admin' },
    { name: 'Cashier', slug: 'cashier' },
  ],
  users: [
    {
      name: 'Panhariddh',
      phone: '099785698',
      email: 'odompanharith@gmail.com',
      password: '123456',
      avatar: 'static/pos/user/avatar.png',
      creator_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Tongsour',
      phone: '0889566930',
      email: 'tongsour@gmail.com',
      password: '123456',
      avatar: 'static/pos/user/avatar.png',
      creator_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Mengly',
      phone: '095266386',
      email: 'mengly@gmail.com',
      password: '123456',
      avatar: 'static/pos/user/avatar.png',
      creator_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
    {
      name: 'Narin',
      phone: '0889161371',
      email: 'cc7@gmail.com',
      password: '123456',
      avatar: 'static/pos/user/avatar.png',
      creator_id: 1,
      created_at: new Date(),
      updated_at: new Date(),
    },
  ],
  user_roles: [
    {
      user_id: 1,
      role_id: RoleEnum.ADMIN,
      added_id: 1,
      created_at: new Date(),
      is_default: true,
    },
    {
      user_id: 1,
      role_id: RoleEnum.CASHIER,
      added_id: 1,
      created_at: new Date(),
      is_default: false,
    }, // <-- Added
    {
      user_id: 2,
      role_id: RoleEnum.CASHIER,
      added_id: 1,
      created_at: new Date(),
      is_default: true,
    },
    {
      user_id: 3,
      role_id: RoleEnum.CASHIER,
      added_id: 1,
      created_at: new Date(),
      is_default: true,
    },
    {
      user_id: 4,
      role_id: RoleEnum.ADMIN,
      added_id: 1,
      created_at: new Date(),
      is_default: true,
    },
  ],
};
