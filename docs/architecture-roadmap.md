# CashFlow Architecture Improvement Roadmap

This roadmap captures the next architecture improvements for CashFlow after the current MVP milestone.

## Current State

The project already has:

- PostgreSQL schema and working CRUD flows
- NestJS backend with Swagger
- Prisma-based runtime data access
- React + Vite frontend
- i18n and theme switching

The current structure is good enough for MVP work, but there are still architectural shortcuts that will become harder to maintain as the project grows.

## Primary Improvement Goals

1. Make the backend easier to maintain and reason about
2. Reduce repeated identity and ownership logic
3. Clarify the real schema source of truth
4. Prepare the codebase for authentication
5. Make frontend data flows more scalable

## Phase 1: Stabilize the Current Architecture

### Goal

Reduce duplication and make the current MVP code easier to extend.

### Tasks

- Centralize user scope logic:
  - require `userEmail`
  - load current user by email
  - validate category ownership
- Reduce service duplication in:
  - `transactions`
  - `categories`
  - `budgets`
  - `overview`
- Keep API behavior unchanged while improving internal structure

### Expected outcome

- Smaller service classes
- Fewer repeated checks
- Easier future auth migration

## Phase 2: Define Schema Source of Truth

### Goal

Avoid long-term confusion between SQL migration files and Prisma schema.

### Recommendation

Choose one explicit rule:

- Option A: SQL-first
  - `db/migrations/*.sql` is the source of truth
  - Prisma schema mirrors the DB for runtime + tooling

- Option B: Prisma-first
  - `schema.prisma` becomes the primary source of truth
  - SQL migrations are generated or secondary

### Recommended current direction

For now:

- stay **SQL-first**
- keep Prisma as the runtime client and schema mirror
- document that clearly in the repo

### Expected outcome

- Fewer future schema drift problems
- Clearer maintenance rules

## Phase 3: Authentication and User Context

### Goal

Stop passing `userEmail` through public request bodies and query strings.

### Tasks

- Implement real registration and login
- Add password hashing
- Add JWT or session-based auth
- Replace `userEmail` request parameters with authenticated user context

### Expected outcome

- Cleaner API design
- Better security
- Simpler controller contracts

## Phase 4: Backend Layering Cleanup

### Goal

Move from service-heavy modules to clearer layering.

### Possible direction

- `controllers/`
- `services/`
- `repositories/` or Prisma access helpers
- domain-level validation helpers

### Tasks

- Extract complex mapping logic from services
- Add shared query helpers for list filters
- Standardize not-found / bad-request behavior

### Expected outcome

- Easier onboarding
- Cleaner module responsibilities
- Better long-term maintainability

## Phase 5: Frontend Data Layer

### Goal

Prevent each page from directly owning too much API and state logic.

### Tasks

- Introduce shared data hooks per domain:
  - `useTransactions`
  - `useCategories`
  - `useBudgets`
  - `useOverview`
- Consider React Query or similar later
- Normalize status/error handling

### Expected outcome

- Better reuse
- Cleaner pages
- Simpler loading and mutation flows

## Phase 6: Tests

### Goal

Protect the project before deeper refactors continue.

### Tasks

- Add service-level tests for:
  - transaction create/update/delete
  - category ownership
  - budget upsert behavior
- Add a few integration tests for key API flows

### Expected outcome

- Safer refactoring
- Faster debugging
- Better confidence in auth/data changes

## Suggested Execution Order

1. Centralize user scope / ownership logic
2. Clarify schema source of truth in docs
3. Add auth and replace `userEmail`
4. Add tests
5. Refine frontend data layer
6. Revisit deeper backend layering only if the project keeps growing

## Immediate Next Step

The most practical next move right now is:

- centralize repeated user/category ownership logic
- document SQL-first + Prisma-runtime architecture

This keeps momentum high without forcing a risky rewrite.
