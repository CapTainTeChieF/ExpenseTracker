# Personal Expense Tracker — Iteration 2 (Enhancement v0.2)

**Purpose:** SDLC-এর Iteration 2: Dynamic Category CRUD, Month-Based Analytics, Transaction Filtering এবং Automated Test Cases।
**Status:** Development build. Production deployment / SSO / charts / full integration certification এখনো সম্পন্ন হয়নি।
**Source:** পূর্ববর্তী Step 1 Starter থেকে উন্নীত সম্পূর্ণ Project; আলাদা patch নয়।

## 1. এবার কী নতুন?

- Categories: Create, List, Rename, Delete (`/api/v1/categories`)
- Category type `INCOME` / `EXPENSE`; তৈরি হওয়ার পরে type অপরিবর্তনীয়।
- Transaction-এ ব্যবহৃত Category Delete করা নিষিদ্ধ; নিরাপদ Error `409 Conflict`।
- Same User এবং Same Type-এ `Food`/`food` duplicate না হওয়ার জন্য Database Unique Index।
- Monthly Summary `/api/v1/analytics/monthly?month=2026-11` (Total Income, Expense, Balance, Count, Category Breakdown)।
- Transaction Filtering: `GET /api/v1/transactions?month=2026-11&kind=EXPENSE`।
- Frontend: Categories Tab, Rename/Delete Controls, Month Picker, Summary Cards এবং Month-wise Category Breakdown।
- Backend Unit Tests: Ownership Scoping, Category Conflicts, Monthly Queries।

## 2. প্রয়োজনীয় সফটওয়্যার

- Node.js 24 LTS + npm
- Docker Desktop (WSL2 enabled) অথবা PostgreSQL 17 Local Installation
- VS Code

## 3. প্রথমবার নতুন করে শুরু করলে (Windows PowerShell)

ZIP Extract করার পর `expense-tracker-step2` folder VS Code-এ খুলুন। Project Root থেকে:

```powershell
docker compose up -d
```

Backend Terminal খুলুন:

```powershell
cd backend
Copy-Item .env.example .env
npm install
```

`backend/.env`-এ `JWT_SECRET` placeholder একটি random 32+ character secret দিয়ে বদলান:

```powershell
$bytes = New-Object byte[] 48
$rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$rng.GetBytes($bytes)
$rng.Dispose()
[Convert]::ToBase64String($bytes)
```

তারপর:

```powershell
npm run db:migrate
npm run test
npm run typecheck
npm run start:dev
```

Backend Health: http://localhost:4000/api/v1/health

