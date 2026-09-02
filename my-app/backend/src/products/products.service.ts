import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { Prisma, type Product } from '../generated/prisma/client';
import { AUDIT_ACTIONS, AUDIT_ENTITIES } from '../audit/audit.constants';
import { AuditService } from '../audit/audit.service';
import {
  buildPagination,
  type PaginatedResult,
} from '../common/dto/pagination.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

const productInclude = {
  category: true,
  supplier: true,
} as const;

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  async create(dto: CreateProductDto, actorId: string) {
    await this.assertCategoryExists(dto.categoryId);
    await this.assertSupplierExists(dto.supplierId);
    await this.assertSkuAvailable(dto.sku);

    const product = await this.prisma.product.create({
      data: {
        name: dto.name,
        sku: dto.sku,
        price: dto.price,
        stock: dto.stock ?? 0,
        minStock: dto.minStock ?? 0,
        categoryId: dto.categoryId,
        supplierId: dto.supplierId ?? null,
      },
      include: productInclude,
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.PRODUCT_CREATED,
      entity: AUDIT_ENTITIES.PRODUCT,
      entityId: product.id,
      metadata: { name: product.name, sku: product.sku },
    });
    return product;
  }

  async findAll(query: QueryProductDto): Promise<PaginatedResult<Product>> {
    const { page, limit, skip, take } = buildPagination(
      query.page,
      query.limit,
    );

    const where: Prisma.ProductWhereInput = { deletedAt: null };

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { sku: { contains: query.search, mode: 'insensitive' } },
      ];
    }
    if (query.categoryId) where.categoryId = query.categoryId;
    if (query.supplierId) where.supplierId = query.supplierId;
    if (query.lowStock) {
      where.stock = { lte: this.prisma.product.fields.minStock };
    }

    const [data, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: productInclude,
        skip,
        take,
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    };
  }

  async findOne(id: string) {
    const product = await this.prisma.product.findFirst({
      where: { id, deletedAt: null },
      include: productInclude,
    });
    if (!product) {
      throw new NotFoundException(`Product ${id} not found`);
    }
    return product;
  }

  async update(id: string, dto: UpdateProductDto, actorId: string) {
    await this.findOne(id);

    if (dto.categoryId) await this.assertCategoryExists(dto.categoryId);
    if (dto.supplierId) await this.assertSupplierExists(dto.supplierId);
    if (dto.sku) await this.assertSkuAvailable(dto.sku, id);

    const product = await this.prisma.product.update({
      where: { id },
      data: dto,
      include: productInclude,
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.PRODUCT_UPDATED,
      entity: AUDIT_ENTITIES.PRODUCT,
      entityId: id,
      metadata: { fields: Object.keys(dto) },
    });
    return product;
  }

  async remove(id: string, actorId: string) {
    await this.findOne(id);
    await this.prisma.product.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    await this.audit.log({
      userId: actorId,
      action: AUDIT_ACTIONS.PRODUCT_DELETED,
      entity: AUDIT_ENTITIES.PRODUCT,
      entityId: id,
    });
    return { id, deleted: true };
  }

  private async assertCategoryExists(categoryId: string) {
    const category = await this.prisma.category.findFirst({
      where: { id: categoryId, deletedAt: null },
    });
    if (!category) {
      throw new BadRequestException(`Category ${categoryId} does not exist`);
    }
  }

  private async assertSupplierExists(supplierId?: string | null) {
    if (!supplierId) return;
    const supplier = await this.prisma.supplier.findFirst({
      where: { id: supplierId, deletedAt: null },
    });
    if (!supplier) {
      throw new BadRequestException(`Supplier ${supplierId} does not exist`);
    }
  }

  private async assertSkuAvailable(sku: string, exceptId?: string) {
    const existing = await this.prisma.product.findUnique({ where: { sku } });
    if (existing && existing.id !== exceptId) {
      throw new ConflictException(`SKU "${sku}" is already in use`);
    }
  }
}
