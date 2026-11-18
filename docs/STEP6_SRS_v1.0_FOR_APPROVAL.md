# Software Requirements Specification — Personal Expense Tracker with Analytics

**SRS version:** 1.0 FOR APPROVAL — not signed or baselined.  **Prepared:** 2026-11-09.  **Course:** Software Engineering (CSE-3203).  **Model:** Iterative SDLC.

## 1. Purpose and scope

Create a secure personal finance tracking web application for university students, freelancers and budget-conscious individuals. It shall allow users to maintain isolated income/expense records, organize categories and inspect monthly spending using charts. Use documented modular API boundaries to facilitate future integration (third-party SSO and service-to-service clients are not yet provided).

## 2. Stakeholders and assumptions

- User: individual account owner, may be a student or young professional.
- Project maintainer: manages deployment, environment, documentation and database recovery.
- Academic reviewer: evaluates SRS, SDLC phases, requirements and prototype evidence.
- Currency for this release: **BDT only**, not explicitly fixed in original proposal; adopted in implementation.
- One user profile per personal finance ledger; no workspace/tenant feature.
- Responsive desktop/mobile browser; internet connectivity required. No offline sync.

## 3. Functional requirements (FR)

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-01 | Register and authenticate account | User registers and signs in; wrong credentials fail; logout revokes session |
| FR-02 | Isolate users' financial records | User A cannot list/edit/delete user B's records; forbidden attempts fail |
| FR-03 | Create income/expense | Valid BDT amount, type, date, description, optional matching category are saved |
| FR-04 | View/update/delete transactions | Owned records displayed and mutable; updates reflected in summaries |
| FR-05 | Categories | User may list, create, rename and delete unused owned categories |
| FR-06 | Balance calculation | Total income, expenses and balance are mathematically correct |
| FR-07 | Monthly summaries | Income, expenses, balance and category totals available by month |
| FR-08 | Chart analytics | Expense category pie/donut and monthly income/expense bar chart displayed |
| FR-09 | API compatibility | Versioned `/api/v1` available; OpenAPI in local dev only by default |

## 4. Non-functional requirements (NFR)

| ID | Requirement | Verification |
|---|---|---|
| NFR-01 | New transaction refreshes dashboard balance within 2 seconds | 30-trial end-to-end browser measurement, report p50/p95/max and all misses |
| NFR-02 | ACID transaction safety/rollback | Integration tests on invalid and interrupted operations |
| NFR-03 | New user UI is self-explanatory | Guided usability UAT, record first-task success rates; 'zero training' is usability target, not claimed achieved |
| NFR-04 | Strong user privacy and data isolation | Cross-user access tests, secure session and transport controls |
| NFR-05 | Availability, recoverability | Defined RPO/RTO, backups and staging restore drill (pending owner definition) |
| NFR-06 | Integration readiness | Documented stable API endpoints, auth contract and limitations |

## 5. Business rules

- Financial amount is positive numeric `NUMERIC(14,2)`, currency BDT; balance = income minus expense.
- A transaction belongs to one authenticated user; category must belong to same user and transaction type.
- Unused categories may be deleted; categories referenced by historical transactions cannot be deleted until reassigned.
- Transaction date is distinct from created/updated timestamps.
- Monthly selection uses `YYYY-MM` and month-bound inclusive-exclusive SQL filters.
- Transaction listing is currently capped to 100 records, and not yet cursor-paginated. Production scale depends on future pagination work.

## 6. Interfaces

Web: React/Vite/Tailwind + Recharts. API: NestJS REST `/api/v1`. Persistence: PostgreSQL 17. Local development: Docker. Deployment example: Vercel frontend proxy to Render backend and managed PostgreSQL. `GET /api/v1/health` is publicly accessible; user-owned endpoints require cookie session.

## 7. Exclusions and planned enhancements

Not in v1.0-RC: OCR receipt capture, predictive budgets, multi-currency, OAuth2/OIDC external login, third-party machine token authentication, webhooks, SDK/iframe integration, multi-workspace, native mobile application and production monitoring integrations.

## 8. Traceability, verification and approval

See `STEP6_REQUIREMENT_TRACEABILITY_MATRIX.csv` and `STEP5_RELEASE_GATES.md`. An SRS is **for approval** until product owner / academic assessor confirms scope and acceptance tests. Code implementation and document preparation do not constitute formal SRS sign-off.

**Product owner:** ___________________  **Academic reviewer:** ___________________  **Approval date:** ___________________
