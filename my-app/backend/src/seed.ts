import 'dotenv/config';

import { PrismaPg } from '@prisma/adapter-pg';
import * as argon2 from 'argon2';

import {
  PrismaClient,
  type Category,
  type Supplier,
} from './generated/prisma/client';
import { Role, StockMovementType } from './generated/prisma/enums';

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DATABASE_URL,
  }),
});

// --- Seed data definitions ---

const categories = [
  { name: 'Electronics', description: 'Phones, laptops, and gadgets' },
  { name: 'Groceries', description: 'Food and daily essentials' },
  { name: 'Office Supplies', description: 'Stationery and office equipment' },
  { name: 'Home & Kitchen', description: 'Household and kitchen items' },
  { name: 'Apparel', description: 'Clothing and accessories' },
];

const suppliers = [
  {
    name: 'PT Sumber Elektronik',
    email: 'sales@sumberelektronik.co.id',
    phone: '+62211234567',
    address: 'Jl. Mangga Dua No. 1, Jakarta',
  },
  {
    name: 'CV Pangan Sejahtera',
    email: 'order@pangansejahtera.co.id',
    phone: '+62222345678',
    address: 'Jl. Soekarno Hatta No. 88, Bandung',
  },
  {
    name: 'Global Office Supply',
    email: 'cs@globaloffice.com',
    phone: '+62213456789',
    address: 'Jl. Gatot Subroto No. 12, Jakarta',
  },
  {
    name: 'Rumah Tangga Makmur',
    email: 'info@rtmakmur.co.id',
    phone: '+62315678901',
    address: 'Jl. Diponegoro No. 45, Surabaya',
  },
  {
    name: 'Fashion Grosir Nusantara',
    email: 'grosir@fashionnusantara.co.id',
    phone: '+62274678123',
    address: 'Jl. Malioboro No. 7, Yogyakarta',
  },
];

// product template: [name, sku, price, stock, minStock, categoryIndex, supplierIndex|null]
type ProductSeed = {
  name: string;
  sku: string;
  price: number;
  stock: number;
  minStock: number;
  categoryIndex: number;
  supplierIndex: number | null;
};

const products: ProductSeed[] = [
  // Electronics (cat 0, sup 0)
  { name: 'Wireless Mouse', sku: 'ELEC-MOUSE-001', price: 150000, stock: 40, minStock: 10, categoryIndex: 0, supplierIndex: 0 },
  { name: 'Mechanical Keyboard', sku: 'ELEC-KEYB-002', price: 750000, stock: 8, minStock: 10, categoryIndex: 0, supplierIndex: 0 },
  { name: 'USB-C Charger 65W', sku: 'ELEC-CHRG-003', price: 350000, stock: 25, minStock: 8, categoryIndex: 0, supplierIndex: 0 },
  { name: '27-inch Monitor', sku: 'ELEC-MON-004', price: 2800000, stock: 5, minStock: 3, categoryIndex: 0, supplierIndex: 0 },
  // Groceries (cat 1, sup 1)
  { name: 'Rice 5kg', sku: 'GROC-RICE-001', price: 68000, stock: 120, minStock: 30, categoryIndex: 1, supplierIndex: 1 },
  { name: 'Cooking Oil 2L', sku: 'GROC-OIL-002', price: 42000, stock: 15, minStock: 20, categoryIndex: 1, supplierIndex: 1 },
  { name: 'Instant Noodles (pack of 5)', sku: 'GROC-NOOD-003', price: 15000, stock: 200, minStock: 50, categoryIndex: 1, supplierIndex: 1 },
  { name: 'Sugar 1kg', sku: 'GROC-SUGR-004', price: 16000, stock: 60, minStock: 25, categoryIndex: 1, supplierIndex: 1 },
  // Office Supplies (cat 2, sup 2)
  { name: 'A4 Paper Ream', sku: 'OFFC-PAPR-001', price: 55000, stock: 80, minStock: 20, categoryIndex: 2, supplierIndex: 2 },
  { name: 'Ballpoint Pen (box of 12)', sku: 'OFFC-PEN-002', price: 30000, stock: 45, minStock: 15, categoryIndex: 2, supplierIndex: 2 },
  { name: 'Stapler', sku: 'OFFC-STPL-003', price: 25000, stock: 3, minStock: 5, categoryIndex: 2, supplierIndex: 2 },
  { name: 'Sticky Notes Pack', sku: 'OFFC-NOTE-004', price: 18000, stock: 70, minStock: 20, categoryIndex: 2, supplierIndex: 2 },
  // Home & Kitchen (cat 3, sup 3)
  { name: 'Non-stick Frying Pan', sku: 'HOME-PAN-001', price: 180000, stock: 22, minStock: 8, categoryIndex: 3, supplierIndex: 3 },
  { name: 'Ceramic Dinner Set', sku: 'HOME-DINE-002', price: 420000, stock: 6, minStock: 5, categoryIndex: 3, supplierIndex: 3 },
  { name: 'Electric Kettle', sku: 'HOME-KETL-003', price: 210000, stock: 0, minStock: 6, categoryIndex: 3, supplierIndex: 3 },
  { name: 'Kitchen Knife Set', sku: 'HOME-KNIF-004', price: 260000, stock: 18, minStock: 6, categoryIndex: 3, supplierIndex: 3 },
  // Apparel (cat 4, sup 4)
  { name: 'Cotton T-Shirt', sku: 'APRL-TSHT-001', price: 85000, stock: 150, minStock: 40, categoryIndex: 4, supplierIndex: 4 },
  { name: 'Denim Jeans', sku: 'APRL-JEAN-002', price: 250000, stock: 35, minStock: 15, categoryIndex: 4, supplierIndex: 4 },
  { name: 'Hoodie', sku: 'APRL-HOOD-003', price: 195000, stock: 12, minStock: 15, categoryIndex: 4, supplierIndex: 4 },
  // one product with no supplier
  { name: 'Canvas Tote Bag', sku: 'APRL-TOTE-004', price: 60000, stock: 48, minStock: 20, categoryIndex: 4, supplierIndex: null },
];

