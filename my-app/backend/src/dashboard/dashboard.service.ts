import { Injectable } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async summary() {
    const [
      totalProducts,
      totalCategories,
      totalSuppliers,
      lowStockCount,
      products,
      recentMovements,
    ] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.category.count({ where: { deletedAt: null } }),
      this.prisma.supplier.count({ where: { deletedAt: null } }),
      this.prisma.product.count({
        where: {
          deletedAt: null,
          stock: { lte: this.prisma.product.fields.minStock },
        },
      }),
      this.prisma.product.findMany({
        where: { deletedAt: null },
        select: { price: true, stock: true },
      }),
      this.prisma.stockMovement.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { product: { select: { id: true, name: true, sku: true } } },
      }),
    ]);

    const totalStockValue = products.reduce(
      (sum, p) => sum + p.price * p.stock,
      0,
    );

    return {
      totalProducts,
      totalCategories,
      totalSuppliers,
      lowStockCount,
      totalStockValue,
      recentMovements,
    };
  }

  lowStockProducts(limit = 5) {
    return this.prisma.product.findMany({
      where: {
        deletedAt: null,
        stock: { lte: this.prisma.product.fields.minStock },
      },
      orderBy: { stock: 'asc' },
      take: limit,
      include: { category: true, supplier: true },
    });
  }

  async stockTrend(days = 14) {
    // Work entirely in UTC so bucket keys match movement timestamps.
    const now = new Date();
    const start = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
    );
    start.setUTCDate(start.getUTCDate() - (days - 1));

    const movements = await this.prisma.stockMovement.findMany({
      where: { createdAt: { gte: start } },
      select: { type: true, quantity: true, createdAt: true },
    });

    // Seed every day in range with zero totals so the chart has no gaps.
    const buckets = new Map<string, { date: string; in: number; out: number }>();
    for (let i = 0; i < days; i++) {
      const d = new Date(start);
      d.setUTCDate(start.getUTCDate() + i);
      const key = d.toISOString().slice(0, 10);
      buckets.set(key, { date: key, in: 0, out: 0 });
    }

    for (const m of movements) {
      const key = m.createdAt.toISOString().slice(0, 10);
      const bucket = buckets.get(key);
      if (!bucket) continue;
      if (m.type === 'IN') bucket.in += m.quantity;
      else bucket.out += m.quantity;
    }

    return Array.from(buckets.values());
  }

  async topStockValue(limit = 5) {
    const products = await this.prisma.product.findMany({
      where: { deletedAt: null },
      select: {
        id: true,
        name: true,
        sku: true,
        price: true,
        stock: true,
      },
    });

    return products
      .map((p) => ({ ...p, stockValue: p.price * p.stock }))
      .sort((a, b) => b.stockValue - a.stockValue)
      .slice(0, limit);
  }
}
