import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as argon2 from 'argon2';

import { Role } from '../generated/prisma/enums';
import { Prisma, type User } from '../generated/prisma/client';
import {
  buildPagination,
  type PaginatedResult,
} from '../common/dto/pagination.dto';
import { AuditService } from '../audit/audit.service';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '../audit/audit.constants';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { QueryUserDto } from './dto/query-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

export type SafeUser = Omit<User, 'passwordHash'>;

function sanitize(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...rest } = user;
  return rest;
}

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ---- Auth helpers (return full record incl. passwordHash) ----

  findByEmailForAuth(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findByIdForAuth(id: string): Promise<User | null> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null, isActive: true },
    });
    return user;
  }

  // ---- Admin CRUD ----

  async create(dto: CreateUserDto, actorId: string): Promise<SafeUser> {
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existing) {
      throw new ConflictException(`Email "${dto.email}" is already in use`);
    }

    const passwordHash = await argon2.hash(dto.password);
    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
        isActive: dto.isActive ?? true,
      },
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.USER_CREATED,
      entity: AUDIT_ENTITIES.USER,
      entityId: user.id,
      metadata: { email: user.email, role: user.role },
    });

    return sanitize(user);
  }

  async findAll(query: QueryUserDto): Promise<PaginatedResult<SafeUser>> {
    const { page, limit, skip, take } = buildPagination(
      query.page,
      query.limit,
    );
    const where = { deletedAt: null };

    const [data, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: data.map(sanitize),
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string): Promise<SafeUser> {
    const user = await this.getActiveUserOrThrow(id);
    return sanitize(user);
  }

  async update(
    id: string,
    dto: UpdateUserDto,
    actorId: string,
  ): Promise<SafeUser> {
    const target = await this.getActiveUserOrThrow(id);
    const isSelf = actorId === id;

    // A user cannot change their own role.
    if (isSelf && dto.role !== undefined && dto.role !== target.role) {
      throw new ForbiddenException('You cannot change your own role');
    }

    // A user cannot disable their own account.
    if (isSelf && dto.isActive === false) {
      throw new ForbiddenException('You cannot disable your own account');
    }

    // Protect the last active ADMIN from being demoted or disabled.
    const demoting = dto.role !== undefined && dto.role !== Role.ADMIN;
    const disabling = dto.isActive === false;
    if (
      target.role === Role.ADMIN &&
      target.isActive &&
      (demoting || disabling)
    ) {
      await this.assertNotLastActiveAdmin(id);
    }

    // Email uniqueness (excluding self).
    if (dto.email && dto.email !== target.email) {
      const clash = await this.prisma.user.findFirst({
        where: { email: dto.email, NOT: { id } },
      });
      if (clash) {
        throw new ConflictException(`Email "${dto.email}" is already in use`);
      }
    }

    const data: Prisma.UserUpdateInput = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.email !== undefined) data.email = dto.email;
    if (dto.role !== undefined) data.role = dto.role;
    if (dto.isActive !== undefined) data.isActive = dto.isActive;
    if (dto.password) data.passwordHash = await argon2.hash(dto.password);

    const updated = await this.prisma.user.update({ where: { id }, data });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.USER_UPDATED,
      entity: AUDIT_ENTITIES.USER,
      entityId: id,
      metadata: { fields: Object.keys(data) },
    });

    return sanitize(updated);
  }

  async remove(id: string, actorId: string) {
    const target = await this.getActiveUserOrThrow(id);

    if (actorId === id) {
      throw new ForbiddenException('You cannot delete your own account');
    }

    if (target.role === Role.ADMIN && target.isActive) {
      await this.assertNotLastActiveAdmin(id);
    }

    await this.prisma.user.update({
      where: { id },
      data: { deletedAt: new Date(), isActive: false },
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.USER_DELETED,
      entity: AUDIT_ENTITIES.USER,
      entityId: id,
      metadata: { email: target.email },
    });

    return { id, deleted: true };
  }

  // ---- helpers ----

  private async getActiveUserOrThrow(id: string): Promise<User> {
    const user = await this.prisma.user.findFirst({
      where: { id, deletedAt: null },
    });
    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }
    return user;
  }

  private async assertNotLastActiveAdmin(excludeId: string): Promise<void> {
    const otherActiveAdmins = await this.prisma.user.count({
      where: {
        role: Role.ADMIN,
        isActive: true,
        deletedAt: null,
        NOT: { id: excludeId },
      },
    });
    if (otherActiveAdmins === 0) {
      throw new ConflictException(
        'Cannot remove or disable the last active administrator',
      );
    }
  }
}
