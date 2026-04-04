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

## Security Baseline

- Global input validation with `ValidationPipe` (`whitelist`, `forbidNonWhitelisted`).
- Security headers via `helmet`.
- Password requirements prepared for Argon2id integration.
