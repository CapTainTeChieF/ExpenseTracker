# Final SDLC Project Report — Submission Draft (Step 6)

**Title:** Personal Expense Tracker with Analytics  
**Method:** Iterative Model (3 build iterations + formal verification and release/handover stages)  
**Status:** Draft technical submission; operational acceptance is pending.

## 1. Introduction and problem

Students and young professionals need a straightforward, privacy-aware way to record cash flow, classify spending and understand balances. The original proposal calls for secure authentication, personal transaction CRUD, categories, monthly chart analytics, robust database writes and an intuitive interface.

## 2. Project scope

Web app: React/TypeScript/Vite/Tailwind/Recharts; backend: NestJS REST API; PostgreSQL 17 data storage. Income/Expense CRUD, dynamic categories, summary/trend analytics and isolated personal sessions. API-first modular monolith, with v1 endpoint compatibility. Cloud deployment is documented as a template, not performed as part of this ZIP.

## 3. SDLC process and milestones

| SDLC stage | Work delivered | State |
|---|---|---|
| Project analysis | Proposal review, gap analysis and modular architecture | Prepared |
| Requirements | SRS draft, acceptance criteria and traceability | For approval |
| Design | Component boundaries, ERD, API contract and UI screens | Prepared |
| Iteration 1 baseline | Authentication, initial transactions and database | Source available |
| Iteration 2 enhancement | Category CRUD and monthly calculations/filtering | Source available |
| Iteration 3 final build | Recharts charts, trend API and Swagger docs | Source available |
| Step 4 verification | QA scenarios, Playwright, UAT templates, risk register | Scripts prepared; live execution pending |
| Step 5 deployment | CI workflow, hosting templates, backup/recovery docs | Prepared; staging/prod pending |
| Step 6 handover | This report, final SRS draft, API guide, checklists | Prepared; owner sign-off pending |

## 4. Architecture summary

- Presentation independent from API and PostgreSQL persistence.
- Secure cookie sessions with server-side `auth_sessions` revocation, per-user data ownership controls, authentication throttling, PostgreSQL transaction boundaries.
- Documented `/api/v1` and environment separation: development, QA, staging, production.
- Hosting example Vercel (frontend) → same-origin proxy → Render (API) → managed PostgreSQL.

## 5. Verification methodology

Jest unit tests and native Node helper tests, 16 live QA API scenarios, browser Playwright tests, a 30-trial dashboard latency protocol, security review, UAT and staged database backup restore drill. Some local helper tests were previously reported, but the present final delivery contains **no independently verified full runtime results**. Test reports must be generated and attached by the operator/reviewer, and findings corrected.

## 6. Results and discussion

- The source implementation covers original functional modules and analytics visualization.
- Step 5 source adds session revocation and throttling to reduce known security gaps identified in Step 4.
- No external cloud deployment, real UAT result, real user traffic performance result or backup/restore result has been produced in this environment.
- Therefore, production-readiness, 2-second end-to-end SLA and academic final acceptance **must not be stated as passed**.

## 7. Limitations and future work

Currently single personal ledger, BDT only, 100-item transaction listing limit, no OAuth/OIDC for external services, no immutable financial audit journal, no built-in receipt OCR or predictive budgeting, no offline app, no proven disaster recovery SLA. SSO, pagination, true multi-tenancy and an SDK are future release candidates, not features promised by this deliverable.

## 8. Conclusion

The project has a structured iterative codebase and a prepared SDLC documentation/deployment handover. Real-world completion requires clean build and automated tests, human acceptance, security and backup restore verification, cloud environment setup and approved release. All evidence records and checklists in this package are deliberately unfilled rather than fabricating results.

## 9. References

- Project Proposal: *Personal Expense Tracker with Analytics*, 2 pages, original user-provided PDF.
- Git/source snapshots from iterations 1–4 in earlier archive packages.
- PostgreSQL 17 pg_dump/pg_restore docs; Render Deployment/Web Services docs; Vercel Vite framework docs.
