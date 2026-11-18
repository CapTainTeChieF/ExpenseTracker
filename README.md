> **FINAL CONSOLIDATED KIT:** Start at `../START_HERE.md` and the numbered guides under `../03_DETAILED_GUIDES/`. This folder is the only current source tree. A local full-stack Docker option is available at `docker-compose.full.local.yml`.

# Personal Expense Tracker — Steps 5 & 6 (Release Candidate v1.0.0-rc.1)

**Project:** Personal Expense Tracker with Analytics (CSE-3203)  
**SDLC:** Iterative model; Iterations 1–3 implemented as source code, Step 4 verification harness, Steps 5–6 deployment/handover package.  
**IMPORTANT:** This ZIP is **NOT evidence of a deployed, approved production system**. It includes deployable *templates* and review-ready documentation; live tests, UAT signature, security sign-off and a backup restore drill are still required.

## Quick navigation

| Goal | Open |
|---|---|
| Local install / upgrade from Step 4 | Sections 1–3 below |
| Step 5: hosting, CI/CD, security and backup | `docs/STEP5_DEPLOYMENT_RUNBOOK.md` |
| Release checks and unresolved items | `docs/STEP5_RELEASE_GATES.md` |
| Database backup / restore procedure | `docs/STEP5_BACKUP_RECOVERY.md` |
| Step 6: final SRS (approval pending) | `docs/STEP6_SRS_v1.0_FOR_APPROVAL.md` |
| SDLC report / status evidence | `docs/STEP6_SDLC_PROJECT_REPORT.md` |
| Requirements-to-test traceability | `docs/STEP6_REQUIREMENT_TRACEABILITY_MATRIX.csv` |
| API integration / limitations | `docs/STEP6_API_INTEGRATION_GUIDE.md` |
| Handover inventory / owner sign-off | `docs/STEP6_HANDOVER_CHECKLIST.md` |
| Presentation outline | `docs/STEP6_PRESENTATION_OUTLINE.md` |

## 1. Prerequisites

- Windows 10/11 + PowerShell, Git, VS Code.
- Node.js **24 LTS** and npm, Docker Desktop with WSL2 for local databases.
- PostgreSQL 17 client tools (`pg_dump`, `pg_restore`) for backup validation.
- GitHub, Vercel, Render and managed PostgreSQL accounts **only when you are ready for hosting**.
- Internet access for npm dependencies and cloud deployment; the source package does not contain `node_modules` or generated `package-lock.json` files.

**Mandatory upgrade warning:** The new `003_sessions_and_auth_limits.sql` migration makes legacy Step 4 JWTs invalid. Users must log in again after the migration. No transaction tables are dropped. Back up your database before migrating.

## 2. Start locally (fresh install)

Open PowerShell at this repository root:

```powershell
docker compose up -d
```

Backend (new terminal):

```powershell
cd backend
Copy-Item .env.example .env
# Edit .env: replace JWT_SECRET with a unique 32+ character random value.
npm install
npm run db:migrate
npm run test
npm run typecheck
npm run build
npm run start:dev
```

Backend health: `http://localhost:4000/api/v1/health`  
Swagger (local dev only): `http://localhost:4000/docs`

Frontend (new terminal from project root):

```powershell
cd frontend
Copy-Item .env.example .env
npm install
npm run build
npm run dev
```

Frontend: `http://localhost:5173`.

## 3. Regression/QA (isolated test database, NOT production)

```powershell
# At project root
 docker compose -f docker-compose.qa.yml -p expense-tracker-qa up -d --wait
cd backend
npm run test
npm run typecheck
npm run build
npm run qa:unit
npm run qa:integration
```

Browser testing after `npm run qa:server` runs in a separate backend terminal:

```powershell
cd frontend
npx playwright install chromium
npm run qa:browser
```

Check `docs/qa-evidence/` for actual generated evidence. On this delivery, **no full runtime QA result is claimed**. The 30-trial UI refresh performance test remains mandatory.

## 4. Step 5: prepare hosting (do not skip gates)

**Example topology:** Vercel Vite frontend → Vercel same-origin `/api/v1/*` rewrite → Render Node/NestJS API → managed PostgreSQL 17.

