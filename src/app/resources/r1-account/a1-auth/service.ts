// ===========================================================================>> Core Library
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';

// ===========================================================================>> Third Party Library
import * as bcrypt from 'bcryptjs';
import { DatabaseError, Op } from 'sequelize';

// ===========================================================================>> Costom Library
// Model

import User from 'src/app/models/user/user.model';

import { EmailService } from 'src/app/services/email.service';
import { JwtTokenGenerator, TokenGenerator } from 'src/app/shared/jwt/token';
import UserOTP from 'src/app/models/user/user_otps.model';

import UsersLogs from 'src/app/models/user/user_logs.model';
import { ActiveEnum } from 'src/app/enums/active.enum';
import { LoginRequestOTPDto, UserDto } from './dto';
import Role from 'src/app/models/user/role.model';
import UserRoles from '@app/models/user/user_roles.model';

// Removed duplicate import of bcrypt
import * as jwt from 'jsonwebtoken';

interface LoginPayload {
  username: string;
  password: string;
  platform: string;
}

@Injectable()
export class AuthService {
  private tokenGenerator: TokenGenerator;
  constructor(private readonly emailService: EmailService) {
    this.tokenGenerator = new JwtTokenGenerator();
  }

  async login(body: LoginPayload, req: Request) {
    let user: User | null;

    try {
      user = await User.findOne({
        where: {
          [Op.or]: [{ phone: body.username }, { email: body.username }],
          is_active: ActiveEnum.ACTIVE,
        },
        attributes: [
          'id',
          'name',
          'avatar',
          'phone',
          'email',
          'password',
          'created_at',
        ],
        include: [
          {
            model: Role,
            attributes: ['id', 'name', 'slug'],
            through: {
              attributes: [
                'id',
                'user_id',
                'role_id',
                'added_id',
                'created_at',
                'is_default',
              ],
            },
          },
        ],
      });
    } catch (error) {
      console.error(error);
      if (
        error instanceof DatabaseError &&
        error.message.includes('invalid identifier')
      ) {
        throw new BadRequestException(
          'Invalid input data or database error',
          'Database Error',
        );
      } else {
        throw new BadRequestException(
          'Server database error',
          'Database Error',
        );
      }
    }

    if (!user) {
      throw new BadRequestException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(body.password, user.password);
    if (!isPasswordValid) {
      throw new BadRequestException('Invalid password', 'Password Error');
    }

    const userDto = new UserDto(user);

    const token = jwt.sign(
      { user: userDto },
      process.env.JWT_SECRET as string,
      { expiresIn: '3d' }, // 3 days
    );

    return {
      data: userDto,
      token,
      message: 'Logged in successfully',
    };
  }

  async switchDefaultRole(auth: User, role_id: number) {
    try {
      const userRole = await UserRoles.findOne({
        where: {
          user_id: auth.id,
          role_id: role_id,
        },
      });

      if (!userRole) {
        throw new BadRequestException(
          'The specified role is not associated with the user.',
        );
      }

      if (userRole.is_default) {
        const user = await User.findOne({
          where: {
            id: auth.id,
            is_active: ActiveEnum.ACTIVE,
          },
          attributes: [
            'id',
            'name',
            'avatar',
            'phone',
            'email',
            'password',
            'created_at',
          ],
          include: [Role],
        });

        if (!user) {
          throw new InternalServerErrorException(
            'Failed to retrieve updated user information.',
          );
        }

        const token = this.tokenGenerator.getToken(user);
        return {
          token: token,
          message: 'This role is already set as default.',
        };
      }

      if (!UserRoles.sequelize) {
        throw new InternalServerErrorException(
          'Database connection is not initialized.',
        );
      }
      const transaction = await UserRoles.sequelize.transaction();
      try {
        await UserRoles.update(
          { is_default: false },
          {
            where: {
              user_id: auth.id,
              is_default: true,
            },
            transaction,
          },
        );

        await userRole.update({ is_default: true }, { transaction });

        await transaction.commit();
      } catch (updateError) {
        await transaction.rollback();
        throw new InternalServerErrorException(
          'Failed to switch default role.',
        );
      }

      const user = await User.findOne({
        where: {
          id: auth.id,
          is_active: ActiveEnum.ACTIVE,
        },
        attributes: [
          'id',
          'name',
          'avatar',
          'phone',
          'email',
          'password',
          'created_at',
        ],
        include: [Role],
      });

      if (!user) {
        throw new InternalServerErrorException(
          'Failed to retrieve updated user information.',
        );
      }
      // Ensure roles are populated
      if (!user.roles || user.roles.length === 0) {
        throw new InternalServerErrorException(
          'User roles are missing or not properly loaded.',
        );
      }

      const token = this.tokenGenerator.getToken(user);

      return {
        token: token,
        message: 'User default role has been switched successfully.',
      };
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof InternalServerErrorException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'An unexpected error occurred while switching the default role.',
      );
    }
  }

