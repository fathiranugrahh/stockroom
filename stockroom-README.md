# Stockroom

> Full-stack inventory management system built for small businesses (UMKM).

[![NestJS](https://img.shields.io/badge/NestJS-11-E0234E?logo=nestjs)](https://nestjs.com/)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## About

Stockroom helps small businesses keep track of their stock without spreadsheets. It covers the full inventory workflow: products and categories, suppliers, stock movements in and out, user accounts, and a complete audit log of every change — with a dashboard overview on top.

The backend is a NestJS API with JWT authentication and a PostgreSQL database. The frontend is a Next.js app built with shadcn/ui.

## Features

- 📦 **Products & categories** — manage your catalog
- 🏭 **Suppliers** — track where stock comes from
- 🔄 **Stock movements** — record stock in and out
- 👥 **Users** — account and role management
- 📋 **Audit logs** — every stock change, recorded
- 📊 **Dashboard** — stock overview at a glance
- 🔐 **JWT authentication** — secure login with argon2 password hashing
- 📄 **Swagger API docs** — interactive API documentation

## Tech Stack

**Backend** — NestJS 11, Prisma ORM, PostgreSQL, Supabase, Passport JWT, argon2, Swagger, Helmet, rate limiting, Multer (file uploads).

**Frontend** — Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, TanStack Query, React Hook Form + Zod, Sonner.

## Project Structure

```
stockroom/
└── my-app/
    ├── backend/    # NestJS API
    │   ├── src/    # Modules, controllers, services
    │   ├── prisma/ # Schema & migrations
    │   └── test/   # Unit & e2e tests
    └── frontend/   # Next.js app
        ├── app/        # Routes
        ├── features/   # products, categories, suppliers,
        │               # stock-movements, users, audit-logs, dashboard
        ├── components/ # shadcn/ui components
        └── lib/        # Utilities
```

## Getting Started

### Backend

```bash
cd my-app/backend
npm install

# Create a .env file with your database URL, Supabase keys, and JWT secret
npx prisma migrate dev

# Optional: load sample data
npm run seed

# Start the development server
npm run start:dev
```

### Frontend

```bash
cd my-app/frontend
npm install
npm run dev
```

Swagger API documentation is available while the backend server is running.

## License

MIT — free to use and modify.

---

Built by [Fathir Anugrah](https://github.com/fathiranugrahh) · [fathiranugrah.com](https://fathiranugrah.com)