1. Run Step 4 QA and resolve all failed tests. Complete `docs/STEP5_RELEASE_GATES.md`.
2. Provision **staging** PostgreSQL and Render backend; store `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_ORIGIN` as secrets.
3. Back up the existing environment and test restore into a separate staging/QA DB.
4. Run backend migrations **once, before deploying the new code**: `npm run db:migrate`.
5. Backend build command: `npm install --no-audit && npm run build` (or build from `backend/Dockerfile`). Start: `npm run start:prod`; health check `/api/v1/health`.
6. Generate a same-origin Vercel API proxy locally, where backend URL is already live and verified:

```powershell
cd frontend
npm run configure:vercel -- https://YOUR-REAL-BACKEND.onrender.com
npm run verify:production
Copy-Item .env.production.example .env.production
npm run build
```

7. Commit generated `frontend/vercel.json` once it points to the **real** backend; Vercel project root = `frontend`, framework = Vite, build = `npm run build`, output = `dist`.
8. Set Render `FRONTEND_ORIGIN=https://YOUR-REAL-FRONTEND.vercel.app` exactly. Set `NODE_ENV=production`, `ENABLE_API_DOCS=false`, `PORT=10000`, `TRUST_PROXY_HOPS` only after checking provider configuration. Use a real database and strong unique JWT secret.
9. Verify browser authentication and cookies through the proxy; run the non-destructive smoke test, then controlled UAT.
10. Get formal approval **before** opening to real users. Record deployment URL and evidence in handover checklist.

**Do not deploy the included default `frontend/vercel.json` unchanged**: it is SPA-only, intentionally without backend proxy. Use `configure:vercel` first.

### CI/CD

- `.github/workflows/ci.yml`: test pipeline for backend Jest/typecheck/build, isolated Postgres integration, frontend typecheck/build.
- `.github/workflows/release-gate.yml`: manually entered approval assertions; **does not deploy anything**, and cannot substitute for signed review evidence.
- Dependency lockfiles are not included because package registry access was unavailable in the authoring environment. On your workstation run `npm install` for each project, commit generated lockfiles, then switch CI and Docker builds to `npm ci` before production sign-off.

## 5. Step 6: final documentation and handover

- Review/approve SRS and record any requirement deviations.
- Execute UAT and 30-trial dashboard performance measurements; attach actual results.
- Fill the requirement traceability matrix with evidence and approver signatures.
- Review the remaining security risks and privacy policy considerations.
- Approve backup/restore procedures with an observed staging restore test.
- Record Git commit SHA, deploy URLs, version, database migration checksums and operator contacts.
- Present the SDLC report and demonstration to reviewers.

## 6. Security changes since Step 4

- Migration `003_sessions_and_auth_limits.sql` adds `auth_sessions` and `auth_rate_limits` tables.
- Login/register endpoints use database-backed rate limiting (20 login/IP per 15 min, 10 login/account per 15 min; 6 registrations/IP per hour).
- Authenticated requests now verify an active DB session (revoked tokens rejected after logout).
- Production writes require a trusted `Origin` header matching `FRONTEND_ORIGIN`.
- API docs disabled in production by default; cookie remains HTTP-only, Secure when `NODE_ENV=production`.
- **Remaining:** external identity providers/SSO, custom tenant isolation, penetration tests, load-tested 2-second UI SLA, monitoring integration, actual database restore drill and formal data retention policy.

## 7. API compatibility and limits

`/api/v1` transactions, categories, analytics and auth response bodies remain unchanged; logout semantics are stronger. **Not implemented:** OAuth2/OIDC for arbitrary third parties, webhooks, SSO, production billing, multi-currency, multi-tenancy. Do not give cookies or session JWTs to untrusted apps. See `docs/STEP6_API_INTEGRATION_GUIDE.md`.

## 8. Known status (truthful release statement)

- Source, docs, CI workflow templates, deployment examples, backup/restore scripts: **prepared**.
- JavaScript static parsing and archive checks: **performed** during preparation.
- npm install / TypeScript compile / PostgreSQL integration / Playwright / staging cloud / production deployment: **not verified in this environment**.
- UAT, security sign-off, P95 dashboard latency measurement, disaster recovery drill: **pending**.
- **Do not classify as production-ready or project formally completed until all mandatory gates pass.**

## 9. Reference sources

- https://vercel.com/docs/frameworks/frontend/vite
- https://render.com/docs/web-services
- https://render.com/docs/deploys
- https://www.postgresql.org/docs/17/app-pgdump.html
- https://www.postgresql.org/docs/17/app-pgrestore.html
