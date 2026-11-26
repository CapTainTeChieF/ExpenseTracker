# Academic Project Demonstration — Presentation Outline

**Project:** Personal Expense Tracker with Analytics (ExpenseTracker)

**Course:** Software Engineering (CSE-3203)

**Method:** Iterative SDLC — three development iterations followed by verification, deployment and handover

**Application version:** `1.0.0-rc.1`

**Repository baseline:** [`443e5d8`](https://github.com/CapTainTeChieF/ExpenseTracker/commit/443e5d8), 27 November 2026 (Bangladesh time)

**Status:** Proposed 15-slide outline for academic review; not a finished slide deck or an approved presentation rubric.

Use the [SDLC project report](STEP6_SDLC_PROJECT_REPORT.md) as the narrative source. The following 17-minute plan includes a four-minute demonstration and a brief close; additional question time may be needed. Adjust timing and slide count to the actual instructor requirements, which have not yet been confirmed.

## 1. Slide plan

| Slide | Topic | Core message and suggested visual | Time |
|---:|---|---|---:|
| 1 | Title | Project, course, presenter/instructor details to be supplied; current release-candidate version | 0:30 |
| 2 | Problem and objectives | Personal finance records, categorization, balances, privacy; distinguish personal ledger from banking system | 0:45 |
| 3 | Requirements and scope | Nine FRs and six NFRs; key goals, two-second browser target, BDT-only scope and exclusions | 1:00 |
| 4 | Iterative SDLC | Three build iterations plus verification, deployment and handover; show report Figure 1; historical labels are not Git tags | 1:15 |
| 5 | Use case model | Guest and authenticated account holder; registration/login and protected personal-finance goals; report Figure 2 | 1:00 |
| 6 | Architecture and stack | React frontend, modular NestJS REST backend, PostgreSQL; logical architecture and design rationale | 1:15 |
| 7 | Database and authentication | ERD, optional category reference, ownership constraint, session revocation; use detailed architecture ERD and sequence diagram | 1:15 |
| 8 | Iteration 1 — foundation demo | Login/registration with synthetic account and income/expense workflow; login and dashboard screenshots as fallback | 1:15 |
| 9 | Iteration 2 — enhancement demo | Category management, filters, monthly summaries; category and transaction-edit screenshots as fallback | 1:30 |
| 10 | Iteration 3 — analytics demo | Expense donut, income/expense bars and range selector; analytics/mobile screenshots; logout | 1:15 |
| 11 | Testing and results | 10 Jest + 2 helper + 16 API cases passed; successful type checks/builds; detailed CI link; 10 local API samples P50 5 ms/P95 14 ms/max 14 ms, not browser SLA | 1:30 |
| 12 | Requirements and acceptance | 9/9 functional requirements implemented in source; 2 API_VERIFIED, 10 PARTIAL, 3 PENDING across 15 IDs; no formal acceptance | 1:15 |
| 13 | Deployment and operations | Vercel → Render API → PostgreSQL, same-origin rewrite, separate CI; backup tooling and proposed policy; stable release blocked | 1:15 |
| 14 | Maintenance, limitations and roadmap | BUG-001/002 fixes merged; BUG-003 resolution unverified; BUG-004 open as issue #11; browser/security/recovery gaps; GitHub PR history | 1:15 |
| 15 | Conclusion and questions | Achievements, engineering lessons, limits and future work; repository link; invite questions | 0:45 |
| | **Total planned presentation** | **Including 4:00 demonstration across slides 8–10** | **17:00** |

## 2. Demonstration procedure

Use a dedicated synthetic account and preferably an isolated QA/staging environment. If demonstrating the documented public release candidate, first obtain authorization for any writes, verify current health, and confirm that only disposable test records will be affected. Do not create or restore infrastructure simply for the demonstration. Do not expose real financial data, cookies, secrets, connection URLs or administrative dashboards with confidential values.

| Step | Demonstrate | Expected behavior (not an observed run result) |
|---|---|---|
| 1 | Login using a prepared test account, or register a new synthetic account if needed | Login or registration succeeds; account dashboard opens |
| 2 | Create a 1,000 BDT income and 250 BDT expense in a known empty test month | Monthly balance becomes 750 BDT if no other records exist in that month |
| 3 | Create or select an owned expense category, then rename it | Category is available; existing references remain consistent |
| 4 | Edit the synthetic expense to 300 BDT in the dialog, show preserved dashboard scroll | Monthly balance becomes 700 BDT under the same isolated fixture |
| 5 | Filter transactions by month/type; inspect expense distribution and trend ranges | Visible records and analytics reflect selected data; chart values match expected fixture |
| 6 | Show the mobile layout if available, then log out | Responsive interface and return to login screen; revocation evidence is shown from isolated QA logs |

Optional if time permits: demonstrate deletion of disposable records and an unused category after explicit authorization, or show how a referenced category deletion is rejected. Do not intentionally test throttling or run load/security tests against shared production during the viva. Explain cross-user isolation, wrong-Origin denial and revoked-cookie rejection from the verified QA evidence instead. The expected outcomes above are a proposed demo script, not new passing test results.

### Fallback plan

- Check the chosen environment and synthetic account before the presentation; record the actual deployed or local commit and smoke-check outcome if available.
- Keep the six existing screenshots and rendered diagrams available offline. If the hosted app is unavailable, use the prepared local environment only if already tested, otherwise present the screenshots and accurately explain the limitation.
- Preserve verified CI evidence links or authorized sanitized captures. Do not replace a failed live demo with a fabricated success claim.

## 3. Evidence and visual assets

| Asset | Source and use |
|---|---|
| SDLC lifecycle and use cases | [SDLC report](STEP6_SDLC_PROJECT_REPORT.md), Figures 1–2 |
| System architecture, ERD and authentication sequence | [Architecture and ERD](ARCHITECTURE_AND_ERD.md); simplified figures in report |
| Login, dashboard and edit dialog | [Login](screenshots/login.png), [dashboard](screenshots/dashboard.png), [transaction edit](screenshots/transaction-edit.png) |
| Categories, charts and mobile view | [Categories](screenshots/categories.png), [analytics](screenshots/analytics.png), [mobile](screenshots/mobile.png) |
| Detailed executed results | [CI run 45872873003](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45872873003), [backend job](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45872873003/job/140092490848), [QA matrix](QA_TEST_MATRIX.md) |
| Latest audited main CI | [Run 45879244146](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45879244146); both jobs passed at `443e5d8` |
| Requirements and release readiness | [RTM](STEP6_REQUIREMENT_TRACEABILITY_MATRIX.csv), [release gates](STEP5_RELEASE_GATES.md) |
| Deployment and recovery | [Runbook](STEP5_DEPLOYMENT_RUNBOOK.md), [backup SOP](STEP5_BACKUP_RECOVERY.md) |
| Maintenance | [Changelog](../CHANGELOG.md), [issue #11](https://github.com/CapTainTeChieF/ExpenseTracker/issues/11), [merged pull requests](https://github.com/CapTainTeChieF/ExpenseTracker/pulls?q=is%3Apr+is%3Amerged) |

Existing screenshots are illustrative interface evidence, not newly executed tests. Render Mermaid diagrams and check legibility before exporting them for slides. The historical 20 manual production smoke checks reported in earlier project context have not been independently reconciled with individual records; do not combine that figure with the 28 verified automated cases.

## 4. Suggested viva discussion points

| Question | Evidence-based answer focus |
|---|---|
| Why Iterative SDLC? | Incremental authentication/transactions, categories/summaries and analytics; later QA and deployment stages without asserting all gates passed |
| Why a modular monolith? | Separated frontend and API, cohesive backend modules, PostgreSQL relational consistency and simpler operational scope |
| How is user isolation enforced? | Authenticated identity, owner-scoped SQL and composite category ownership constraint; scoped QA results |
| How are financial totals computed? | Positive exact-decimal amounts, type distinction, SQL aggregation, month boundaries and income minus expense |
| Why persistent sessions with JWT? | Logout can revoke the server-side session; guard rejects revoked or expired sessions |
| Does 14 ms P95 meet the two-second requirement? | No acceptance conclusion: small isolated API measurement differs from representative browser refresh time |
| Is the application production-ready? | Previously deployed release candidate; stable-release gates and operational checks remain outstanding |
| What would you improve next? | Durable database hosting, backups/recovery, BUG-004 fix, browser/performance/UAT, security and monitoring before feature expansion |

## 5. Final presentation readiness checklist

- [ ] Confirm instructor rubric, permitted timing, slide count and required student/instructor details.
- [ ] Cross-check the original proposal, current SRS and finalized report.
- [ ] Render diagrams and inspect all screenshot evidence for legibility and privacy.
- [ ] Prepare a real presentation deck separately; include source links and meaningful captions.
- [ ] Rehearse with a synthetic account in an approved environment; prepare fallback materials.
- [ ] Record actual demo outcomes and any additional executed evidence; retain all pending labels where applicable.
- [ ] Update BUG-004 status, latest CI link and release decision only when supported by new evidence.
- [ ] Review final academic submission and handover separately from software release approval.

No fabricated screenshots, metrics, sign-offs, deployment checks or browser test results should be presented. This outline does not authorize deployment, database changes or a stable release.
