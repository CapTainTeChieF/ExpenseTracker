# Iteration 3 - Final Build Plan (v0.3)

## SDLC purpose
This is the third and **last development iteration** in the approved proposal. It is not the final project milestone: verification/UAT, deployment, and handover follow it.

## Scope / Requirements trace
| ID | Feature / Requirement | Implementation | Acceptance gate |
|---|---|---|---|
| FR-01 | Account sign-in and owner isolation | Existing auth guard and user-scoped SQL retained | User B sees none of User A's data |
| FR-02 | Income/expense CRUD | Existing transaction API retained | Create, edit, delete, reload checks |
| FR-03 | Dynamic categories | Existing category API retained | Create, rename, delete-protected checks |
| FR-04 | Visual analytics | Recharts expense donut and income/expense bars | Charts reflect selected month & range |
| NFR-01 | Dashboard recalc within 2 seconds | Query indexing, concurrent API requests, re-fetch after mutation | **To be measured on actual target hardware** |
| NFR-02 | Rollback on failure | Existing PostgreSQL transactions | Integration fault-injection needed |
| NFR-03 | Self-explanatory interface | Chart legends, empty states, selected period | User acceptance testing needed |
| NFR-04 | Financial data privacy | Cookie-authenticated, scoped API queries | Security/UAT stage verification needed |
| EXT-01 | Future API integrations | Versioned `/api/v1` routes, Swagger/OpenAPI JSON | API contract inspection & external client smoke test |

## Implemented in v0.3
- `GET /api/v1/analytics/trend?months=6&endMonth=2026-11`; 1-12 months and zero-filled months.
- Expense category pie chart based on the existing monthly breakdown.
- Income/expense grouped bar chart, range selector, chart tooltips and textual values.
- `GET /docs` Swagger UI and `/docs/openapi.json` OpenAPI contract **in development**.
- OpenAPI response DTOs and documentation decorators.
- Trend logic unit tests, updated English README and API contract documentation.

## Deliberately excluded from the third iteration
- External SSO/OIDC, webhooks, embeddable SDK, multi-tenancy, data export, receipt OCR, budget forecasting.
- Production secrets management, security audit, penetration test, load test, backup/restore validation.
- Comprehensive end-to-end browser tests and deployment. These are next project stages.

## Exit criteria
- Local backend unit tests and build pass.
- React production build passes.
- Authorized user can view trend/pie and verify numbers using known transactions.
- Swagger endpoints and JSON downloadable in development.
- One user cannot access another's records; month range validation rejects invalid values.
- Test evidence is recorded in `docs/STEP3_TEST_PLAN.md`.

## Architecture decision
Continue using a modular monolith (NestJS controllers/services, PostgreSQL, React/Vite); preserve existing API contracts. v0.3 does not require a schema migration beyond Step 2 migrations `001` and `002`.
