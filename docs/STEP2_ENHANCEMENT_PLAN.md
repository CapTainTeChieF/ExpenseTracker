# SDLC Iteration 2 — Enhancement Plan

**Project:** Personal Expense Tracker with Analytics  
**Version:** 0.2.0 · implementation draft for review  
**Based on:** Academic proposal's Phase 2 (categorization and mathematical summaries), plus documented engineering enhancements.

## 1. Objectives
- FR-06: Dynamic Category management per authenticated user.
- FR-07: Mathematical summaries of Income, Expense, and Balance.
- Filter transactions by month and type.
- Retain old `/api/v1/transactions` (array) and `/api/v1/analytics/summary` contracts.

## 2. Design Choices
- Category `kind` fixed after creation; avoids historical type mismatch.
- Delete only unused Categories; no cascading transaction deletion.
- Monthly date ranges inclusive of first day and exclusive of next month's first day.
- Local MVP single currency BDT; amounts stored as PostgreSQL `NUMERIC(14,2)`.
- Backend derives owner from authenticated session, not request body.
- All financial totals computed in SQL, never from only the displayed first 100 transactions.
- Existing categories schema is reused, with a new case-insensitive unique index.

## 3. Component Changes
| Component | Baseline | Iteration 2 |
|---|---|---|
| Category API | GET only | GET, POST, PATCH, DELETE |
| Analytics API | All-time summary | All-time + month summary/breakdown |
| Transaction API | GET with 100 limit | GET with optional month, kind, categoryId filters |
| Frontend | Dashboard CRUD | Month Picker + Category Manager + Period Summary |
| DB | 001_init | 002 category label uniqueness index |
| Tests | Auth + Transaction | Category + Analytics isolation/validation cases |

## 4. Requirement Traceability
| Requirement | API/UI | Test |
|---|---|---|
| FR-06 Category CRUD | `/categories`, Categories tab | TC-CAT-01, 02, 03 |
| FR-07 Summary | `/analytics/monthly`, dashboard cards | TC-ANA-02 |
| FR-02 Data isolation | User-Scoped Queries | TC-SEC-02 |
| NFR-02 Transaction safety | DB Unique/FK constraints | TC-DATA-01 |
| NFR-01 2s dashboard | Refresh after writes | TC-PERF-01 (requires measured local run) |

## 5. Exit Criteria
- [ ] Backend `npm run typecheck`, `npm run build`, `npm run test` pass locally.
- [ ] Frontend `npm run build` passes locally.
- [ ] DB migrations 001 and 002 apply on a test database.
- [ ] Manual CRUD and filter scenarios pass in browser.
- [ ] Two-user isolation test passes.
- [ ] SRS open decisions reviewed by project stakeholder.
- [ ] Source control commit and release notes prepared.

## 6. Not Included Yet
- Pie/Bar Charts (Phase 3)
- OAuth2/OIDC for external integration
- Multi-tenant roles, Audit Event Log, Webhook
- Production monitoring/deployment and independent security review
