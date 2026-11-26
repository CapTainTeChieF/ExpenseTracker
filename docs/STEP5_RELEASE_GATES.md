# Step 5 — Release Gate Decision (no sign-off yet)

**Documentation baseline:** 2026-11-26 UTC, commit `98e0c51`.
**Application package version:** `1.0.0-rc.1`.
**Overall stable-release status: BLOCKED — required acceptance, operational evidence and approvals remain outstanding.**

The release candidate has previously been deployed to Vercel and Render. Deployment history is not approval for a stable release. This revision reconciles evidence; it does not approve `v1.0.0`, authorize a deployment, or establish current production health.

## 1. Evidence baseline

- [CI run 45872873003](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45872873003), commit `2bffa8e`: backend and frontend passed. [Backend logs](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45872873003/job/140092490848) explicitly show 10/10 Jest tests (5 suites), 2/2 QA helpers and 16/16 API scenarios; QA artifact uploaded. The JSON archive itself has not been inspected.
- [Post-merge CI run 45875779858](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45875779858), commit `98e0c51`: backend and frontend jobs passed. The detailed counts and measurements below use the earlier inspected logs rather than assuming every later run has identical detailed results.
- [QA matrix](QA_TEST_MATRIX.md), [SRS](STEP6_SRS_v1.0_FOR_APPROVAL.md) and [RTM](STEP6_REQUIREMENT_TRACEABILITY_MATRIX.csv): 15 requirements, 2 API_VERIFIED, 10 PARTIAL, 3 PENDING at the evidence baseline. These are not approval scores.
- Both package lockfiles are tracked. GitHub release list is empty at this review; no new tag/release is created here. Current tag enumeration was not available via the repository connector.

## 2. Gate assessment

`PASS (QA)` or `PASS (CI)` means scoped executed evidence, not formal acceptance. `PARTIAL` means supporting evidence exists with explicit gaps; `PENDING` means adequate current evidence is unavailable; `BLOCKED` means a known defect or missing prerequisites prevent reliable gate use. Historical deployment and planned procedures do not constitute executed acceptance tests.

| Gate | Evidence required | Current status | Scope / remaining action |
|---|---|---|---|
| Compile/lint/typecheck | Clean backend/frontend build, typecheck and agreed lint evidence | PARTIAL | Both CI builds and typechecks passed; separate lint is not configured/executed by current CI. Establish agreed lint check or explicit disposition. |
| Automated API integration | Executed isolated QA scenarios and result evidence | PASS (QA) | All 16 scenarios logged PASS; preserve sanitized log/artifact; not a production check. |
| Playwright browser/mobile | Actual report and screenshots | PENDING | Three scenarios, two configured Chromium projects; no current execution report and not in CI. |
| Cross-user isolation | Auth and resource ownership tests | PASS (QA) | QA-002/005/006/010 and owner-scoping unit tests; broader production security review remains open. |
| Login limit, cookie revocation | Real requests and 403/401/429 checks; production proxy/cookies | PARTIAL | QA-013/014/016 passed in isolated test environment; actual Secure/HttpOnly/SameSite, IP proxy and live Origin behavior still require verification. |
| Dashboard 2s SLA | 30 valid browser commit-to-visible-update trials under defined load | PENDING | QA-015 measured 10 tiny API samples: P50 5 ms, P95 14 ms, max 14 ms. No browser acceptance claimed. See PERF-30. |
| Staging deploy | Separate approved staging URLs, commit, configuration and smoke tests | PENDING | Prior RC deployment documented; no separate staging environment or current production smoke record independently verified. |
| Backup restore drill | Restore log, archive hash, reconciliation, reviewer | PENDING | Tools and SOP exist; actual backup/restore, schedule and approved recovery objectives unverified. |
| Security review | Owner sign-off and residual risk disposition | PENDING | Implemented controls and QA evidence exist; live security review and remaining risks not signed off. |
| UAT | User sign-off with defects resolved | PENDING | Formal acceptance and first-time user results unavailable. |
| Dependency lockfiles and review | Tracked locks, advisory review and reproducibility evidence | PARTIAL | Both locks committed; current CI/Dockerfile still use npm install; dependency/security review and immutable installs pending. |
| Production go/no-go | Authorized decision backed by required gates | BLOCKED | BUG-004 correction locally verified; merge verification and formal stable-release approval remain outstanding. |

