// ================================================================>> Core Library

import { SetMetadata } from "@nestjs/common";
import { RoleEnum } from "src/app/enums/role.enum";

/**
 * @author Eng Sokchheng <sokchhengeng5@gmail.com>
 * @params Array<role>
 */
export const RolesDecorator = (...roles: RoleEnum[]) => SetMetadata('roles', roles)