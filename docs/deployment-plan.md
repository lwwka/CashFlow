# Deployment Plan

## 中文

### 目標

把 CashFlow 部署成可公開使用的 web app，建議組合如下：

- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

這個組合很適合目前的 CashFlow 架構：

- React + Vite 前端適合部署到 Vercel
- NestJS + Prisma + PostgreSQL 適合部署到 Railway

---

### 1. 建議部署架構

```text
使用者瀏覽器
   ↓
Vercel 上的 CashFlow Frontend
   ↓
Railway 上的 NestJS Backend
   ↓
Railway PostgreSQL
```

---

### 2. 部署前要確認的事情

#### Backend

- `npm run build` 要成功
- `npm run test:e2e` 要成功
- `.env` 內重要設定要明確
- `JWT_SECRET` 要換成正式長字串
- `CORS_ORIGIN` 要設成前端正式網址
- `ENABLE_SWAGGER` 要決定是否在 production 打開

#### Frontend

- `npm run build` 要成功
- `VITE_API_BASE_URL` 要改成正式 backend URL
- 不再依賴本機 proxy 才能工作

---

### 3. Backend Railway 規劃

Railway 上至少會有：

1. `cashflow-api`
2. `PostgreSQL`

Backend 重要環境變數建議：

```env
PORT=3000
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
ENABLE_SWAGGER=false
DATABASE_URL=postgresql://...
```

建議部署流程：

1. 建立 Railway project
2. 加入 PostgreSQL service
3. 加入 backend service
4. 設定環境變數
5. 執行 Prisma reset 或正式 migration 流程
6. 確認 `/api/v1/health`
7. 視需要暫時開 Swagger 驗證

---

### 4. Frontend Vercel 規劃

Frontend 重要環境變數建議：

```env
VITE_API_BASE_URL=https://your-backend-domain/api/v1
VITE_DEFAULT_MONTH=2026-04
```

部署流程：

1. 把 `frontend/` 連到 Vercel
2. 設定 build command
3. 設定 output directory
4. 設定 `VITE_API_BASE_URL`
5. 部署後實測 login / transactions / budgets / overview

---

### 5. 建議正式化前的最後檢查

- backend build pass
- frontend build pass
- e2e tests pass
- dev-seed 不會在 production 開放
- CORS 不是 `origin: true`
- JWT secret 不是預設值
- frontend 可以直接打正式 backend URL

---

### 6. 我建議的下一步

如果之後要直接往可部署版本推進，建議順序是：

1. 完成 production env 整理
2. 準備 Railway backend + PostgreSQL
3. 準備 Vercel frontend
4. 做第一次 staging 部署
5. 驗證 auth / CRUD / overview

---

## English

### Goal

Deploy CashFlow as a public web app with this recommended setup:

- Frontend: Vercel
- Backend: Railway
- Database: Railway PostgreSQL

This fits the current stack well:

- React + Vite works well on Vercel
- NestJS + Prisma + PostgreSQL works well on Railway

---

### 1. Recommended Deployment Architecture

```text
Browser
   ↓
CashFlow Frontend on Vercel
   ↓
NestJS Backend on Railway
   ↓
Railway PostgreSQL
```

---

### 2. Things To Confirm Before Deploying

#### Backend

- `npm run build` passes
- `npm run test:e2e` passes
- important env vars are clearly defined
- `JWT_SECRET` is replaced with a real secret
- `CORS_ORIGIN` points to the real frontend domain
- `ENABLE_SWAGGER` is intentionally set for production

#### Frontend

- `npm run build` passes
- `VITE_API_BASE_URL` points to the real backend URL
- the app no longer depends on local proxy behavior

---

### 3. Railway Backend Plan

At minimum, Railway will host:

1. `cashflow-api`
2. `PostgreSQL`

Recommended backend env vars:

```env
PORT=3000
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend.vercel.app
ENABLE_SWAGGER=false
DATABASE_URL=postgresql://...
```

Suggested deployment flow:

1. Create a Railway project
2. Add PostgreSQL
3. Add the backend service
4. Configure env vars
5. Run the DB reset or formal migration flow
6. Verify `/api/v1/health`
7. Optionally enable Swagger temporarily for verification

---

### 4. Vercel Frontend Plan

Recommended frontend env vars:

```env
VITE_API_BASE_URL=https://your-backend-domain/api/v1
VITE_DEFAULT_MONTH=2026-04
```

Suggested deployment flow:

1. Connect `frontend/` to Vercel
2. configure the build command
3. configure the output directory
4. set `VITE_API_BASE_URL`
5. verify login / transactions / budgets / overview after deploy

---

### 5. Final Pre-Production Checklist

- backend build passes
- frontend build passes
- e2e tests pass
- dev-seed is not exposed in production
- CORS is not left as `origin: true`
- JWT secret is not a default value
- frontend calls the real backend URL directly

---

### 6. Recommended Next Step

If the goal is to move toward a deployable version, the best order is:

1. finalize production env setup
2. prepare Railway backend + PostgreSQL
3. prepare Vercel frontend
4. do the first staging deployment
5. verify auth / CRUD / overview