// Which product SKUs get movement history, and their movement sequence.
// Each entry: sku -> list of [type, quantity, daysAgo]
const movementPlan: Record<
  string,
  Array<{ type: StockMovementType; quantity: number; daysAgo: number; note: string }>
> = {
  'ELEC-MOUSE-001': [
    { type: StockMovementType.IN, quantity: 50, daysAgo: 6, note: 'Initial restock' },
    { type: StockMovementType.OUT, quantity: 10, daysAgo: 2, note: 'Sales order #1021' },
  ],
  'GROC-RICE-001': [
    { type: StockMovementType.IN, quantity: 150, daysAgo: 5, note: 'Bulk purchase' },
    { type: StockMovementType.OUT, quantity: 30, daysAgo: 3, note: 'Wholesale order' },
  ],
  'GROC-NOOD-003': [
    { type: StockMovementType.IN, quantity: 240, daysAgo: 4, note: 'Warehouse transfer' },
    { type: StockMovementType.OUT, quantity: 40, daysAgo: 1, note: 'Retail distribution' },
  ],
  'OFFC-PAPR-001': [
    { type: StockMovementType.IN, quantity: 100, daysAgo: 7, note: 'Supplier delivery' },
    { type: StockMovementType.OUT, quantity: 20, daysAgo: 2, note: 'Office consumption' },
  ],
  'APRL-TSHT-001': [
    { type: StockMovementType.IN, quantity: 200, daysAgo: 6, note: 'New batch' },
    { type: StockMovementType.OUT, quantity: 50, daysAgo: 1, note: 'Store order' },
  ],
  'HOME-PAN-001': [
    { type: StockMovementType.IN, quantity: 30, daysAgo: 3, note: 'Restock' },
    { type: StockMovementType.OUT, quantity: 8, daysAgo: 1, note: 'Sales' },
  ],
  'ELEC-MON-004': [
    { type: StockMovementType.IN, quantity: 8, daysAgo: 5, note: 'Supplier delivery' },
    { type: StockMovementType.OUT, quantity: 3, daysAgo: 2, note: 'Corporate order' },
  ],
  'APRL-JEAN-002': [
    { type: StockMovementType.IN, quantity: 40, daysAgo: 4, note: 'New stock' },
    { type: StockMovementType.OUT, quantity: 5, daysAgo: 1, note: 'Sales' },
  ],
};

function daysAgoDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

async function main() {
  console.log('🌱 Seeding database...');

  // Default admin (idempotent: keep existing admin/password on reseed).
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@inventory.local';
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
  const adminName = process.env.SEED_ADMIN_NAME ?? 'Administrator';
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash: await argon2.hash(adminPassword),
      role: Role.ADMIN,
      isActive: true,
    },
  });
  console.log(`  • Ensured admin user ${adminEmail}`);

  // Clean existing data (FK-safe order).
  console.log('  • Clearing existing data');
  await prisma.stockMovement.deleteMany();
  await prisma.product.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.category.deleteMany();

  // Categories
  const createdCategories: Category[] = [];
  for (const c of categories) {
    createdCategories.push(await prisma.category.create({ data: c }));
  }
  console.log(`  • Created ${createdCategories.length} categories`);

  // Suppliers
  const createdSuppliers: Supplier[] = [];
  for (const s of suppliers) {
    createdSuppliers.push(await prisma.supplier.create({ data: s }));
  }
  console.log(`  • Created ${createdSuppliers.length} suppliers`);

  // Products
  const skuToId = new Map<string, string>();
  for (const p of products) {
    const created = await prisma.product.create({
      data: {
        name: p.name,
        sku: p.sku,
        price: p.price,
        stock: p.stock,
        minStock: p.minStock,
        categoryId: createdCategories[p.categoryIndex].id,
        supplierId:
          p.supplierIndex === null
            ? null
            : createdSuppliers[p.supplierIndex].id,
      },
    });
    skuToId.set(p.sku, created.id);
  }
  console.log(`  • Created ${products.length} products`);

  // Stock movements (history only; product.stock above is treated as current).
  let movementCount = 0;
  for (const [sku, moves] of Object.entries(movementPlan)) {
    const productId = skuToId.get(sku);
    if (!productId) continue;
    for (const m of moves) {
      await prisma.stockMovement.create({
        data: {
          productId,
          type: m.type,
          quantity: m.quantity,
          note: m.note,
          createdAt: daysAgoDate(m.daysAgo),
        },
      });
      movementCount++;
    }
  }
  console.log(`  • Created ${movementCount} stock movements`);

  console.log('✅ Seeding complete.');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exitCode = 1;
  })
  .finally(() => {
    void prisma.$disconnect();
  });
