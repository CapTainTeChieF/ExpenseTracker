# Step 4 — Verification / Validation Exit Gate

**CURRENT DECISION: NOT SIGNED OFF.** Test code has been authored but live PostgreSQL/NestJS/Playwright execution must be performed on a real QA environment. Do not represent source syntax checks or helper unit tests as E2E acceptance.

| Gate | Evidence required | Current state |
|---|---|---|
| G1 Code correctness | Backend Jest tests, TypeScript typecheck/build, frontend build | NOT RUN in this environment |
| G2 API functionality | 15 local QA API scenarios PASS, evidence JSON | NOT RUN in this environment |
| G3 UI E2E | Desktop/mobile Playwright suite PASS, screenshots/traces | NOT RUN in this environment |
| G4 User isolation | User A/B ownership tests PASS | NOT RUN in this environment |
| G5 2-second requirement | 30 representative commit-to-UI trials incl. raw metrics | NOT RUN in this environment |
| G6 Reliability | Rollback test and unexpected interruption/recovery drill | PARTIAL CODE ONLY; fault test NOT RUN |
| G7 Security | High findings resolved or documented acceptable decision | OPEN findings |
| G8 UAT | Signed acceptance sheet and known limitations | NOT RUN |

**Go/no-go:** Do not advance to production until G1–G8 are satisfied or an authorized owner formally accepts and documents individual exceptions. Step 5 can start as staging infrastructure preparation without implying go-live approval.

## Recorded offline verification (package assembly)

- Node built-in QA helper tests: **2 passed** (percentile calculation and database URL refusal).
- `node --check` passed for `metrics.mjs`, `api-scenarios.mjs`, `run-local-integration.mjs`, and `start-qa-api.mjs`.
- Browser, database and backend runtime checks: **not executed** at package-creation time.

## Approval form

Build ID / Git revision: ______________
Tester: ______________ Date: __________
Security reviewer: ______________ Date: __________
Project owner: ______________ Date: __________
Decision: [ ] APPROVED [ ] CONDITIONAL [ ] BLOCKED
Required fixes before deployment: _________________________________
