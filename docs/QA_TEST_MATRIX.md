# Step 4 — QA Test Matrix and Verification Evidence

**Evidence baseline:** 2026-11-26 (UTC), commit `2bffa8e`, application `1.0.0-rc.1`.

This reconciled matrix uses the 15 requirement IDs defined in the [current SRS](STEP6_SRS_v1.0_FOR_APPROVAL.md). The historical Step 4 requirement numbering is superseded for current traceability; test IDs remain unchanged. UI-E2E-03 identifies the existing third browser scenario, not a newly executed test.

## 1. Evidence and interpretation

- [GitHub Actions run 45872873003](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45872873003) — completed successfully for both backend and frontend.
- [Backend job 140092490848](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45872873003/job/140092490848) — execution logs explicitly show all 16 `PASS: QA-...` lines, 10/10 Jest tests (5 suites), 2/2 QA helper tests and the measured QA-015 timing summary.
- [Frontend job 140092491224](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45872873003/job/140092491224) — successful frontend typecheck and build; does not execute Playwright.
- Artifact `backend-qa-evidence` (ID 15143521231) was uploaded. The logs record generation of `docs/qa-evidence/qa_api_result.json`; the artifact archive has not been independently opened. This matrix cites the executed logs, not invented JSON contents.

`PASS (QA)` means that the listed assertions passed in the isolated test environment; it does not imply full requirement acceptance. `PENDING` means current execution evidence is unavailable, not that the test failed or was never run in any earlier session. `PLANNED` identifies additional verification work, not a new implemented test. The [RTM](STEP6_REQUIREMENT_TRACEABILITY_MATRIX.csv) records broader requirement-level results.

## 2. Executed API scenarios

Source: [api-scenarios.mjs](../backend/scripts/qa/api-scenarios.mjs). Each row is backed by the backend job log above. The runner stops on the first failed assertion and exits unsuccessfully; all 16 scenarios completed successfully at this baseline.

| Test ID | SRS requirements | Observed outcome / assertions passed | Result |
|---|---|---|---|
| QA-001 | FR-09, NFR-06 | Public versioned health endpoint returns 200 and connected database in QA. | PASS (QA) |
| QA-002 | FR-01, FR-02, NFR-04 | Unauthenticated transaction, category and analytics GET requests return 401. | PASS (QA) |
| QA-003 | FR-01 | Two independent accounts register (201), receive session cookie names/values and distinct IDs. Cookie attributes are not directly asserted by the helper. | PASS (QA) |
| QA-004 | FR-01 | Duplicate registration returns 409; wrong password returns 401; authenticated profile matches registered account. Valid login is not exercised. | PASS (QA) |
| QA-005 | FR-02, FR-05, NFR-04 | Category create and rename succeed; another user cannot list or rename the first user's category. | PASS (QA) |
| QA-006 | FR-02, FR-03, FR-07, NFR-04 | Zero amount, unknown field, foreign category, invalid month and invalid trend size rejected (400). | PASS (QA) |
| QA-007 | NFR-02, FR-06 | Invalid foreign-category creation rejected; all-time summary unchanged. | PASS (QA) |
| QA-008 | FR-03, FR-04 | Valid income and expense records created for two users (201). | PASS (QA) |
| QA-009 | FR-06, FR-07, FR-08 (data prerequisite) | Monthly income 1,000, expense 250, balance 750; expense category total and three-month trend with zero-income month checked. | PASS (QA) |
| QA-010 | FR-02, FR-04, NFR-04 | Foreign transaction edit/delete return 404; foreign record absent from list; second user's monthly expense equals 700. | PASS (QA) |
| QA-011 | FR-05 | Used category deletion rejected (409); successful unused deletion not tested. | PASS (QA) |
| QA-012 | FR-04, FR-06, FR-07, NFR-02 | Invalid zero-amount update rejected; original monthly expense retained; valid update changes balance to 700. | PASS (QA) |
| QA-013 | NFR-04 | Wrong Origin login mutation returns 403 in test configuration. Production proxy/origin behavior not tested. | PASS (QA) |
| QA-014 | FR-01, FR-04, FR-06, FR-07, NFR-04 | Delete succeeds; monthly balance becomes 1,000; logout clears cookie and copied old cookie is rejected (401). | PASS (QA) |
| QA-015 | FR-06, NFR-01 (indicative) | Ten create/summary cycles verify expense increments. Timing recorded; no two-second browser gate evaluated. | PASS (QA) |
| QA-016 | FR-01, NFR-04 | Ten bad login attempts for a synthetic account return 401; eleventh returns 429. | PASS (QA) |

All scenarios use `/api/v1` in the isolated QA environment and support FR-09/NFR-06 at the runtime-contract level. They do not verify Swagger output or external API compatibility.

## 3. Unit, helper and build verification

| Source / check | Executed coverage | Result |
|---|---|---|
| `auth.service.spec.ts` | Simulated category failure during signup triggers rollback and client release (1 test). | PASS |
| `categories.service.spec.ts` | Owner-scoped listing/creation, unknown rename rejection and used-category deletion rejection (4 tests). | PASS |
| `transactions.service.spec.ts` | Owner-scoped list query and zero-amount rejection (2 tests). | PASS |
| `analytics.service.spec.ts` | Mocked monthly totals and grouping queries scoped by user (1 test). | PASS |
| `analytics.trend.spec.ts` | Gap filling, owner scoping and invalid range rejection (2 tests). | PASS |
| `metrics.test.mjs` / UNIT-QA-01..02 | Percentile calculation and QA database safety guard (2 tests). | PASS |
| Backend and frontend type checks and builds | Compiler and production build checks in CI; not counted as test cases. | PASS |

