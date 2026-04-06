# CashFlow

MVP scaffold for a monthly income/expense tracking tool.

## Project Structure

- `db/migrations/0001_init.sql`: PostgreSQL initial schema.
- `backend/`: NestJS API scaffold.
- `docs/`: architecture notes, testing docs, ERD, work summaries, and UI wireframes.

Documentation index:

- `docs/README.md`

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
JWT_SECRET=change_me_to_a_long_random_secret
JWT_EXPIRES_IN=7d
DATABASE_URL="postgresql://postgres:your_postgres_password@localhost:5432/cashflow"
```

## Auth Progress

The project now includes a basic JWT authentication foundation:

- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `GET /api/v1/auth/me`

Core business endpoints are in a transition state:

- if a valid Bearer token is present, the backend prefers authenticated user context
- if no token is present yet, the existing `userEmail` request flow still works

This is a temporary bridge while the app moves away from request-level `userEmail`.

## Schema Source Of Truth

Current rule:

- SQL-first for schema intent and PostgreSQL-specific features
- Prisma schema is used as runtime ORM schema and tooling mirror

Important note:

- Prisma does not fully model PostgreSQL `UNIQUE NULLS NOT DISTINCT`
- the reset workflow re-applies PostgreSQL-specific fixes after Prisma schema reset

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

## Backend E2E Tests

Create a dedicated test environment file first:

```bash
cd backend
copy .env.test.example .env.test
```

Update `DATABASE_URL` in `.env.test` to point to a separate PostgreSQL database such as `cashflow_test`.

Then run the e2e suite:

```bash
cd backend
npm install
npm run test:e2e
```

Current e2e coverage focuses on:

- auth register and profile lookup
- protected core CRUD access rules
- category creation
- transaction creation and listing
- budget upsert and listing
- monthly overview aggregation

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