See [performance protocol](PERFORMANCE_TEST_PROTOCOL.md), [security changes and remaining risks](STEP5_SECURITY_CHANGES_AND_REMAINING_RISKS.md), [UAT sign-off template](STEP6_UAT_SIGNOFF_TEMPLATE.md), [deployment runbook](STEP5_DEPLOYMENT_RUNBOOK.md) and [backup SOP](STEP5_BACKUP_RECOVERY.md).

## 3. Release workflow defect — BUG-004

**Issue:** [GitHub Issue #11](https://github.com/CapTainTeChieF/ExpenseTracker/issues/11)

**Affected source:** [.github/workflows/release-gate.yml](../.github/workflows/release-gate.yml).

**Status:** Correction implemented and locally regression-tested; pending merge verification.

### Root cause

The original implementation chained three approval checks using `&&` before independently validating the change ticket. Bash error-exit behavior allowed six invalid approval combinations to return success.

### Correction

Replaced the conditional chain with independent fail-fast validation checks for UAT approval, security approval, restore drill approval and a nonempty change ticket. Each failed condition terminates execution with exit code 1 and a descriptive error message.

### Regression verification

- Date: 2026-11-27 (Bangladesh time).
- Branch: `fix/release-gate-validation`.
- Environment: Windows Git Bash 5.2.37.
- Bash syntax validation: PASS.
- Regression scenarios RG-01 through RG-16: 16/16 PASS.
- Invalid approval combinations correctly rejected: 15/15.
- Valid synthetic approval combination correctly accepted: 1/1.
- Incorrect approvals: reduced from six to zero within the tested input matrix.

Tests executed the Bash body extracted directly from the modified workflow using synthetic inputs. No GitHub release workflow was dispatched and no production deployment was performed.

### Remaining limitations

The workflow validates approval assertions, not the authenticity of supporting evidence. Whitespace-only ticket validation and automated regression execution in CI remain potential follow-up improvements.

Stable-release approval remains blocked until all applicable acceptance requirements and genuine human approvals are satisfied.

## 4. Go/no-go procedure

1. Identify exact candidate commit, package versions, intended deployment target, change ticket, rollback artifact and authorized reviewer roles.
2. Review current CI logs, browser reports, security evidence, requirements traceability, recovery drill and performance/UAT outcomes. Record each unresolved finding and approved risk decision; do not silently weaken an SRS target.
3. Confirm the BUG-004 correction is merged and its regression evidence reviewed before relying on the manual approval workflow. Require actual UAT, security and restore evidence, not just checked inputs.
4. Confirm current database hosting and recoverability, staging and production configuration, secret handling, monitoring/escalation and verified rollback path.
5. Record the human go/no-go decision and scope. Only after genuine approval should a stable version/tag/release or promotion be considered through the separate release workflow. A documentation merge does not increment package versions.
6. Verify live deployment and monitor after approved promotion; record deployment SHA and results separately from candidate CI. Stop promotion on failures and invoke the runbook.

## 5. Approval record (not completed)

| Field | Actual evidence |
|---|---|
| Candidate commit / version | PENDING selection |
| Change ticket | PENDING |
| QA lead / date / evidence | PENDING |
| Security owner / date / residual risks | PENDING |
| UAT reviewer / date / outcome | PENDING |
| Restore drill reviewer / date / evidence | PENDING |
| Project owner / date / authorized decision | PENDING |
| Approved exceptions, scope and expiry | PENDING review |
| Stable release decision | NOT APPROVED |

Rule: CI passing alone does not override human UAT, restore verification, privacy review or required release evidence. Do not fabricate approvals or conflate the historical RC deployment with stable-release authorization.
