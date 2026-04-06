# CashFlow 工作總結

這份文件整理了目前為止在 CashFlow 專案中完成的主要建議、實作工作，以及後續建議，方便你日後自己查閱或與他人交接。

## 1. 初始環境與 PostgreSQL 安裝

### 曾提供的建議

- 建議使用 PostgreSQL `15+`，而新專案首選 `16`
- 確認 Windows 上使用 EDB PostgreSQL 沒問題
- 建議至少安裝：
  - `PostgreSQL Server`
  - `Command Line Tools`
- 說明 `createdb` 和 `psql -f` 應該在 PowerShell / CMD 執行，而不是在互動式 `psql` 內執行
- 協助辨識本機安裝了多個 PostgreSQL 版本，並找出 port 對應：
  - `5432` -> PostgreSQL 14
  - `5433` -> PostgreSQL 13
  - `5434` -> PostgreSQL 16
- 協助把 PostgreSQL 16 切換成主要使用版本
- 解決因 PostgreSQL 14 不支援 `UNIQUE NULLS NOT DISTINCT` 而造成 schema 匯入失敗的問題

### 已完成事項

- 成功建立 `cashflow` database
- 成功匯入 schema：
  - `db/migrations/0001_init.sql`
- 確認主要資料表已建立：
  - `users`
  - `categories`
  - `transactions`
  - `budgets`

## 2. Git 與 Repo 整潔性

### 曾提供的建議

- 確認 `node_modules` 不應被 Git 追蹤
- 解釋 `.gitignore` 加上後，VS Code 的 Source Control 有時需要 refresh 才會即時反映

### 已完成事項

- 在 repo 根目錄新增 `.gitignore`
- 忽略內容包括：
  - `node_modules/`
  - `dist/`
  - `.env`
  - `.env.*`
  - `coverage/`
  - `*.log`

## 3. NestJS Backend 初始檢查

### 曾提供的建議

- 確認這個 repo 原本只有：
  - `backend/`
  - `db/`
  - `docs/`
- 說明當時 repo 還沒有 frontend
- 說明 backend 最初只是 NestJS scaffold，未完全接上 PostgreSQL

### 已完成事項

- 整理 backend 啟動方式與結構
- 確認 API base URL：
  - `http://localhost:3000/api/v1`

## 4. Swagger 整合

### 曾提供的建議

- 說明你記得的 NestJS「web UI」應該是 Swagger UI
- 建議在沒有 frontend 之前，先用 Swagger 當 API 操作介面

### 已完成事項

- 為 NestJS backend 加上 Swagger
- 掛載 Swagger UI 在：
  - `http://localhost:3000/docs`
- 更新：
  - `backend/src/main.ts`
  - `backend/package.json`

## 5. PostgreSQL 共用連線層

### 已完成事項

- 新增共用 PostgreSQL access layer，使用 `pg`
- 新增：
  - `backend/src/database/database.module.ts`
  - `backend/src/database/database.service.ts`
- 加入 backend DB 連線環境變數範本：
  - `PGHOST`
  - `PGPORT`
  - `PGUSER`
  - `PGPASSWORD`
  - `PGDATABASE`

## 6. Seed Data 流程

### 曾提供的建議

- 建議在 Swagger 裡提供一個可以直接灌 demo data 的 endpoint，這樣在沒有 frontend 前也能快速測試資料流

### 已完成事項

- 新增 `POST /api/v1/dev/seed`
- 在 Swagger 裡提供可直接貼上的 JSON example
- 實作會真的寫入 DB 的 seed 流程，涵蓋：
  - `users`
  - `categories`
  - `transactions`
  - `budgets`
- 新增：
  - `backend/src/modules/dev-seed/dev-seed.controller.ts`
  - `backend/src/modules/dev-seed/dev-seed.service.ts`
  - `backend/src/modules/dev-seed/dev-seed.module.ts`

### 後續安全加固

- 限制 `dev-seed` 在 production 環境不可用
- 當 `NODE_ENV=production` 時，會直接拒絕請求

## 7. Backend 讀取 API 接上 PostgreSQL

### 曾提供的建議

- 建議先把 backend 的讀取 API 真的接上 PostgreSQL，再開始做 frontend

### 已完成事項

- 把原本 stub response 改成實際查資料庫，支援：
  - `GET /api/v1/transactions`
  - `GET /api/v1/categories`
  - `GET /api/v1/budgets`
  - `GET /api/v1/overview`
- 補齊與更新 service/module：
  - `transactions.service.ts`
  - `categories.service.ts`
  - `budgets.service.ts`
  - `overview.service.ts`

## 8. Backend 寫入 API 接上 PostgreSQL

### 已完成事項

- 把以下 endpoint 從假回傳改成真的寫入 PostgreSQL：
  - `POST /api/v1/transactions`
  - `POST /api/v1/categories`
  - `POST /api/v1/budgets`
- 補上 update/delete 支援：
  - `PATCH /api/v1/transactions/:id`
  - `DELETE /api/v1/transactions/:id`
  - `PATCH /api/v1/categories/:id`
  - `DELETE /api/v1/categories/:id`
  - `PATCH /api/v1/budgets`
  - `DELETE /api/v1/budgets/:id`

## 9. Swagger 使用體驗優化

### 曾提供的建議

- 解釋為什麼某些 query-based endpoint 在 Swagger 顯示 `No parameters`
- 建議補上 Swagger metadata，讓 query/body 欄位能正確顯示

