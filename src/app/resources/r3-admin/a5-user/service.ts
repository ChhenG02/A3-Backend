// ===========================================================================>> Core Library
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

// ===========================================================================>> Third Party Library
import { literal, Op } from 'sequelize';

// ===========================================================================>> Custom Library
import OrderDetails from '@app/models/order/detail.model';
import Order from '@app/models/order/order.model';
import Product from '@app/models/product/product.model';
import ProductType from '@app/models/setup/type.model';
import Role from '@app/models/user/role.model';
import UserRoles from '@app/models/user/user_roles.model';
import User from '@app/models/user/user.model';
import { FileService } from 'src/app/services/file.service';
import {
  CreateUserDto,
  UpdatePasswordDto,
  UpdateStatusDto,
  UpdateUserDto,
} from './dto';
import { Create, List, Update } from './interface';

@Injectable()
export class UserService {
  constructor(private readonly fileService: FileService) {}

  async setup(): Promise<{ roles: { id: number; name: string }[] }> {
    const roles = await Role.findAll({
      attributes: ['id', 'name'],
    });
    return { roles: roles };
  }

  async getData(
    userId: number,
    page_size: number = 10,
    page: number = 1,
    key?: string,
    type_id?: number,
    startDate?: string,
    endDate?: string,
  ): Promise<List> {
    const offset = (page - 1) * page_size;

    // Helper function to convert date to Cambodia's timezone (UTC+7)
    const toCambodiaDate = (dateString: string, isEndOfDay = false): Date => {
      const date = new Date(dateString);
      const utcOffset = 7 * 60; // UTC+7 offset in minutes
      const localDate = new Date(date.getTime() + utcOffset * 60 * 1000);

      if (isEndOfDay) {
        localDate.setHours(23, 59, 59, 999); // End of day
      } else {
        localDate.setHours(0, 0, 0, 0); // Start of day
      }
      return localDate;
    };

    // Calculate start and end dates for the filter
    const start = startDate ? toCambodiaDate(startDate) : null;
    const end = endDate ? toCambodiaDate(endDate, true) : null;
    const where = {
      [Op.and]: [
        key
          ? {
              [Op.or]: [
                { name: { [Op.iLike]: `%${key}%` } },
                { phone: { [Op.like]: `%${key}%` } },
              ],
            }
          : {},
        { id: { [Op.not]: userId } },
        start && end ? { created_at: { [Op.between]: [start, end] } } : {},
      ],
    };

    // Fetch data with the necessary associations and calculated fields
    const data = await User.findAll({
      attributes: [
        'id',
        'name',
        'avatar',
        'phone',
        'email',
        'is_active',
        'last_login',
        'created_at',
        [
          literal(`(
                        SELECT COUNT(o.id)
                        FROM "order" AS o
                        WHERE o.cashier_id = "User".id
                    )`),
          'totalOrders',
        ],
        [
          literal(`(
                        SELECT COALESCE(SUM(o.total_price), 0)
                        FROM "order" AS o
                        WHERE o.cashier_id = "User".id
                    )`),
          'totalSales',
        ],
      ],
      include: [
        {
          model: UserRoles,
          attributes: ['id', 'role_id'],
          //where: type_id ? { role_id: type_id } : null,
          include: [
            {
              model: Role,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
      where,
      order: [['id', 'DESC']],
      limit: page_size,
      offset,
    });

    // Calculate total count without `include` for pagination
    const totalCount = await User.count({ where });
    const totalPages = Math.ceil(totalCount / page_size);

    const dataFormat: List = {
      data,
      pagination: {
        page: page,
        limit: page_size,
        totalPage: totalPages,
        total: totalCount,
      },
    };

    return dataFormat;
  }

  async view(userId: number) {
    const data = await User.findByPk(userId, {
      attributes: [
        'id',
        'name',
        'avatar',
        'phone',
        'email',
        'is_active',
        'last_login',
        'created_at',
        [
          literal(`
                        (
                            SELECT COUNT(o.id)
                            FROM "order" AS o
                            WHERE o.cashier_id = "User".id
                        )
                    `),
          'totalOrders',
        ],
        [
          literal(`
                        (
                            SELECT COALESCE(SUM(o.total_price), 0)
                            FROM "order" AS o
                            WHERE o.cashier_id = "User".id
                        )
                    `),
          'totalSales',
        ],
      ],
      include: [
        {
          model: UserRoles,
          attributes: ['id', 'role_id'],
          include: [
            {
              model: Role,
              attributes: ['id', 'name'],
            },
          ],
        },
        {
          model: Order,
          attributes: [],
        },
      ],
    });

    const where: any = {
      cashier_id: userId,
    };

    const sale = await Order.findAll({
      attributes: [
        'id',
        'receipt_number',
        'total_price',
        'platform',
        'ordered_at',
      ],
      include: [
        {
          model: OrderDetails,
          attributes: ['id', 'unit_price', 'qty'],
          include: [
            {
              model: Product,
              attributes: ['id', 'name', 'code', 'image'],
              include: [{ model: ProductType, attributes: ['name'] }],
            },
          ],
        },
        { model: User, attributes: ['id', 'avatar', 'name'] },
      ],
      where: where,
      order: [['ordered_at', 'DESC']],
      limit: 10,
    });
    return { data: data, sale: sale };
  }

  async create(body: CreateUserDto, userId: number): Promise<Create> {
    let user: User;
    try {
      // Check if a user with the same phone or email already exists
      user = await User.findOne({
        where: {
          [Op.or]: [{ phone: body.phone }, { email: body.email }],
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong. Please try again later.',
        'Error Query',
      );
    }

    // If user already exists, throw an error
    if (user) {
      throw new BadRequestException('Email or phone already exists!');
    }

    // Upload the avatar image to the file service
    const result = await this.fileService.uploadBase64Image(
      'user',
      body.avatar,
    );
    if (result.error) {
      throw new BadRequestException(result.error);
    }
    // Set the avatar to the file URI returned from the file service
    body.avatar = result.file.uri;

    let createdUser;
    // Create the new user in the database
    try {
      createdUser = await User.create({
        name: body.name,
        avatar: body.avatar,
        phone: body.phone,
        email: body.email,
        password: body.password,
        creator_id: userId,
      });
    } catch (err) {
      console.error('Error creating user:', err); // Log the error
      throw new BadRequestException('Failed to create user');
    }

    // Assign roles to the user by creating entries in the UserRoles table
    if (body.role_ids && body.role_ids.length > 0) {
      const userRoles = body.role_ids.map((roleId, index) => ({
        user_id: createdUser.id,
        role_id: roleId,
        added_id: userId, // The creator who added the roles
        created_at: new Date(),
        is_default: index === 0, // Set is_default to true only for the first role
      }));

      await UserRoles.bulkCreate(userRoles);
    }

    // Fetch the created user data including the roles for response
    const data = await User.findByPk(createdUser.id, {
      attributes: [
        'id',
        'name',
        'avatar',
        'phone',
        'email',
        'is_active',
        'created_at',
      ],
      include: [
        {
          model: UserRoles,
          attributes: ['id', 'role_id', 'is_default'], // Including is_default in the response
          include: [
            {
              model: Role,
              attributes: ['id', 'name'],
            },
          ],
        },
      ],
    });

    // Format the response
    const dataFormat: Create = {
      data: data,
      message: 'User has been created',
    };

    return dataFormat;
  }

  private isValidBase64(str: string): boolean {
    const base64Pattern =
      /^data:image\/(jpeg|png|gif|bmp|webp);base64,[a-zA-Z0-9+/]+={0,2}$/;
    return base64Pattern.test(str);
  }

  async update(
    userId: number,
    body: UpdateUserDto,
    updaterId: number,
  ): Promise<Update> {
    // Find the current user
    let currentUser: User;
    try {
      currentUser = await User.findByPk(userId);
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong! Please try again later.',
        'Error Query',
      );
    }
    if (!currentUser) {
      throw new BadRequestException('Invalid user_id');
    }

    // Check if the phone is already in use by another user
    let checkExistPhone: User;
    try {
      checkExistPhone = await User.findOne({
        where: {
          id: { [Op.not]: userId },
          phone: body.phone,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong! Please try again later.',
        'Error Query',
      );
    }
    if (checkExistPhone) {
      throw new ConflictException('Phone is already in use');
    }

    // Check if the email is already in use by another user
    let checkExistEmail: User;
    try {
      checkExistEmail = await User.findOne({
        where: {
          id: { [Op.not]: userId },
          email: body.email,
        },
      });
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong! Please try again later.',
        'Error Query',
      );
    }
    if (checkExistEmail) {
      throw new ConflictException('Email is already in use');
    }

    if (body.avatar && !body.avatar.startsWith('upload/file/')) {
      if (this.isValidBase64(body.avatar)) {
        const result = await this.fileService.uploadBase64Image(
          'user',
          body.avatar,
        );
        if (result.error) {
          throw new BadRequestException(result.error);
        }
        // Replace base64 string by file URI from FileService
        body.avatar = result.file?.uri;
      } else {
        throw new BadRequestException('Invalid image format');
      }
    }

    // Update basic user information (name, avatar, phone, email, updater_id)
    try {
      await User.update(
        {
          name: body.name,
          avatar: body.avatar,
          phone: body.phone,
          email: body.email,
          updater_id: updaterId,
        },
        {
          where: { id: userId },
        },
      );
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong! Please try again later.',
        'Error Update',
      );
    }

    // Handle role updates
    if (body.role_ids && body.role_ids.length > 0) {
      const transaction = await User.sequelize.transaction();
      try {
        // Get current roles
        const currentRoles = await UserRoles.findAll({
          where: { user_id: userId },
          transaction,
        });

        const currentRoleIds = currentRoles.map(role => role.role_id);
        
        // Determine roles to add and remove
        const rolesToAdd = body.role_ids.filter(id => !currentRoleIds.includes(id));
        const rolesToRemove = currentRoleIds.filter(id => !body.role_ids.includes(id));
        
        // Check if we're removing the default role
        const removedDefaultRole = currentRoles.find(
          role => rolesToRemove.includes(role.role_id) && role.is_default
        );
        
        // Remove roles that are no longer needed
        if (rolesToRemove.length > 0) {
          await UserRoles.destroy({
            where: {
              user_id: userId,
              role_id: { [Op.in]: rolesToRemove },
            },
            transaction,
          });
        }
        
        // Add new roles
        if (rolesToAdd.length > 0) {
          const newRoles = rolesToAdd.map((roleId, index) => ({
            user_id: userId,
            role_id: roleId,
            added_id: updaterId,
            created_at: new Date(),
            is_default: false, // Will handle defaults below
          }));
          
          await UserRoles.bulkCreate(newRoles, { transaction });
        }
        
        // Handle default role logic
        let needsNewDefault = false;
        
        // Case 1: If we removed the default role, we need a new one
        if (removedDefaultRole) {
          needsNewDefault = true;
        }
        
        // Case 2: If this is the first role being added, it should be default
        if (currentRoles.length === 0 && body.role_ids.length > 0) {
          needsNewDefault = true;
        }
        
        // Case 3: If user has only one role, it must be default
        if (body.role_ids.length === 1) {
          needsNewDefault = true;
        }
        
        // Set new default role if needed
        if (needsNewDefault) {
          // First, clear all defaults
          await UserRoles.update(
            { is_default: false },
            {
              where: { user_id: userId },
              transaction,
            }
          );
          
          // Then set the first role as default
          await UserRoles.update(
            { is_default: true },
            {
              where: {
                user_id: userId,
                role_id: body.role_ids[0], // First role in array becomes default
              },
              transaction,
            }
          );
        }
        
        await transaction.commit();
      } catch (error) {
        await transaction.rollback();
        throw new BadRequestException(
          'Failed to update user roles. Please try again later.',
          'Role Update Error',
        );
      }
    }

    // Fetch the updated user information (excluding password)
    let updateUser: User;
    try {
      updateUser = await User.findByPk(userId, {
        attributes: [
          'id',
          'name',
          'avatar',
          'phone',
          'email',
          'is_active',
          'created_at',
        ],
        include: [
          {
            model: UserRoles,
            attributes: ['id', 'role_id', 'is_default'],
            include: [
              {
                model: Role,
                attributes: ['id', 'name'],
              },
            ],
          },
        ],
      });
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong! Please try again later.',
        'Error Query',
      );
    }
    
    // Format the response
    const dataFormat: Update = {
      data: updateUser,
      message: 'User has been updated successfully.',
    };
    return dataFormat;
  }

  async delete(userId: number): Promise<{ message: string }> {
    try {
      const rowsAffected = await User.destroy({
        where: {
          id: userId,
        },
      });

      if (rowsAffected === 0) {
        throw new NotFoundException('This user not found.');
      }

      return { message: 'User has been deleted successfully.' };
    } catch (error) {
      throw new BadRequestException(
        error.message ?? 'Something went wrong!. Please try again later.',
        'Error Delete',
      );
    }
  }

  async updatePassword(
    userId: number,
    body: UpdatePasswordDto,
  ): Promise<{ message: string }> {
    //=============================================
    let currentUser: User;
    try {
      currentUser = await User.findByPk(userId);
    } catch (error) {
      throw new BadRequestException(
        'Someting went wrong!. Please try again later.',
        'Error Query',
      );
    }
    if (!currentUser) {
      throw new BadRequestException('Invalid user_id');
    }

    //=============================================
    try {
      await User.update(
        {
          password: body.confirm_password,
        },
        {
          where: { id: userId },
        },
      );
    } catch (error) {
      throw new BadRequestException(
        'Someting went wrong!. Please try again later.',
        'Error Update',
      );
    }

    //=============================================
    return { message: 'Password has been updated successfully.' };
  }

  async updateStatus(
    userId: number,
    body: UpdateStatusDto,
  ): Promise<{ message: string }> {
    //=============================================
    let currentUser: User;
    try {
      currentUser = await User.findByPk(userId);
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong! Please try again later.',
        'Error Query',
      );
    }

    if (!currentUser) {
      throw new BadRequestException('Invalid user_id');
    }

    //=============================================
    // Convert is_active to `1` or `0` based on `true` or `false`
    const updatedStatus = body.is_active ? 1 : 0;

    // Prepare the body with the modified status
    const updateData = {
      is_active: updatedStatus,
    };

    try {
      await User.update(updateData, {
        where: { id: userId },
      });
    } catch (error) {
      throw new BadRequestException(
        'Something went wrong! Please try again later.',
        'Error Update',
      );
    }

    //=============================================
    return { message: 'Status has been updated successfully.' };
  }
}
