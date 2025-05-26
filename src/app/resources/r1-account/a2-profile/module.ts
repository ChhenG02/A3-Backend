// ===========================================================================>> Core Library
import { Module } from '@nestjs/common';

// ===========================================================================>> Custom Library

import { ProfileController } from './controller';
import { ProfileService } from './service';
import { FileService } from 'src/app/services/file.service';

@Module({
    controllers: [ProfileController],
    providers: [ProfileService, FileService],
})

export class ProfileModule { }
