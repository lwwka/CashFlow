# Testing

## 中文

### 目前有哪些測試

CashFlow 目前已加入一組 backend e2e 測試，用來保護最重要的核心流程：

- 註冊 `register`
- 取得目前登入使用者 `auth/me`
- 核心 CRUD 未登入時會被擋下
- 建立分類 `categories`
- 建立交易 `transactions`
- 建立或更新預算 `budgets`
- 月度總覽 `overview`

測試檔案位置：

- [`backend/test/app.e2e-spec.ts`](../backend/test/app.e2e-spec.ts)

### 這些測試在測什麼

這些不是單元測試，而是 e2e 測試，也就是端到端測試。

它會真的：

- 建立 Nest application
- 經過 controller、guard、validation、service、Prisma
- 真正打 API
- 真正碰到 test database

所以它是在驗證整條流程是否正常，而不是只測某一個 function。

### 測試前準備

先建立測試環境檔案：

```bash
cd backend
copy .env.test.example .env.test
```

把 `.env.test` 裡的 `DATABASE_URL` 改成自己的測試資料庫，例如：

```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/cashflow_test"
JWT_SECRET="cashflow-test-secret"
JWT_EXPIRES_IN="7d"
```

建議這個 `cashflow_test` 是獨立資料庫，不要直接用你平常開發用的 `cashflow`。

### 執行方式

```bash
cd backend
npm install
npm run test:e2e
```

### 測試如何保持可重複執行

每次測試前，測試程式會先清空主要資料表：

- `budgets`
- `transactions`
- `categories`
- `users`

這樣做的好處：

- 每個測試都從乾淨狀態開始
- 不容易互相污染
- 可以重複執行
- 更容易定位錯誤

### 為什麼 VS Code 之前有紅線但測試能跑

你之前看到像這種紅線：

```text
Cannot find name 'beforeAll'
```

原因不是 Jest 壞掉，而是 VS Code 當時不知道 `backend/test` 是 Jest 測試專案。

現在已補上：

- [`backend/test/tsconfig.json`](../backend/test/tsconfig.json)

它會明確告訴 TypeScript：

- 這裡使用 `jest`
- 這裡使用 `node`

這樣像 `beforeAll`、`describe`、`it`、`expect` 這些 Jest globals 就不會再被當成未定義變數。

### 建議下一步補哪些測試

之後最值得再加的是：

1. `login` 失敗情境
2. transaction update / delete
3. category delete
4. budget delete
5. unauthorized token / expired token
6. frontend auth flow smoke test

---

## English

### Current Test Coverage

CashFlow currently includes a backend e2e test suite that protects the most important core flows:

- auth register
- auth current user profile
- protected core CRUD access rules
- category creation
- transaction creation
- budget upsert
- monthly overview

Main test file:

- [`backend/test/app.e2e-spec.ts`](../backend/test/app.e2e-spec.ts)

### What These Tests Actually Verify

These are not unit tests. They are end-to-end tests.

That means the suite actually:

- creates a Nest application
- goes through controllers, guards, validation, services, and Prisma
- sends real HTTP requests
- touches a real test database

So the goal is to verify that the full application flow works correctly, not just one isolated function.

### Test Setup

Create the test environment file first:

```bash
cd backend
copy .env.test.example .env.test
```

Then update `.env.test` so `DATABASE_URL` points to a dedicated database such as:

```env
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/cashflow_test"
JWT_SECRET="cashflow-test-secret"
JWT_EXPIRES_IN="7d"
```

Using a separate database is strongly recommended so the tests do not interfere with your normal development data.

### How To Run

```bash
cd backend
npm install
npm run test:e2e
```

### Why The Tests Are Repeatable

Before each test case, the suite clears the main tables:

- `budgets`
- `transactions`
- `categories`
- `users`

This keeps the suite:

- isolated
- repeatable
- easier to debug
- less flaky

### Why VS Code Showed Red Errors Before

Earlier, VS Code showed red lines such as:

```text
Cannot find name 'beforeAll'
```

That did not mean Jest was broken.

It only meant the TypeScript language service did not yet know that files under `backend/test` should use Jest globals.

This is now fixed with:

- [`backend/test/tsconfig.json`](../backend/test/tsconfig.json)

That file tells TypeScript to load:

- `jest` types
- `node` types

So globals like `beforeAll`, `beforeEach`, `describe`, `it`, and `expect` are recognized correctly.

### Recommended Next Tests

Good next additions would be:

1. failed login scenarios
2. transaction update and delete
3. category delete
4. budget delete
5. invalid or expired token cases
6. frontend auth flow smoke tests
