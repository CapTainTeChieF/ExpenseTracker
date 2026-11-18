# Software Requirements Specification (SRS) — Draft v1.0
## Personal Expense Tracker with Analytics

**Status:** DRAFT — Stakeholder review/approval pending.  
**Basis:** User-provided course proposal (CSE-3203).  
**Prepared for:** Iterative SDLC; API-first implementation.  
**Scope note:** Original proposal requirements are marked [PROPOSAL]; engineering implementation choices are marked [DESIGN].

## 1. Purpose
বাংলাদেশের শিক্ষার্থী, ফ্রিল্যান্সার এবং ব্যক্তিগত বাজেট সচেতন ব্যবহারকারীদের Daily Income/Expense সংরক্ষণ, Categorization এবং Dashboard Analytics প্রদান করা। ভবিষ্যতে Third-Party Application Integration-এর সুবিধা রাখা।

## 2. Stakeholders
- End User: student / young professional / freelancer [PROPOSAL]
- Project Developer / Tester [DESIGN]
- System Maintainer [DESIGN]
- Future API Consumer [DESIGN]

## 3. Functional Requirements
| ID | Requirement | Acceptance Criteria | Iteration |
|---|---|---|---|
| FR-01 | Secure user login & registration [PROPOSAL authentication] | User can log in; anonymous cannot access protected endpoints | 1 |
| FR-02 | Financial data isolation [PROPOSAL] | User A cannot list/update/delete User B's transactions | 1 |
| FR-03 | Create income/expense [PROPOSAL] | Positive amount, date, description stored in DB | 1 |
| FR-04 | Read transaction history [PROPOSAL] | User sees own records after reload | 1 |
| FR-05 | Edit / delete transactions [PROPOSAL] | Correct record updates/deletes with ownership checks | 1 |
| FR-06 | Dynamic category CRUD [PROPOSAL] | User can create and manage own categories | 2 |
| FR-07 | Income/expense/balance summaries [PROPOSAL] | Balance = Income - Expense, correctly updated | 2 |
| FR-08 | Monthly category pie and bar analytics [PROPOSAL] | Monthly charts match DB aggregates | 3 |
| FR-09 | Versioned external REST API [DESIGN] | External approved client can call documented endpoints | 3+ |

## 4. Non-Functional Requirements
| ID | Requirement | Verification |
|---|---|---|
| NFR-01 | Dashboard balance refreshed within 2 seconds after new entry [PROPOSAL] | Timed E2E test with defined dataset/network conditions |
| NFR-02 | Atomic transaction processing and rollback [PROPOSAL] | Force DB error; verify no partial writes |
| NFR-03 | Self-explanatory UI [PROPOSAL] | First-time users finish agreed tasks without training |
| NFR-04 | Strict data isolation [PROPOSAL] | Negative authorization tests |
| NFR-05 | API-first modular code organization [DESIGN] | Reviewed architecture & API contract |
| NFR-06 | Financial amounts use exact DECIMAL representation [DESIGN] | SQL NUMERIC(14,2), input validation |
| NFR-07 | Reliable backup/restore and logs [DESIGN] | Restore drill before production |

## 5. Business Rules — Pending confirmation
- BR-01: Transaction type: INCOME or EXPENSE.
- BR-02: Amount is strictly greater than zero, max two decimal places.
- BR-03: Baseline currency BDT only; multi-currency remains out of MVP scope.
- BR-04: Balance = sum(INCOME) - sum(EXPENSE) for selected scope.
- BR-05: Each Category belongs to a single user and transaction type.
- BR-06: A transaction belongs to its authenticated user; client cannot supply `user_id`.
- BR-07: Current initial app uses hard delete; soft delete + audit history remains an open decision.
- BR-08: Future bank sync, budgeting predictions and OCR are out of initial proposal scope.

## 6. Use Cases
**UC-01 Register:** Open site → Enter name/email/password → Validate → Create account + default categories → Sign in automatically. Failure: duplicate email or weak password.  
**UC-02 Log In:** Enter credentials → Validate → Session cookie → Dashboard. Failure: wrong email/password.  
**UC-03 Add Expense:** Login → Enter amount/type/date/category → Validate → Save → Refresh balance.  
**UC-04 Edit Transaction:** Choose own transaction → Edit → Validate → Save. Failure: record absent/unauthorized.  
**UC-05 View Analytics (Iteration 3):** Choose month → Pie/Bar graphics reflect filtered records.

## 7. Scope per Iteration
**Iteration 1 Baseline:** setup, DB, authentication, transaction CRUD and basic dashboard numbers (starter code includes these to make it testable).  
**Iteration 2 Enhancement:** user-defined category CRUD, category filters, monthly summaries, extra tests.  
**Iteration 3 Final:** pie/bar charts, UI refinement, performance/security/UAT, API docs and deployment.

## 8. Data and Interfaces
Frontend: React + Vite + Tailwind CSS.  
Backend: NestJS HTTP JSON API `/api/v1`.  
Storage: PostgreSQL; SQL migrations (small initial baseline; Prisma may be introduced later behind repository/service abstraction).  
Auth: HTTP-only cookie session containing signed JWT for this local starter; production SSO / OIDC is not implemented yet.

## 9. Acceptance/Test Mapping
| Test | Verifies | Steps |
|---|---|---|
| TC-AUTH-01 | FR-01 | Register, log in, log out; `GET /auth/me` denied after logout |
| TC-TRX-01 | FR-03/04/05 | Add/Edit/Delete expense, reload app |
| TC-SEC-01 | FR-02, NFR-04 | Login as 2 users, try cross-user PATCH/DELETE IDs |
| TC-DB-01 | NFR-02 | Simulate registration failure mid-transaction; verify rollback |
| TC-ANA-01 | FR-07 | Income 1000, Expense 250 → Balance 750 |
| TC-PERF-01 | NFR-01 | Time save→dashboard balance update under agreed conditions |

## 10. Open Questions for Approval
1. BDT-only for MVP or multi-currency now?
2. How to define month: local timezone Asia/Dhaka or UTC?
3. Should deleted transactions be retained for audit?
4. Is single personal account enough, or multiple wallets/accounts?
5. Who are official stakeholder approvers, and what are deployment/privacy constraints?

**SRS approval status:** Pending. Do not treat the above design assumptions as requirements from the original proposal.
