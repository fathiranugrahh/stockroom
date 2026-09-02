import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';

import type { User } from '../generated/prisma/client';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '../audit/audit.constants';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import type { JwtPayload } from './types/jwt-payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly audit: AuditService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmailForAuth(dto.email);

    // Verify password even if user is missing? Keep it simple with a generic
    // error to avoid leaking which part failed.
    const passwordValid = user
      ? await argon2.verify(user.passwordHash, dto.password).catch(() => false)
      : false;

    if (!user || !passwordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.deletedAt || !user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    const accessToken = this.signToken(user);

    await this.audit.log({
      userId: user.id,
      action: AUDIT_ACTIONS.USER_LOGIN,
      entity: AUDIT_ENTITIES.AUTH,
      entityId: user.id,
      metadata: { email: user.email },
    });

    return {
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
      },
    };
  }

  private signToken(user: User): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.sign(payload);
  }
}
