# CashFlow Design Plan

## 中文

### 文件目的

這份文件是 CashFlow 專案目前的設計方案與後續實作計劃。

用途有兩個：

1. 幫你清楚知道目前專案做到哪裡
2. 之後你可以直接按這份文件的章節，叫我逐步改 code

---

### 1. 專案目標

CashFlow 是一個個人理財 / 現金流管理工具，第一階段目標是完成一個可用的 MVP，支援：

- 使用者註冊與登入
- 新增、查看、修改、刪除交易
- 建立與管理分類
- 設定月度預算
- 查看月度總覽
- 之後逐步擴充成更完整的 web app，再視需要包成 mobile app

---

### 2. 目前技術方案

#### 2.1 Backend

- Framework: NestJS
- ORM / Runtime data access: Prisma ORM
- Database: PostgreSQL
- Authentication: JWT
- Validation: class-validator + ValidationPipe
- API docs: Swagger

#### 2.2 Frontend

- Framework: React
- Build tool: Vite
- Language: TypeScript
- Styling: Tailwind CSS
- Routing: React Router
- Auth state: React context
- Preferences: locale/theme context

#### 2.3 Database

- Primary DB: PostgreSQL
- Runtime schema mirror: Prisma schema
- Existing SQL schema intent: `db/migrations/0001_init.sql`

目前採用的實際規則：

- SQL-first 用來保留 PostgreSQL 特性與原始 schema intent
- Prisma schema 用於 runtime、typed client、tooling、reset、seed、ERD

這是一個過渡性但可運作的方案。

---

### 3. 目前已完成的內容

#### 3.1 Database / Prisma

- PostgreSQL 已建立完成
- Prisma client 已接上 backend
- 已有 `db:reset` / `db:seed`
- Prisma seed 已改成 TypeScript
- seed 已做成可重複執行、不會一直累積 demo data
- 已有 Prisma ERD 產出流程

#### 3.2 Backend

- JWT auth foundation 已完成
- `register / login / me` 已可用
- 核心 CRUD 已接上 Prisma
- 核心 endpoint 已改成 auth-first
- Swagger 已支援 Bearer token
- backend e2e smoke test 已建立

#### 3.3 Frontend

- 已有 Dashboard / Transactions / Categories / Budgets / Auth 頁面
- 已有雙語切換
- 已有黑白主題切換
- 白色主題已改成 Paper Finance 方向
- 已接上 login / token flow
- 主流程已改成 token-first

#### 3.4 文件

已建立：

- ERD
- work summary
- auth transition
- architecture roadmap
- testing docs
- docs index

---

### 4. 目前架構判斷

#### 優點

- 模組劃分已經比初期清楚很多
- 核心 flow 已可用
- auth 已開始走正確方向
- Prisma 讓資料層比早期 raw SQL 更容易維護
- frontend 已有基本產品雛形

#### 目前仍需留意的地方

- SQL schema 與 Prisma schema 是雙軌，需要持續自律避免 drift
- backend 仍有部分過渡設計尚未完全拔掉
- frontend data layer 還可以再拆細
- automated tests 還只是第一版
- auth 雖已上軌道，但還未到正式產品安全等級

---

### 5. 設計原則

之後改 code，建議都遵守這幾條：

1. auth-first  
所有核心資料都應以 authenticated user context 為主，不再依賴 request-level `userEmail`

2. incremental refactor  
避免一次性大改；每一步都應該是可 build、可測、可回退的 checkpoint

3. docs stay close to code  
重要架構決策、測試方式、auth flow 都要留在 repo 內

4. reduce duplicated logic  
controller、service、frontend pages 出現重複模式時，優先抽 helper / hook / provider / shared module

5. protect core flows first  
測試與重構優先保護 auth、transactions、categories、budgets、overview

---

### 6. 分階段計劃

## Phase 1：Auth-first Foundation

目標：把系統從 demo / 過渡模式收口成真正登入驅動

已完成大部分：

- JWT register / login / me
- frontend auth provider
- token-first UI flow
- 核心 CRUD 改成需要登入

剩餘工作：

- 清理剩餘 `userEmail` fallback
- 文件與 Swagger 全面對齊 auth-first 行為
- 確認非核心 endpoint 的 auth 策略

---

## Phase 2：Testing & Stability

