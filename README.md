# CashFlow

MVP scaffold for a monthly income/expense tracking tool.

## Project Structure

- `db/migrations/0001_init.sql`: PostgreSQL initial schema.
- `backend/`: NestJS API scaffold.
- `docs/wireframes.md`: MVP UI wireframes.

## Quick Start (Backend)

```bash
cd backend
npm install
npm run prisma:generate
npm run start:dev
```

API base: `http://localhost:3000/api/v1`
Swagger UI: `http://localhost:3000/docs`

## PostgreSQL Connection

Copy `backend/.env.example` to `backend/.env` and set your PostgreSQL password:

```bash
PGHOST=localhost
PGPORT=5432
PGUSER=postgres
PGPASSWORD=your_postgres_password
PGDATABASE=cashflow
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/cashflow"
```

## Load Demo Data From Swagger

Start the backend, open Swagger, then call `POST /api/v1/dev/seed`.

Swagger includes a ready-to-use JSON example. When it succeeds, demo data is inserted into:

- `users`
- `categories`
- `transactions`
- `budgets`

## Generate Prisma ERD

Prisma is configured here as a schema-to-ERD tool for documentation.

```bash
cd backend
npm install
npm run prisma:erd
```

Generated file:

- `docs/prisma-erd.svg`

## Reset Database With Prisma

You can rebuild the local development database and load demo data with:

```bash
cd backend
npm run db:reset
```

This flow will:

1. Ensure PostgreSQL extension setup
2. Reset the schema with Prisma
3. Re-apply PostgreSQL-specific constraint/index fixes
4. Run the Prisma seed script

## Initialize Demo Data Only

If the schema is already present and you only want to insert demo data:

```bash
cd backend
npm run db:seed
```

## Recommended Local DB Workflow

Use this when setting up the project on a new machine:

```bash
cd backend
npm install
npm run prisma:generate
npm run db:reset
```

Use this when the schema already exists and you only want to reload demo data:

```bash
cd backend
npm run db:seed
```

## Frontend

The repo now includes a React + Vite + TypeScript frontend in `frontend/`.

```bash
cd frontend
npm install
npm run dev
```

Frontend app:

- `http://localhost:5173`

The Vite dev server proxies `/api/*` to the Nest backend on `http://localhost:3000`.

## Security Baseline

- Global input validation with `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- Security headers via `helmet`.
- Password requirements prepared for Argon2id integration.