Total: 10 Jest + 2 helper + 16 integration = 28 passed automated cases. Mock-based tests do not substitute for production or fault-injection tests.

## 4. Browser regression tests — current execution pending

Source: [expense-tracker.spec.ts](../frontend/e2e/expense-tracker.spec.ts) and [Playwright configuration](../frontend/playwright.config.ts). Three test definitions run in two configured Chromium projects (Desktop Chrome and Pixel 7), yielding six configured executions. No current run report is available, and the CI workflow does not run Playwright.

| Test ID | Requirement mapping | Implemented assertions | Result |
|---|---|---|---|
| UI-E2E-01 | FR-01, FR-03, FR-06, FR-07, FR-08 | Default login screen, registration, expense/income creation, monthly totals, pie chart visibility, bar chart heading, logout returns to login. Does not actually perform a successful credential login. | PENDING |
| UI-E2E-02 | FR-05, NFR-03 (supporting) | Category creation visible; mobile dashboard navigation accessible. Does not exercise all CRUD or measure usability. | PENDING |
| UI-E2E-03 | FR-04, FR-07 | Edit dialog prefilled; cancel/Escape; scroll preserved; save updates record and monthly expense; creation draft survives. | PENDING |

Record the HTML report, per-project results, exact commit and device details when executed. Additional manual mobile overflow and keyboard accessibility checks are still necessary. Windows QA runner issue BUG-003 was previously reported; its resolution is not verified here.

## 5. Performance evidence and acceptance gap

QA-015 measured HTTP create through refreshed analytics GET on a tiny local dataset. The executed backend log reports:

| Samples | P50 | P95 | Max |
|---:|---:|---:|---:|
| 10 | 5 ms | 14 ms | 14 ms |

This is indicative only. The [PERF-30 protocol](PERFORMANCE_TEST_PROTOCOL.md) requires representative data (example fixture: 10,000 transactions), environment/device/network details, 30 valid commit-to-visible-balance browser trials, mobile repetition, p50/p95/max and all misses. Each agreed acceptance trial must meet 2,000 ms unless an exception is approved. NFR-01 remains partial until the actual acceptance evidence is reviewed.

## 6. Remaining verification work

The following are planned checks or existing acceptance templates, not newly executed tests. No new SRS requirements are introduced.

| Reference | Requirement(s) | Evidence still needed | Status |
|---|---|---|---|
| Auth gap | FR-01 | Successful credential login, invalid credentials, actual cookie attributes and browser workflow. | PLANNED |
| Transaction gap | FR-03, FR-04 | Assert persisted date/description/category/type, matching type rejection, positive own list/display and current browser edit regression. | PLANNED |
| Category gap | FR-05 | Successful deletion of unused category; duplicate-name runtime check. | PLANNED |
| Balance gap | FR-06 | Explicit lifetime income/balance assertions spanning multiple months. | PLANNED |
| Chart gap | FR-08 | Verify actual plotted values and responsive layout in browser, not only data or chart heading. | PLANNED |
| API-01 | FR-09, NFR-06 | Inspect development OpenAPI output, production-default disablement and documented compatibility/auth contract. | PENDING |
| PERF-30 | NFR-01 | Actual browser timing protocol and representative dataset. | PENDING |
| REL-02 | NFR-02 | Isolated process interruption/network failure and recovery; no corrupt or duplicate data. | PENDING |
| UAT-01..10 | NFR-03; relevant FRs | [UAT checklist](UAT_CHECKLIST.md), first-task success, observed problems and reviewer sign-off. | PENDING |
| SEC-01..10 | NFR-04 | Reconcile [historical security review](SECURITY_REVIEW.md) with implemented controls; verify production cookie/transport/proxy/cache behavior and residual risks. | PENDING |
| OPS-01 (proposed evidence reference) | NFR-05 | Owner-defined RPO/RTO, availability and backup policy, staging-only restore and reconciliation per [backup SOP](STEP5_BACKUP_RECOVERY.md). | PENDING |

## 7. Execution environment and evidence record

| Field | Verified CI baseline / pending detail |
|---|---|
| Run date/time | 2026-11-26 UTC; backend completed 18:04:27 UTC |
| Git commit | `2bffa8e7f1a1fef8c28451e0769d3158d4d6fbf4` |
| OS | GitHub-hosted Ubuntu (`ubuntu-latest` workflow configuration); Windows local results not established by this run |
| Node / PostgreSQL | Node 24 and postgres:17-alpine configured by workflow |
| API / DB | Local QA API port 4100; isolated PostgreSQL port 5434 / expense_tracker_qa; synthetic users only |
| Browser / viewport | Not executed by this workflow; configured Desktop Chrome and Pixel 7 |
| Dataset | Tiny synthetic QA dataset, not a representative production-like load |
| Evidence | Backend job logs; uploaded backend-qa-evidence artifact; archive contents not inspected |
| Reviewer | Pending human review |

For additional executions record date/time, reviewer, exact OS/runtime versions, device/viewport, network, fixture count, commit, individual outcomes, issue IDs and sanitized evidence location. Never include credentials, session tokens or personal financial records in reports.

## 8. Sign-off

The isolated automated suite passed at the stated baseline. The Step 4 gate and formal SRS/UAT acceptance are not signed; pending tests remain open. Previous production smoke-test reports are not mapped to individual requirements here because their detailed evidence has not been inspected for this baseline.

- Developer: __________________ Date: ______________
- Tester/UAT reviewer: __________________ Date: ______________
- Security reviewer: __________________ Date: ______________
- Step 4 gate: [ ] PASS [ ] CONDITIONAL [ ] BLOCKED