目標：讓未來重構不容易炸核心流程

目前已完成：

- backend e2e smoke tests

下一步建議：

- 補 login failure case
- 補 transaction update/delete test
- 補 category delete test
- 補 budget delete test
- 補 expired / invalid token case

---

## Phase 3：Frontend Data Layer Cleanup

目標：避免頁面越做越胖，降低維護成本

目前進度：

- 已開始把全包型 `useCashflowData` 拆開
- 已建立：
  - `useOverview`
  - `useTransactions`
  - `useCategories`
  - `useBudgets`

目前仍需持續改善的問題：

- `useCashflowData` 是全包型 hook
- 部分頁面仍同時負責 form、mutation、status、list rendering

下一步建議：

- 拆成：
  - `useOverview`
  - `useTransactions`
  - `useCategories`
  - `useBudgets`
- 視情況引入更清楚的 data fetching pattern
- 把常用 form/mutation state 抽成 reusable hooks

---

## Phase 4：Security Hardening

目標：從「可用 MVP」提升到更接近正式產品

下一步建議：

- 更明確的 auth guard 覆蓋
- 檢查 dev-only endpoint 是否完全隔離
- 補 login rate limiting / brute-force protection
- 評估 refresh token 策略
- 統一 error handling 與 auth error response

---

## Phase 5：Product UX Improvements

目標：把目前可操作系統變成更像產品

下一步建議：

- transaction edit flow
- category management UI improvement
- budget management UI improvement
- 更清楚的 empty states / success states / error states
- overview 視覺化圖表

---

### 7. 建議實作順序

如果我們之後要按計劃逐步改 code，建議順序如下：

1. 清理剩餘 `userEmail` fallback
2. 補 backend e2e coverage
3. 拆 frontend data hooks
4. 補 transaction/category/budget 的 edit/delete 體驗
5. 做安全性 hardening
6. 強化 dashboard / reporting UX

---

### 8. 之後你可以怎樣用這份文件叫我做事

你可以直接這樣說：

- 「按 `design-plan.md` 的 Phase 2 幫我補測試」
- 「按 Phase 3 幫我拆 `useCashflowData`」
- 「按 Phase 4 幫我做 auth 安全性 hardening」
- 「按 Phase 5 幫我改善 dashboard UI」

也可以更細：

- 「先做 Phase 2 的 transaction update/delete test」
- 「先做 Phase 3 的 `useTransactions` hook」

---

### 9. 當前建議

如果現在要繼續往前走，我最建議先做：

1. 補更多 backend e2e 測試
2. 清理剩餘 `userEmail` 過渡痕跡
3. 開始拆 frontend data layer

---

## English

### Purpose

This document is the working design plan for CashFlow.

It serves two goals:

1. to describe the current architecture clearly
2. to provide an execution plan you can use to request future code changes step by step

---

### 1. Project Goal

CashFlow is a personal finance / cashflow tracking application.

The first product goal is to deliver a usable MVP that supports:

- user registration and login
- transaction CRUD
- category management
- monthly budget management
- monthly overview
- a gradual path from web MVP to a more complete app

---

### 2. Current Technical Direction

#### 2.1 Backend

- Framework: NestJS
- ORM / runtime data access: Prisma ORM
- Database: PostgreSQL
- Authentication: JWT
- Validation: class-validator + ValidationPipe
- API docs: Swagger

#### 2.2 Frontend

- Framework: React
- Build tool: Vite
- Language: TypeScript
- Styling: Tailwind CSS
- Routing: React Router
- Auth state: React context
- Preferences: locale/theme context

#### 2.3 Database

- Primary DB: PostgreSQL
- Runtime schema mirror: Prisma schema
- Existing SQL schema intent: `db/migrations/0001_init.sql`

Current practical rule:

- SQL-first for PostgreSQL-specific intent and schema history
- Prisma schema for runtime access, typed client, reset/seed workflow, and tooling

---

### 3. What Is Already Done

#### 3.1 Database / Prisma

- PostgreSQL is set up
- Prisma client is wired into the backend
- `db:reset` / `db:seed` are available
- Prisma seed is now TypeScript-based
- seed data is idempotent
- Prisma ERD generation is available

#### 3.2 Backend

