# CashFlow Work Summary

This document records the major suggestions, implementation work, and follow-up recommendations completed so far for the CashFlow project.

## 1. Initial Environment and PostgreSQL Setup

### Advice given

- Recommended PostgreSQL `15+`, with `16` as the preferred version for a new project.
- Confirmed that EDB PostgreSQL on Windows is acceptable.
- Recommended installing at least:
  - `PostgreSQL Server`
  - `Command Line Tools`
- Explained that `createdb` and `psql -f` must be run in PowerShell/CMD, not inside interactive `psql`.
- Identified that multiple PostgreSQL versions were installed on the machine and helped trace port usage:
  - `5432` -> PostgreSQL 14
  - `5433` -> PostgreSQL 13
  - `5434` -> PostgreSQL 16
- Guided the switch so PostgreSQL 16 could be used consistently.
- Helped resolve the schema import failure caused by PostgreSQL 14 not supporting `UNIQUE NULLS NOT DISTINCT`.

### Work completed

- Successfully created the `cashflow` database.
- Successfully imported the schema from:
  - `db/migrations/0001_init.sql`
- Confirmed the main tables were created:
  - `users`
  - `categories`
  - `transactions`
  - `budgets`

## 2. Git and Repository Hygiene

### Advice given

- Confirmed that `node_modules` should not be tracked.
- Explained that `.gitignore` changes can appear delayed in VS Code until Source Control refreshes.

### Work completed

- Added root `.gitignore` with ignores for:
  - `node_modules/`
  - `dist/`
  - `.env`
  - `.env.*`
  - `coverage/`
  - `*.log`

## 3. NestJS Backend Bootstrapping

### Advice given

- Confirmed this repo originally had:
  - `backend/`
  - `db/`
  - `docs/`
- Explained that there was no frontend yet, and the backend started as a NestJS scaffold.
- Clarified that the early backend did not yet require a live PostgreSQL connection just to boot.

### Work completed

- Reviewed backend structure and startup commands.
- Kept backend base URL at:
  - `http://localhost:3000/api/v1`

## 4. Swagger Integration

### Advice given

- Identified that the "NestJS web UI" being remembered was Swagger UI.
- Recommended using Swagger to act as the temporary operational UI while no frontend existed.

### Work completed

- Added Swagger support to NestJS.
- Mounted Swagger UI at:
  - `http://localhost:3000/docs`
- Added package dependencies for Swagger in backend.
- Updated:
  - `backend/src/main.ts`
  - `backend/package.json`

## 5. PostgreSQL Access Layer

### Work completed

- Added a shared PostgreSQL access layer using `pg`:
  - `backend/src/database/database.module.ts`
  - `backend/src/database/database.service.ts`
- Added `.env.example` support for backend DB configuration:
  - `PGHOST`
  - `PGPORT`
  - `PGUSER`
  - `PGPASSWORD`
  - `PGDATABASE`

## 6. Seed Data Workflow

### Advice given

- Recommended creating a Swagger-triggered seed endpoint so demo data could be loaded without a frontend.

### Work completed

- Added `POST /api/v1/dev/seed`
- Added Swagger request-body example for seeding.
- Implemented actual DB writes into:
  - `users`
  - `categories`
  - `transactions`
  - `budgets`
- Added:
  - `backend/src/modules/dev-seed/dev-seed.controller.ts`
  - `backend/src/modules/dev-seed/dev-seed.service.ts`
  - `backend/src/modules/dev-seed/dev-seed.module.ts`

### Follow-up hardening completed later

- Restricted `dev-seed` so it is blocked in production:
  - `NODE_ENV=production` -> returns forbidden

## 7. Backend Read APIs Connected to PostgreSQL

### Advice given

- Recommended making backend endpoints truly read from PostgreSQL before building a frontend.

### Work completed

- Replaced stubbed responses with real database reads for:
  - `GET /api/v1/transactions`
  - `GET /api/v1/categories`
  - `GET /api/v1/budgets`
  - `GET /api/v1/overview`
- Added/updated services and modules:
  - `transactions.service.ts`
  - `categories.service.ts`
  - `budgets.service.ts`
  - `overview.service.ts`

## 8. Backend Write APIs Connected to PostgreSQL

### Work completed

- Connected real PostgreSQL writes for:
  - `POST /api/v1/transactions`
  - `POST /api/v1/categories`
  - `POST /api/v1/budgets`
- Added update/delete support for:
  - `PATCH /api/v1/transactions/:id`
  - `DELETE /api/v1/transactions/:id`
  - `PATCH /api/v1/categories/:id`
  - `DELETE /api/v1/categories/:id`
  - `PATCH /api/v1/budgets`
  - `DELETE /api/v1/budgets/:id`

## 9. Swagger UX Improvements

### Advice given

- Explained why Swagger showed `No parameters` for some query-based endpoints.
- Recommended explicit Swagger metadata for DTO fields and query params.