  // Generate a 6-digit OTP
  private generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  // Send OTP to user via email or SMS
  async sendOTP(username: string): Promise<{ data: boolean; message: string }> {
    try {
      // Input validation
      if (!username) {
        throw new BadRequestException('Email or phone is required');
      }

      // Check if user exists and is active
      const user = await User.findOne({
        where: {
          [Op.or]: [{ phone: username }, { email: username }],
          is_active: ActiveEnum.ACTIVE,
        },
      });

      if (!user) {
        throw new BadRequestException('User not found or inactive');
      }

      // Generate OTP and save it to the database
      const otp = this.generateOTP();
      await UserOTP.create({
        user_id: user.id,
        otp,
        expires_at: new Date(Date.now() + 2 * 60 * 1000), // OTP valid for 2 minute
      } as any);
      const expirationTime = new Date(Date.now() + 1 * 60 * 1000); // 1 minute
      const formattedExpiration = expirationTime.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      // Send OTP via email or SMS
      await this.emailService.sendHTMLMessage(
        user.email,
        'GameStoreKH OTP Code',
        `<p>Your OTP code is: <strong>${otp}</strong>. It will expire in 1 minute.</p>`,
      );

      return { data: true, message: 'OTP sent successfully' };
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new InternalServerErrorException(
        'Failed to send OTP. Please try again later.',
      );
    }
  }

  async checkExistUser(
    username: string,
  ): Promise<{ data: boolean; message: string }> {
    try {
      // Input validation
      if (!username) {
        throw new BadRequestException('Email or phone is required');
      }

      // Check if the user exists and is active
      const user = await User.findOne({
        where: {
          [Op.or]: [{ phone: username }, { email: username }],
          is_active: ActiveEnum.ACTIVE,
        },
      });

      // If user not found or inactive, return an appropriate response
      if (!user) {
        return { data: false, message: 'The user is not found' }; // Correctly return an object
      }

      // Return success response if user exists and is active
      return { data: true, message: 'The user exists' };
    } catch (error) {
      // Handle any unexpected errors
      throw new InternalServerErrorException(
        'Failed to process the request. Please try again later.',
      );
    }
  }

  async verifyOTP(
    body: LoginRequestOTPDto,
    req: Request,
  ): Promise<{ token: string; message: string }> {
    try {
      // Find the user by email or phone
      const user = await User.findOne({
        where: {
          [Op.or]: [{ phone: body.username }, { email: body.username }],
        },
        attributes: [
          'id',
          'name',
          'avatar',
          'phone',
          'email',
          'password',
          'created_at',
        ],
        include: [Role],
      });

      if (!user) {
        throw new BadRequestException('User not found');
      }

      // Check if the OTP exists and is valid
      const userOtp = await UserOTP.findOne({
        where: {
          user_id: user.id,
          otp: body.otp,
          expires_at: { [Op.gt]: new Date() }, // Ensure OTP is not expired
        },
      });

      if (!userOtp) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      // OTP is valid, delete it to prevent reuse
      await userOtp.destroy();

      const token = this.tokenGenerator.getToken(user);
      user.last_login = new Date();
      await user.save();

      const deviceInfo = req['deviceInfo'];

      // Store the login log in users_logs table
      await UsersLogs.create({
        user_id: user.id,
        action: 'login',
        details: 'User logged into the system',
        ip_address: deviceInfo.ip,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        platform: deviceInfo.platform || 'Web',
        timestamp: deviceInfo.timestamp,
      } as any);
      // ===>> Prepare Response
      return {
        token: token,
        message: 'Logged in successfully',
      };
    } catch (error) {
      throw new UnauthorizedException(error);
    }
  }
}