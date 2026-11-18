# Step 4 — Requirement Traceability and Verification Matrix

Fill the **Actual**, **Result**, **Date/Device**, and **Evidence** columns only after execution. This document is an execution template; results are **NOT RUN** until verified.

| Requirement | Test ID | Verification and expected result | Automation | Actual | Result | Evidence |
|---|---|---|---|---|---|---|
| FR-01 Auth | QA-002/003/004 | Authenticated sessions; invalid credentials 401 | API | — | NOT RUN | — |
| FR-01 Ownership | QA-005/010 | User B cannot view/change A's records | API | — | NOT RUN | — |
| FR-02 Transactions | QA-008/012/014 | Create/edit/delete and totals consistent | API | — | NOT RUN | — |
| FR-02 Input safety | QA-006 | Invalid amount and unknown fields rejected | API | — | NOT RUN | — |
| FR-03 Categories | QA-005/011 | CRUD; referenced category deletion blocked | API | — | NOT RUN | — |
| FR-04 Analytics | QA-009 | Monthly/trend totals correct, zero-month entries | API | — | NOT RUN | — |
| FR-04 Charts | UI-E2E-01 | Updated charts reflect transactions | Playwright | — | NOT RUN | — |
| NFR-01 Dashboard 2s | PERF-30 | 30 real UI commit-to-paint trials <= 2s per acceptance definition | Manual browser | — | NOT RUN | — |
| NFR-02 DB rollback | QA-007 | Failed invalid-category create does not change data | API | — | NOT RUN | — |
| NFR-02 crash/fault | REL-02 | Process crash + retry/recovery with no corruption | Manual fault test | — | NOT RUN | — |
| NFR-03 Usability | UAT-01..08 | First-time user completes all core tasks | Human reviewer | — | NOT RUN | — |
| NFR-04 Security | SEC-01..10 | Threat-model checklist and critical bugs resolved | Manual/automated | — | NOT RUN | — |
| EXT-01 API readiness | API-01 | Versioned endpoints and Swagger reviewed for stability | Manual | — | NOT RUN | — |

## Automation IDs

- QA-001 to QA-015: `backend/scripts/qa/api-scenarios.mjs` (live API tests, two synthetic accounts).
- UNIT-QA-01..02: `node --test backend/scripts/qa/metrics.test.mjs`.
- UI-E2E-01..02: `frontend/e2e/expense-tracker.spec.ts` (runs twice: desktop and mobile).
- PERF-30: `docs/PERFORMANCE_TEST_PROTOCOL.md`, not automated by the API-only timer.

## Test environment record

| Field | Value |
|---|---|
| Test run date/time | TODO |
| Reviewer | TODO |
| Windows version | TODO |
| Node and npm versions | TODO |
| PostgreSQL version | 17-alpine test image, confirm running |
| API host/port | localhost:4100 |
| QA DB host/port | localhost:5434 |
| Device viewport | TODO (e.g. 390 and 1440 px) |
| Transaction count | TODO |
| Git commit/ZIP checksum | TODO |
| Failed tests and issue IDs | TODO |

## Sign-off

- Developer: __________________ Date: ______________
- Tester/UAT reviewer: __________________ Date: ______________
- Security reviewer: __________________ Date: ______________
- Step 4 gate: [ ] PASS [ ] CONDITIONAL [ ] BLOCKED
