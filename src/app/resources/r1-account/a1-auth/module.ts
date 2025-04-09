// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Costom Library

import { AuthController } from './controller';
import { AuthService } from './service';
import { EmailService } from 'src/app/services/email.service';

@Module({
    controllers: [AuthController],
    providers: [AuthService, EmailService]
})

export class AuthModule { }