### 已完成事項

- 為 query 與 body 補上 Swagger decorators
- 改善 `month`、`userEmail`、transaction/category/budget request body 的顯示
- 修正 PATCH request body 不顯示問題：
  - 把 `Partial<CreateTransactionDto>` 改成獨立的 update DTO

## 10. ERD 與 Schema 文件

### 曾提供的建議

- 說明 Prisma Studio 主要是看資料，不是專門產 ERD
- 說明 `prisma-erd-generator` 必須依賴 `schema.prisma`，不能直接吃 raw SQL migration

### 已完成事項

- 在 repo 內新增 ERD 文件：
  - `docs/erd.md`
- 用 Mermaid 描述目前 SQL schema
- 新增用於文件/ERD 的 Prisma schema：
  - `backend/prisma/schema.prisma`
- 整合 Prisma ERD 工具：
  - `prisma`
  - `prisma-erd-generator`
- 新增 script：
  - `npm run prisma:erd`
- 設定輸出：
  - `docs/prisma-erd.svg`

## 11. Backend / DB 設計 Review 與加固

### Review 結論

- DB schema 本身不算累贅，反而算簡潔
- 真正的問題不在資料表太多，而在 backend 裡仍有一些 MVP / 開發期捷徑

### 當時指出的主要問題

- 太多地方 fallback 到 `demo@cashflow.local`
- `categoryId` 缺乏 ownership 驗證
- not-found 狀況沒有清楚處理
- `dev-seed` 暴露範圍過大

### 已完成事項

- 移除 service 中自動 fallback 到 `demo@cashflow.local`
- 現在要求 API/service 顯式帶 `userEmail`
- 加上 ownership 驗證，確認 `categoryId` 必須屬於同一個 user，涵蓋：
  - transactions
  - budgets
- 加上更清晰的 `400 / 404` 例外處理，避免靜默成功或 generic 500
- 加固檔案：
  - `transactions.service.ts`
  - `categories.service.ts`
  - `budgets.service.ts`
  - `overview.service.ts`
  - `dev-seed.controller.ts`

## 12. Frontend 技術建議

### 曾提供的建議

- 建議使用：
  - `React + Vite + TypeScript`
- 不建議一開始就跳去：
  - Next.js
  - Ionic UI framework
  - React Native
- 建議先走 React web，再決定要不要包裝成 app
- 建議 UI 先維持可演進，不要過早被某一套框架綁死

## 13. Frontend 實作

### 已完成事項

- 建立新的 `frontend/`，技術包含：
  - React
  - Vite
  - TypeScript
  - Tailwind CSS
  - React Router
- 為 backend 開啟 CORS，支援本機前後端開發
- 在 README 補上 frontend 啟動方式
- 設定 Vite dev proxy：
  - frontend -> `http://localhost:5173`
  - backend API proxy 到 `http://localhost:3000`

### 已建立的主要 frontend 區塊

- Dashboard
- Transactions
- Categories
- Budgets

### 已實作的主要 frontend 功能

- 顯示 overview
- 顯示 transactions
- 顯示 categories
- 顯示 budgets
- 新增 transaction
- 新增 category
- 新增 budget
- 刪除 transaction

## 14. 國際化與主題切換

### 曾提供的建議

- 建議從「硬寫中英雙語」升級成可維護的 i18n 結構
- 建議加入黑 / 白主題切換

### 已完成事項

- 新增簡單 i18n 字典系統：
  - `frontend/src/lib/i18n.ts`
- 新增偏好設定 provider：
  - `frontend/src/providers/PreferencesProvider.tsx`
- 支援即時切換：
  - `中文 / English`
  - `dark / light`
- 使用 `localStorage` 記住語言與主題選擇

## 15. 主題設計調整

### 曾提供的建議

- 指出白色主題第一版雖然能切換，但視覺質感不足
- 建議改成 `Paper Finance` 方向

### 已完成事項

- 把白色主題調整成 `Paper Finance` 風格：
  - 暖白紙感背景
  - 深墨藍文字
  - 更乾淨的卡片層次
  - 青綠作為主要操作色
- 把 dark / light 背景分開設計
- 讓白色主題不再沿用黑色主題的 glow 氛圍，而是改成紙本報表感背景

## 16. 目前仍存在的限制

- Auth 尚未完整實作
- `userEmail` 目前仍然是由 UI / API request 傳入，不是真正來自 authenticated session
- Prisma schema 目前只用來做 ERD / 文件，不是 migration 的 source of truth
- Frontend 雖已具備核心 CRUD 流程，但尚未覆蓋所有完整 update/delete 體驗

## 17. 建議下一步

### Backend

1. 把 `userEmail` 請求模式逐步替換為真正的 authentication / session 機制
2. 為 transactions / categories / budgets CRUD 補 automated tests
3. 在 DB 層加入 `updated_at` trigger，減少手動維護風險
4. 優化 API error response，方便 frontend 顯示

### Frontend

1. 補 categories / transactions / budgets 的 edit flow
2. 補更完整的 inline validation 與錯誤提示
3. 加入圖表顯示 monthly overview / reporting
4. 把語言與主題切換做成更成熟的 top bar / settings UI

### Product

1. 實作真正的 register / login / password hashing 流程
2. 把 dev seed 流程逐步替換成 fixture strategy 或 admin-only 工具
3. 之後再決定產品方向是：
   - 保持 web-first
   - 用 Capacitor 包 app
   - 或轉向 React Native
