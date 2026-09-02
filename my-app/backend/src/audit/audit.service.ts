import { Injectable, Logger } from '@nestjs/common';

import { Prisma } from '../generated/prisma/client';
import {
  buildPagination,
  type PaginatedResult,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import type { AuditAction } from './audit.constants';
import { QueryAuditLogDto } from './dto/query-audit-log.dto';

export interface AuditLogInput {
  userId?: string | null;
  action: AuditAction;
  entity: string;
  entityId?: string | null;
  metadata?: Prisma.InputJsonValue;
}

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Best-effort audit write. Never throws: a failure to record an audit
   * entry must not break the action that triggered it.
   */
  async log(input: AuditLogInput): Promise<void> {
    try {
      await this.prisma.auditLog.create({
        data: {
          userId: input.userId ?? null,
          action: input.action,
          entity: input.entity,
          entityId: input.entityId ?? null,
          metadata: input.metadata ?? Prisma.JsonNull,
        },
      });
    } catch (err) {
      this.logger.warn(
        `Failed to write audit log (${input.action}): ${
          err instanceof Error ? err.message : String(err)
        }`,
      );
    }
  }

  async findAll(query: QueryAuditLogDto): Promise<PaginatedResult<unknown>> {
    const { page, limit, skip, take } = buildPagination(
      query.page,
      query.limit,
    );

    const where: Prisma.AuditLogWhereInput = {};
    if (query.entity) where.entity = query.entity;
    if (query.action) where.action = query.action;
    if (query.userId) where.userId = query.userId;

    const [data, total] = await Promise.all([
      this.prisma.auditLog.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: { select: { id: true, name: true, email: true, role: true } },
        },
      }),
      this.prisma.auditLog.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }
}