- JWT auth foundation exists
- `register / login / me` work
- core CRUD runs through Prisma
- core endpoints are now auth-first
- Swagger supports bearer auth
- backend e2e smoke tests exist

#### 3.3 Frontend

- Dashboard / Transactions / Categories / Budgets / Auth pages exist
- bilingual support exists
- dark/light theme switching exists
- the light theme has been refined into a Paper Finance direction
- login/token flow is connected
- the main flow is token-first

#### 3.4 Docs

The repo already includes:

- ERD
- work summaries
- auth transition notes
- architecture roadmap
- testing docs
- docs index

---

### 4. Current Architecture Assessment

#### Strengths

- module boundaries are much clearer than at the start
- core flows are usable
- auth is moving in the right direction
- Prisma has improved maintainability compared to earlier raw SQL
- the frontend already looks like a real product skeleton

#### Remaining Concerns

- SQL schema and Prisma schema are still dual-track
- some transition-era backend behavior still exists
- the frontend data layer can still be decomposed further
- automated tests are only at the first stage
- auth is usable, but not yet production-grade

---

### 5. Design Principles

Future code changes should follow these principles:

1. auth-first  
core data access should use authenticated user context rather than request-level `userEmail`

2. incremental refactor  
avoid big-bang rewrites; each step should remain buildable, testable, and reversible

3. docs stay close to code  
important architecture, auth, and testing notes should live inside the repo

4. reduce duplicated logic  
when patterns repeat across controllers, services, pages, or hooks, extract them

5. protect core flows first  
tests and refactors should prioritize auth, transactions, categories, budgets, and overview

---

### 6. Phased Plan

## Phase 1: Auth-first Foundation

Goal: move from transition/demo identity flow into a real auth-driven model

Mostly completed:

- JWT register / login / me
- frontend auth provider
- token-first UI flow
- protected core CRUD

Remaining work:

- remove remaining `userEmail` fallback
- align docs and Swagger fully with auth-first behavior
- finalize auth strategy for non-core endpoints

---

## Phase 2: Testing & Stability

Goal: reduce fear of regressions during future refactors

Already done:

- backend e2e smoke tests

Recommended next work:

- login failure cases
- transaction update/delete test coverage
- category delete coverage
- budget delete coverage
- expired / invalid token coverage

---

## Phase 3: Frontend Data Layer Cleanup

Goal: avoid page bloat and improve maintainability

Current progress:

- the former all-in-one `useCashflowData` flow has started to be split
- the project now has:
  - `useOverview`
  - `useTransactions`
  - `useCategories`
  - `useBudgets`

Remaining issues:

- `useCashflowData` is still an all-in-one hook
- some pages still combine form logic, mutation logic, status messaging, and list rendering

Recommended next work:

- split into:
  - `useOverview`
  - `useTransactions`
  - `useCategories`
  - `useBudgets`
- adopt a clearer data-fetching pattern
- extract reusable form/mutation helpers when patterns repeat

---

## Phase 4: Security Hardening

Goal: move from “usable MVP” toward a safer application baseline

Recommended next work:

- review auth guard coverage
- isolate dev-only endpoints more strictly
- add login rate limiting / brute-force protection
- evaluate refresh token strategy
- unify auth-related error handling

---

## Phase 5: Product UX Improvements

Goal: turn the current working system into a more polished product

Recommended next work:

- transaction edit flow
- stronger category management UX
- stronger budget management UX
- clearer empty / success / error states
- overview data visualizations

---

### 7. Recommended Execution Order

Recommended order for future implementation:

1. remove remaining `userEmail` fallback
2. expand backend e2e coverage
3. split frontend data hooks
4. improve transaction/category/budget edit/delete UX
5. harden security behavior
6. improve dashboard and reporting UX

---

### 8. How To Use This Document To Direct Future Work

You can now ask for work like:

- “Follow Phase 2 in `design-plan.md` and add more tests.”
- “Follow Phase 3 and split `useCashflowData`.”
- “Follow Phase 4 and harden auth/security.”
- “Follow Phase 5 and improve the dashboard UI.”

Or more specifically:

- “Do Phase 2 transaction update/delete tests first.”
- “Do the `useTransactions` hook first.”

---

### 9. Current Recommendation

If we continue now, the best next steps are:

1. expand backend e2e coverage
2. remove the remaining `userEmail` transition traces
3. start splitting the frontend data layer
