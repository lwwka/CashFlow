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

## Security Baseline

- Global input validation with `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- Security headers via `helmet`.
- Password requirements prepared for Argon2id integration.
