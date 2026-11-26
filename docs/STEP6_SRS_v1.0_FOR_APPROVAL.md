# Software Requirements Specification — Personal Expense Tracker with Analytics

**SRS version:** 1.0 FOR APPROVAL — not signed or baselined.
**Original preparation:** 2026-11-09. **Evidence baseline:** 2026-11-26 (UTC), `2bffa8e`.
**Course:** Software Engineering (CSE-3203). **Model:** Iterative SDLC.
**Application package version:** `1.0.0-rc.1` (frontend and backend).

This revision reconciles the original SRS with the implemented application and available evidence. It preserves all nine functional and six non-functional requirement IDs and their acceptance targets. It does not constitute a change of approved scope, formal acceptance, or a new application release.

## 1. Purpose and scope

Create a secure personal finance tracking web application for university students, freelancers and budget-conscious individuals. It shall allow users to maintain isolated income/expense records, organize categories and inspect monthly spending using charts. Use documented modular API boundaries to facilitate future integration (third-party SSO and service-to-service clients are not yet provided).

The release-candidate application has been deployed to Vercel and Render. The current repository implementation includes category CRUD, monthly and trend analytics, revocable cookie sessions and authentication throttling. The deployment history is distinct from formal release acceptance; current production health and operational readiness are not established by this document.

## 2. Stakeholders and assumptions

- User: individual account owner, may be a student or young professional.
- Project maintainer: manages deployment, environment, documentation and database recovery.
- Academic reviewer: evaluates SRS, SDLC phases, requirements and prototype evidence.
- Currency for this release: **BDT only**, not explicitly fixed in the original proposal; adopted in implementation.
- One user profile per personal finance ledger; no workspace/tenant feature.
- Responsive desktop/mobile browser; internet connectivity required. No offline sync.

## 3. Functional requirements (FR)

The requirements below are the intended acceptance criteria, not declarations of successful acceptance. Implementation and verification are tracked separately in the [RTM](STEP6_REQUIREMENT_TRACEABILITY_MATRIX.csv).

| ID | Requirement | Acceptance criteria |
|---|---|---|
| FR-01 | Register and authenticate account | User registers and signs in; wrong credentials fail; logout revokes session. A copied revoked session token cannot be reused. |
| FR-02 | Isolate users' financial records | User A cannot list/edit/delete user B's records; forbidden attempts fail. Category access and analytics must also be scoped to the authenticated user. |
| FR-03 | Create income/expense | Valid BDT amount, type, date, description and optional matching category are saved. Invalid values and foreign categories are rejected. |
| FR-04 | View/update/delete transactions | Owned records are displayed and mutable; updates and deletions are reflected in summaries. |
| FR-05 | Categories | User may list, create, rename and delete unused owned categories. Referenced categories cannot be deleted until their transactions are reassigned or uncategorized. |
| FR-06 | Balance calculation | Total income, expenses and balance are mathematically correct. Balance equals income minus expense. |
| FR-07 | Monthly summaries | Income, expenses, balance and category totals are available by month. The implemented trend API provides rolling monthly totals. |
| FR-08 | Chart analytics | Expense category pie/donut and monthly income/expense bar chart are displayed and reflect the selected data. |
| FR-09 | API compatibility | Versioned `/api/v1` is available; OpenAPI is available in local development and disabled in production by default (explicit enablement is possible). |

## 4. Non-functional requirements (NFR)

| ID | Requirement | Verification / acceptance criteria |
|---|---|---|
| NFR-01 | New transaction refreshes dashboard balance within 2 seconds | 30 valid end-to-end browser trials from confirmed commit to visible balance update in a defined environment; report p50/p95/max and all misses. Every acceptance trial must meet 2,000 ms unless an explicit exception is approved. Follow the [performance protocol](PERFORMANCE_TEST_PROTOCOL.md), including representative data and mobile coverage. The 10-sample API timing check is indicative only. |
| NFR-02 | ACID transaction safety/rollback | Integration tests on invalid and interrupted operations, including fault/recovery testing; verify that failed writes do not corrupt data or totals. |
| NFR-03 | New user UI is self-explanatory | Guided usability UAT with first-time users performing core tasks without formal training; record first-task success rates and observed problems. Zero training is a usability target, not claimed achieved. |
| NFR-04 | Strong user privacy and data isolation | Cross-user access tests, secure session and transport controls; review production cookie, origin, proxy, caching and residual security risks. |
| NFR-05 | Availability, recoverability | Owner-defined RPO/RTO, backups and a staging-only restore drill with reconciliation and reviewer evidence. Availability targets and operating arrangements require owner definition/confirmation. |
| NFR-06 | Integration readiness | Documented stable API endpoints, authentication contract and limitations; review the versioned contract and OpenAPI output. No external partner authentication is required for this release. |

