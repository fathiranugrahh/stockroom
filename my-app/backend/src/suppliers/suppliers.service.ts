import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '../audit/audit.constants';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';

@Injectable()
export class SuppliersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateSupplierDto, actorId: string) {
    const supplier = await this.prisma.supplier.create({ data: dto });
    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.SUPPLIER_CREATED,
      entity: AUDIT_ENTITIES.SUPPLIER,
      entityId: supplier.id,
      metadata: { name: supplier.name },
    });
    return supplier;
  }

  findAll() {
    return this.prisma.supplier.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const supplier = await this.prisma.supplier.findFirst({
      where: { id, deletedAt: null },
    });
    if (!supplier) {
      throw new NotFoundException(`Supplier ${id} not found`);
    }
    return supplier;
  }

  async update(id: string, dto: UpdateSupplierDto, actorId: string) {
    await this.findOne(id);
    const supplier = await this.prisma.supplier.update({
      where: { id },
      data: dto,
    });
    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.SUPPLIER_UPDATED,
      entity: AUDIT_ENTITIES.SUPPLIER,
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });
    return supplier;
  }

  async remove(id: string, actorId: string) {
    await this.findOne(id);
    const productCount = await this.prisma.product.count({
      where: { supplierId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete supplier with ${productCount} product(s) attached`,
      );
    }
    await this.prisma.supplier.update({
      where: { id },
      data: { deletedAt: new Date() },
    });
    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.SUPPLIER_DELETED,
      entity: AUDIT_ENTITIES.SUPPLIER,
      entityId: id,
    });
    return { id, deleted: true };
  }
}
