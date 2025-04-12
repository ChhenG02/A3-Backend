// ===========================================================================>> Core Library
import { SequelizeModuleOptions } from '@nestjs/sequelize';

// ===========================================================================>> Third Party Library
import * as dotenv from 'dotenv';
import { Dialect } from 'sequelize';

dotenv.config();

/** @Postgresql */
const sequelizeConfig: SequelizeModuleOptions = {
    dialect     : process.env.DB_CONNECTION as Dialect || 'postgres',
    host        : process.env.DB_HOST || 'localhost',
    port        : Number(process.env.DB_PORT) || 5432,
    username    : process.env.DB_USERNAME || 'postgres',
    password : String(process.env.DB_PASSWORD || 'pw@2025'), 
    database    : process.env.DB_DATABASE || 'a3_pos',
    timezone    : process.env.DB_TIMEZONE || 'Asia/Phnom_Penh',
    models      : [__dirname + '/../app/models/**/*.model.{ts,js}'],
    logging     : false
};

export default sequelizeConfig;
