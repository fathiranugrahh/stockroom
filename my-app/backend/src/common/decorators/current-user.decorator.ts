import { createParamDecorator, ExecutionContext } from '@nestjs/common';

import { Role } from '../../generated/prisma/enums';

/** The authenticated user shape attached to the request by JwtStrategy. */
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
}

export const CurrentUser = createParamDecorator(
  (data: keyof AuthUser | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<{ user?: AuthUser }>();
    const user = request.user;
    return data && user ? user[data] : user;
  },
);
