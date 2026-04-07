# CashFlow

[![CI](https://github.com/lwwka/CashFlow/actions/workflows/ci.yml/badge.svg)](https://github.com/lwwka/CashFlow/actions/workflows/ci.yml)

CashFlow is a full-stack personal finance application designed to help users move from simple expense tracking to clearer monthly money decisions. Instead of only recording transactions, the product brings together cash flow visibility, monthly savings targets, budget control, import and export workflows, and longer-term financial progress in one place.

Built with React, Vite, NestJS, Prisma, and PostgreSQL, CashFlow includes authentication, transaction and category management, budgeting, monthly and long-term goals, CSV-based import and export, reporting, CI, and production deployment on Vercel and Railway. A major focus of the project was learning how to evolve a system from feature completeness into a more usable product by simplifying flows, reducing cognitive load, and prioritizing the most important user actions.

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

Core business endpoints now use authenticated user context for the main product flow.

## Demo Account

The frontend login form is prefilled with the seeded demo account for faster product walkthroughs:

- email: `demo@cashflow.local`
- password: `demo-password-1234`

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

## Reset Railway PostgreSQL From Windows PowerShell

After setting `DATABASE_URL` to your Railway PostgreSQL `DATABASE_PUBLIC_URL` in `backend/.env`, run:

```powershell
cd backend
npx prisma db push --force-reset --accept-data-loss --schema prisma/schema.prisma
npx prisma db execute --schema prisma/schema.prisma --file .\prisma\post-reset.sql
npx prisma db seed --schema prisma/schema.prisma
```

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

Copy `frontend/.env.example` to `frontend/.env.local` if you want to point the frontend at a specific backend base URL outside the local Vite proxy.

## Production Env / Deploy Baseline

### Railway backend

- `DATABASE_URL=${{Postgres.DATABASE_URL}}`
- `JWT_SECRET=<long random secret>`
- `JWT_EXPIRES_IN=7d`
- `NODE_ENV=production`
- `CORS_ORIGIN=https://your-frontend-domain`
- `ENABLE_SWAGGER=true` only when you intentionally want `/docs` exposed

### Vercel frontend

- `VITE_API_BASE_URL=https://your-railway-backend-domain/api/v1`

After changing env vars:

1. Redeploy the affected service
2. Verify backend health at `/api/v1/health`
3. Verify frontend login can reach the backend without CORS errors

## MVP Smoke Test

Run this short acceptance flow before sharing the app:

1. Open the frontend and confirm the demo account is prefilled
2. Log in successfully
3. Confirm dashboard data loads without `Failed to fetch`
4. Create a category
5. Create a transaction
6. Create or update a budget
7. Refresh the page and confirm session + data still load
8. Run backend e2e tests before pushing a release candidate

## Security Baseline

- Global input validation with `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- Security headers via `helmet`.
- Password requirements prepared for Argon2id integration.