Frontend-এর জন্য নতুন Terminal খুলুন (project root থেকে):

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run build
npm run dev
```

Application: http://localhost:5173

## 4. Step 1-এর Database/Data থাকলে **খুব গুরুত্বপূর্ণ**

**কোনো অবস্থাতেই `docker compose down -v` চালাবেন না** — এটি Volume মুছে Data Loss ঘটাতে পারে।

Step 1-এর ফোল্ডার থেকে `docker compose up -d` চালিয়ে থাকলে Docker Compose-এর default project name সাধারণত `expense-tracker-step1` হবে। নতুন folder-এ গিয়ে নতুন project name ব্যবহার করলে নতুন ফাঁকা PostgreSQL Volume তৈরি হতে পারে।

পুরোনো Docker Volume পুনরায় ব্যবহার করতে Step 2-এর root থেকে চালান:

```powershell
docker compose -p expense-tracker-step1 up -d
```

এবার Step 2-এর backend folder থেকে run করুন:

```powershell
cd backend
Copy-Item .env.example .env
npm install
npm run db:migrate
npm run start:dev
```

**খেয়াল করুন:** পুরোনো Step 1 Backend একই Port 4000-এ চালু থাকলে আগে সেটির dev server বন্ধ করুন। Docker Compose-এ আপনার আগে custom `-p` project name ব্যবহার করা থাকলে সেই নাম আবার ব্যবহার করুন। আপনার existing `.env`-এ আলাদা Database Connection থাকলে সেটি নিরাপদে নতুন project-এর `.env`-এ নিজে কপি করুন; কোনো Secrets ZIP-এ নেই।

`002_case_insensitive_categories.sql` Migration চালানোর আগে Database Backup নেওয়া উচিত। কোনো User-এর `Food` ও `food` উভয় Category থাকলে Migration আগে Duplicate Rename করতে হবে।

## 5. API Endpoints

| Method | Endpoint | কাজ |
|---|---|---|
| GET | `/api/v1/categories` | নিজের Category List |
| POST | `/api/v1/categories` | Category তৈরি |
| PATCH | `/api/v1/categories/:id` | Category Rename |
| DELETE | `/api/v1/categories/:id` | অব্যবহৃত Category Delete |
| GET | `/api/v1/analytics/summary` | All-time Summary (Step 1 compatible) |
| GET | `/api/v1/analytics/monthly?month=2026-11` | Monthly Summary |
| GET | `/api/v1/transactions?month=2026-11&kind=EXPENSE` | Filtered Transaction List |

Create Category Request Body:

```json
{"name":"Books","kind":"EXPENSE"}
```

Rename Category Request Body:

```json
{"name":"Study Books"}
```

Response data is scoped to the authenticated user's HTTP-only session cookie. External OAuth/OIDC Clients are not implemented.

## 6. Manual Acceptance Testing

1. Register/Login; `Food` default Category দেখুন।
2. Expense Category `Books` যোগ করুন; একই Type-এ আবার `books` যোগ করলে HTTP 409 হবে।
3. Category `Books` → `Study Books` Rename করুন।
4. `2026-11-08`-এ BDT 1000 Income + BDT 250 Expense যোগ করুন।
5. Month `2026-11` নির্বাচন করুন; Income=1000, Expense=250, Balance=750 হবে।
6. Month `2026-12` করলে Zero Summary দেখতে পাবেন (সেই মাসে Data না থাকলে)।
7. Transaction Type Filter `EXPENSE` করলে শুধু Expense দেখাবে।
8. ব্যবহৃত `Study Books` Category Delete করলে HTTP 409 এবং Error Message দেখাবে।
9. সংশ্লিষ্ট Transaction-এর Category পরিবর্তন করে আবার `Study Books` Delete করলে Success হবে।
10. অন্য Email-এ Login করে প্রথম User-এর Categories, Summary বা Transactions দেখা যাচ্ছে কি না যাচাই করুন।

## 7. Known Limitations / Next SDLC Gate

- Transaction List সর্বোচ্চ 100টি Matching Record ফেরত দেয়; Pagination ও Export পরবর্তী উন্নয়ন।
- Monthly Summary Database-এর সব Matching Record গণনা করে; শুধু UI-তে দেখানো প্রথম 100টি নয়।
- Charts, Swagger/OpenAPI, CSRF hardening beyond same-origin checks, production monitoring, backup automation, audit events, external SSO ও third-party SDK পরবর্তী Iteration/Release-এর বিষয়।
- SRS v1.0 আগের মতো **Draft**; Business Rule approvals ছাড়া এটিকে Final Specification বলা যাবে না।
- Local Database এবং Browser সহ end-to-end runtime test নিজের Windows Machine-এ সম্পন্ন করতে হবে।

## 8. Files to Review

- `docs/SRS_v1.0_DRAFT.md` — baseline requirements
- `docs/STEP2_ENHANCEMENT_PLAN.md` — Iteration 2 scope, design, traceability
- `docs/API_CONTRACT_V0.2.md` — API semantics and error behavior
- `docs/STEP2_TEST_PLAN.md` — manual and unit test matrix
- `backend/src/categories/` — Category CRUD implementation
- `backend/src/analytics/` — Monthly Analytics logic
- `backend/migrations/002_case_insensitive_categories.sql` — category uniqueness migration

**Next:** All local tests pass → Iteration 2 sign-off → Iteration 3 Visual Analytics (Pie/Bar), Full E2E Security/Performance Tests, API Docs, Deployment.
