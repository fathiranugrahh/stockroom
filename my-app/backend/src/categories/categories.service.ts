import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '../audit/audit.constants';
import { AuditService } from '../audit/audit.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateCategoryDto, actorId: string) {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    });
    if (existing) {
      throw new ConflictException(`Category "${dto.name}" already exists`);
    }
    const category = await this.prisma.category.create({ data: dto });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.CATEGORY_CREATED,
      entity: AUDIT_ENTITIES.CATEGORY,
      entityId: category.id,
      metadata: { name: category.name },
    });
    return category;
  }

  findAll() {
    return this.prisma.category.findMany({
      where: { deletedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const category = await this.prisma.category.findFirst({
      where: { id, deletedAt: null },
    });
    if (!category) {
      throw new NotFoundException(`Category ${id} not found`);
    }
    return category;
  }

  async update(id: string, dto: UpdateCategoryDto, actorId: string) {
    await this.findOne(id);
    if (dto.name) {
      const clash = await this.prisma.category.findFirst({
        where: { name: dto.name, NOT: { id } },
      });
      if (clash) {
        throw new ConflictException(`Category "${dto.name}" already exists`);
      }
    }
    const category = await this.prisma.category.update({
      where: { id },
      data: dto,
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.CATEGORY_UPDATED,
      entity: AUDIT_ENTITIES.CATEGORY,
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });
    return category;
  }

  async remove(id: string, actorId: string) {
    await this.findOne(id);
    const productCount = await this.prisma.product.count({
      where: { categoryId: id, deletedAt: null },
    });
    if (productCount > 0) {
      throw new ConflictException(
        `Cannot delete category with ${productCount} product(s) attached`,
      );
    }
    await this.prisma.category.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.CATEGORY_DELETED,
      entity: AUDIT_ENTITIES.CATEGORY,
      entityId: id,
    });
    return { id, deleted: true };
  }
}