## 5. Business rules

- Financial amount is positive `NUMERIC(14,2)`, currency BDT; balance = income minus expense. The API returns monetary totals as decimal strings.
- A transaction belongs to one authenticated user; a category, if supplied, must belong to the same user and transaction type. The composite foreign key enforces category ownership; the service checks type compatibility.
- Unused categories may be deleted; categories referenced by historical transactions cannot be deleted until reassigned or uncategorized. Category names are unique per user and type without regard to case.
- Transaction date is distinct from created/updated timestamps.
- Monthly selection uses `YYYY-MM` and month-bound inclusive-exclusive SQL filters. The trend API supports 1–12 months (default 6); the UI offers 3, 6 and 12 months.
- Transaction listing is capped at 100 matching records, and is not yet cursor-paginated. Production scale depends on future pagination work.

## 6. Interfaces and implementation context

| Interface | Current implementation |
|---|---|
| Web | React, TypeScript, Vite, Tailwind and Recharts; desktop/mobile browser. |
| API | NestJS REST `/api/v1`; 16 implemented method/path combinations. Public health, registration and login; other operations use a cookie session. |
| Persistence | PostgreSQL; version 17 in local/QA configuration. Five application tables and one migration-tracking table. |
| Authentication | Signed JWT in HTTP-only `expense_session` cookie; database-backed expiration/revocation, bcrypt passwords, login/registration throttling. Production uses Secure cookies and mutation Origin enforcement in code. |
| Local development | Docker Compose for PostgreSQL; isolated QA database and API for tests. |
| Deployment | Vercel frontend and same-origin API rewrite to Render backend; Render-hosted PostgreSQL as documented in the project README. Live settings, database version and availability require independent confirmation. |

See [architecture and ERD](ARCHITECTURE_AND_ERD.md), [API integration guide](STEP6_API_INTEGRATION_GUIDE.md) and [README](../README.md). Deployment configuration and source controls are not proof of live security or availability.

## 7. Exclusions and planned enhancements

Not in v1.0-RC: OCR receipt capture, predictive budgets, multi-currency, OAuth2/OIDC external login, third-party machine token authentication, webhooks, SDK/iframe integration, multi-workspace, native mobile application and production monitoring integrations.

Remaining maintenance includes long-term database hosting, backup scheduling/restore evidence, monitoring, security review, pagination and further release verification. These are not declared complete by the implemented functional requirements.

## 8. Traceability, verification and approval

Use the [RTM](STEP6_REQUIREMENT_TRACEABILITY_MATRIX.csv) for requirement-level implementation status, verification result, evidence and gaps. Use the [QA test matrix](QA_TEST_MATRIX.md) for executed assertions, planned coverage and environment details. The original requirement numbering is authoritative for this revision; the older Step 4 numbering is historical.

The [CI baseline](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45872873003) passed 10 Jest tests (5 suites), 2 QA helper tests and all 16 isolated API scenarios, plus backend/frontend type checks and builds. Backend job logs establish the individual scenario outcomes. Playwright is not executed in that CI workflow. Passing scoped tests is not a blanket acceptance decision.

RTM result vocabulary:

- `API_VERIFIED`: the listed API behavior was exercised successfully within the isolated QA scope; broader production and human acceptance remain separate.
- `PARTIAL`: some evidence exists, but an explicit acceptance criterion or test gap remains.
- `PENDING`: no adequate executed acceptance evidence for the requirement is available at this baseline.

Implementation status is separate from these results. Non-functional targets are not claimed achieved solely because supporting code or procedures exist. Evidence dates are UTC; reviewer fields remain blank until genuine review. See [release gates](STEP5_RELEASE_GATES.md) and [UAT sign-off template](STEP6_UAT_SIGNOFF_TEMPLATE.md); older gate status text requires reconciliation in the deployment/release documentation task.

**Product owner:** ___________________  **Academic reviewer:** ___________________  **Approval date:** ___________________

**Approval status:** FOR APPROVAL — not signed or baselined. Code implementation and document preparation do not constitute formal SRS sign-off.
