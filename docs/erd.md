# CashFlow ERD

This document describes the current PostgreSQL schema defined in `db/migrations/0001_init.sql`.

## Mermaid ERD

```mermaid
erDiagram
    USERS {
        uuid id PK
        varchar email UK
        varchar password_hash
        timestamptz created_at
        timestamptz updated_at
    }

    CATEGORIES {
        uuid id PK
        uuid user_id FK
        varchar name
        transaction_type type
        timestamptz created_at
        timestamptz updated_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        transaction_type type
        numeric amount
        date occurred_on
        varchar note
        timestamptz created_at
        timestamptz updated_at
        timestamptz deleted_at
    }

    BUDGETS {
        uuid id PK
        uuid user_id FK
        uuid category_id FK
        char month
        numeric amount
        timestamptz created_at
        timestamptz updated_at
    }

    USERS ||--o{ CATEGORIES : owns
    USERS ||--o{ TRANSACTIONS : records
    USERS ||--o{ BUDGETS : sets
    CATEGORIES ||--o{ TRANSACTIONS : classifies
    CATEGORIES ||--o{ BUDGETS : scopes
```

## Relationship Notes

- `users` is the root entity for all business data.
- `categories` belongs to a user and is unique by `(user_id, name, type)`.
- `transactions` belongs to a user and may optionally reference a category.
- `budgets` belongs to a user and may optionally reference a category.
- `transactions.deleted_at` is used for soft delete.
- `budgets.category_id = NULL` represents a whole-month budget instead of a category-specific budget.

## UI Mapping

- Dashboard / overview:
  - `transactions`
  - `budgets`
- Transactions page:
  - `transactions`
  - `categories`
- Categories page:
  - `categories`
- Budgets page:
  - `budgets`
  - `categories`
