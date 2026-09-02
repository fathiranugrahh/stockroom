import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { StockMovementType } from '../generated/prisma/enums';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '../audit/audit.constants';
import { AuditService } from '../audit/audit.service';
import { buildPagination } from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { QueryStockMovementDto } from './dto/query-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async stockIn(dto: CreateStockMovementDto, actorId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: dto.productId, deletedAt: null },
      });
      if (!product) {
        throw new NotFoundException(`Product ${dto.productId} not found`);
      }

      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          type: StockMovementType.IN,
          quantity: dto.quantity,
          note: dto.note ?? null,
        },
      });

      const updated = await tx.product.update({
        where: { id: dto.productId },
        data: { stock: { increment: dto.quantity } },
      });

      return { movement, product: updated };
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.STOCK_IN,
      entity: AUDIT_ENTITIES.STOCK_MOVEMENT,
      entityId: result.movement.id,
      metadata: {
        productId: dto.productId,
        quantity: dto.quantity,
        resultingStock: result.product.stock,
      },
    });

    return result;
  }

  async stockOut(dto: CreateStockMovementDto, actorId: string) {
    const result = await this.prisma.$transaction(async (tx) => {
      const product = await tx.product.findFirst({
        where: { id: dto.productId, deletedAt: null },
      });
      if (!product) {
        throw new NotFoundException(`Product ${dto.productId} not found`);
      }

      if (dto.quantity > product.stock) {
        throw new BadRequestException(
          `Insufficient stock: requested ${dto.quantity}, available ${product.stock}`,
        );
      }

      const movement = await tx.stockMovement.create({
        data: {
          productId: dto.productId,
          type: StockMovementType.OUT,
          quantity: dto.quantity,
          note: dto.note ?? null,
        },
      });

      const updated = await tx.product.update({
        where: { id: dto.productId },
        data: { stock: { decrement: dto.quantity } },
      });

      return { movement, product: updated };
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.STOCK_OUT,
      entity: AUDIT_ENTITIES.STOCK_MOVEMENT,
      entityId: result.movement.id,
      metadata: {
        productId: dto.productId,
        quantity: dto.quantity,
        resultingStock: result.product.stock,
      },
    });

    return result;
  }

  async findAll(query: QueryStockMovementDto) {
    const { page, limit, skip, take } = buildPagination(
      query.page,
      query.limit,
    );
    const where = query.productId ? { productId: query.productId } : undefined;

    const [data, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { product: true },
        skip,
        take,
      }),
      this.prisma.stockMovement.count({ where }),
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