### Work completed

- Added Swagger decorators so query/body fields display properly.
- Improved Swagger editing experience for:
  - `month`
  - `userEmail`
  - transaction/category/budget request bodies
- Fixed Swagger PATCH body generation by replacing `Partial<CreateTransactionDto>` with a dedicated update DTO.

## 10. ERD and Schema Documentation

### Advice given

- Explained that Prisma Studio is for viewing data, not primarily ERD generation.
- Explained that `prisma-erd-generator` requires `schema.prisma` and does not directly consume raw SQL migrations.

### Work completed

- Added ERD documentation in repo:
  - `docs/erd.md`
- Added Mermaid ERD for current SQL schema.
- Added Prisma schema for documentation/ERD purposes:
  - `backend/prisma/schema.prisma`
- Added Prisma ERD tooling:
  - `prisma`
  - `prisma-erd-generator`
- Added script:
  - `npm run prisma:erd`
- Configured ERD output:
  - `docs/prisma-erd.svg`

## 11. Backend/DB Design Review and Hardening

### Review conclusions

- The DB schema is not overly heavy; it is actually fairly lean.
- The main concerns were not table bloat, but MVP shortcuts in backend logic.

### Key issues identified

- Overuse of default fallback to `demo@cashflow.local`
- Missing ownership validation for `categoryId`
- Missing explicit not-found handling
- `dev-seed` exposed too broadly

### Work completed from review

- Removed automatic fallback to `demo@cashflow.local` from backend services.
- Required explicit `userEmail` in service operations.
- Added ownership validation so category IDs must belong to the same user for:
  - transactions
  - budgets
- Added explicit `400`/`404`-style behavior via Nest exceptions instead of silent success or generic 500s.
- Hardened:
  - `transactions.service.ts`
  - `categories.service.ts`
  - `budgets.service.ts`
  - `overview.service.ts`
  - `dev-seed.controller.ts`

## 12. Frontend Technology Recommendation

### Advice given

- Recommended:
  - `React + Vite + TypeScript`
- Recommended against jumping immediately to:
  - Next.js
  - Ionic UI framework
  - React Native
- Suggested React web first, then later decide whether to wrap as an app.
- Recommended keeping UI components relatively thin so future migration remains possible.

## 13. Frontend Implementation

### Work completed

- Created a new `frontend/` app using:
  - React
  - Vite
  - TypeScript
  - Tailwind CSS
  - React Router
- Added CORS enablement in backend to support local frontend development.
- Added frontend startup instructions in README.
- Configured Vite dev proxy to backend:
  - frontend -> `http://localhost:5173`
  - backend API proxied to `http://localhost:3000`

### Main frontend areas implemented

- Dashboard
- Transactions
- Categories
- Budgets

### Main frontend capabilities implemented

- View overview
- View transactions
- View categories
- View budgets
- Create transaction
- Create category
- Create budget
- Delete transaction

## 14. Internationalization and Theme Support

### Advice given

- Suggested moving from hard-coded bilingual labels to a maintainable i18n structure.
- Suggested implementing black/white theme switching.

### Work completed

- Added simple i18n dictionary system:
  - `frontend/src/lib/i18n.ts`
- Added preferences provider:
  - `frontend/src/providers/PreferencesProvider.tsx`
- Added runtime switch for:
  - `中文 / English`
  - `dark / light`
- Persisted preferences with `localStorage`

## 15. Theme Design Work

### Advice given

- Noted that the first white theme version was functional but visually weak.
- Recommended a `Paper Finance` direction for light theme.

### Work completed

- Refined white theme into a `Paper Finance` style:
  - warm paper background
  - deeper finance-oriented ink text
  - cleaner card styling
  - teal primary emphasis
- Separated dark and light theme background language so white theme does not reuse dark-theme atmosphere.
- Added distinct paper-like background treatment for light mode.

## 16. Important Current Constraints

- Auth is still not fully implemented.
- `userEmail` is still currently passed from UI/API calls rather than coming from a real authenticated user session.
- Prisma schema is used only for ERD/documentation support, not as the source of truth for runtime migrations.
- Frontend currently covers core flows, but not full update/delete coverage across every entity yet.

## 17. Recommended Next Steps

### Backend

1. Replace `userEmail` request usage with real authentication/session handling.
2. Add automated tests for transactions/categories/budgets CRUD behavior.
3. Add DB-level `updated_at` trigger support to reduce manual update responsibility.
4. Add richer error shaping for frontend consumption.

### Frontend

1. Add edit flows for categories, transactions, and budgets.
2. Add inline validation and better error banners.
3. Add charts for monthly overview/reporting.
4. Add a proper top bar / settings surface for language and theme controls.

### Product

1. Implement real registration/login and password hashing flow.
2. Replace dev-only seeding with fixture strategy or admin-only tooling.
3. Decide later whether to:
   - keep this as web-first
   - wrap with Capacitor
   - or pivot toward React Native
