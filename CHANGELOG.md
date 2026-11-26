# Changelog

All notable changes to ExpenseTracker (Personal Expense Tracker with Analytics) are documented in this file.

The format is based on [Keep a Changelog 1.1.0](https://keepachangelog.com/en/1.1.0/), and future formal releases follow [Semantic Versioning 2.0.0](https://semver.org/spec/v2.0.0.html).

The current frontend and backend package version is `1.0.0-rc.1`. Earlier version labels and the release-candidate preparation date are preserved from the original project documentation. They represent development milestones, not verified Git-tagged releases. As of the repository audit on 2026-11-26, no Git tags or published GitHub Releases existed. Subsequent changes are grouped under Unreleased until a new version is formally prepared. Dates in GitHub history references use UTC.

## [Unreleased]

Changes since the documented `1.0.0-rc.1` preparation baseline, including subsequent deployment and maintenance work. These changes have not yet been assigned a new formal release version; some are already deployed.

### Added

- Committed frontend and backend dependency lockfiles to support reproducible installations and deployment ([cc93bb6](https://github.com/CapTainTeChieF/ExpenseTracker/commit/cc93bb60)).
- Added the MIT open-source license ([PR #5](https://github.com/CapTainTeChieF/ExpenseTracker/pull/5)).
- Added six application screenshots covering login, dashboard, analytics, transaction editing, category management and mobile layout ([PR #6](https://github.com/CapTainTeChieF/ExpenseTracker/pull/6)).
- Expanded Playwright regression coverage for authentication and transaction editing, including exact save-button targeting ([PR #3](https://github.com/CapTainTeChieF/ExpenseTracker/pull/3), [PR #4](https://github.com/CapTainTeChieF/ExpenseTracker/pull/4), [e234aed](https://github.com/CapTainTeChieF/ExpenseTracker/commit/e234aed7)).

### Changed

- Refreshed the backend dependency lockfile and excluded TypeScript incremental build cache files (`*.tsbuildinfo`) from version control ([PR #1](https://github.com/CapTainTeChieF/ExpenseTracker/pull/1)).
- Configured the Vercel `/api/v1/:path*` rewrite to forward API requests to the Render backend while preserving the single-page application fallback ([PR #2](https://github.com/CapTainTeChieF/ExpenseTracker/pull/2)).
- Improved database connectivity diagnostics by logging the database error code in the backend health endpoint while retaining a generic service-unavailable response ([cb91995](https://github.com/CapTainTeChieF/ExpenseTracker/commit/cb91995d)).
- Modernized the README to describe the application, deployed frontend, features, architecture, local setup, API, security, testing, documentation and known limitations; included license information and a CI status badge ([c50046f](https://github.com/CapTainTeChieF/ExpenseTracker/commit/c50046f8), [PR #6](https://github.com/CapTainTeChieF/ExpenseTracker/pull/6)).

### Fixed

- **BUG-001:** Made login the default authentication screen for unauthenticated users on startup and after logout, instead of registration ([PR #3](https://github.com/CapTainTeChieF/ExpenseTracker/pull/3)).
- **BUG-002:** Replaced inline transaction editing with a reusable modal dialog to prevent unwanted dashboard scrolling. Separated creation and editing state, preserved unfinished transaction drafts, corrected the save-button label and prevented overlapping transaction operations. The existing transaction update API remains unchanged ([PR #4](https://github.com/CapTainTeChieF/ExpenseTracker/pull/4)).

### Removed

- Removed the legacy Bengali README (`README_BN.md`) from the repository ([066980f](https://github.com/CapTainTeChieF/ExpenseTracker/commit/066980f3)).

### Verification notes

- The initial existing project snapshot was imported into GitHub on 2026-11-18 ([de0c2d6](https://github.com/CapTainTeChieF/ExpenseTracker/commit/de0c2d65)).
- All six pull requests listed above had been merged by 2026-11-26. The [latest audited CI run](https://github.com/CapTainTeChieF/ExpenseTracker/actions/runs/45863949829) for `main` commit `595e9ee` passed both backend and frontend jobs.
- The CI workflow covers backend Jest and helper tests, TypeScript checks, builds and isolated PostgreSQL API integration scenarios, plus frontend type checking and build. Playwright browser execution is not included in the current CI workflow. The browser regression coverage added above does not establish a passing browser test result.
- The application was deployed to Vercel and Render during subsequent project work, as recorded in the current [README](README.md). Deployment configuration and passing CI do not establish current production health or formal release acceptance.

## [1.0.0-rc.1] - 2026-11-09

Historical preparation milestone for Steps 5 and 6. This date is taken from the original changelog; it is not a verified publication or tag date.

### Added

- Added migration `003_sessions_and_auth_limits.sql` for persistent authentication sessions and rate-limit buckets.
- Added backend Dockerfile, Render deployment example, Vercel same-origin proxy generator and configuration validation, deployment runbook and smoke-test scripts.
- Added GitHub Actions CI and a manual release-gate workflow. The latter records approval assertions and does not perform deployment.
- Added PostgreSQL backup and staging-only restore scripts, along with disaster recovery documentation.
- Added the SRS for approval, draft SDLC report, requirement traceability matrix (CSV), API integration guide, presentation outline and handover checklist.

### Changed

- Preserved the Step 4 API, frontend modules, QA harness, documentation and earlier database migrations while preparing the release-candidate package.

### Security

- Implemented database-backed session revocation on logout; protected routes reject revoked session tokens.
- Implemented bounded login and registration rate limiting using hashed IP and account counters.
- Strengthened production mutation Origin enforcement and added optional controlled reverse-proxy trust settings.

### Verification notes

- At the time of the original preparation milestone, full runtime testing and production deployment had not been executed in the authoring environment, and sign-offs were pending. This is a historical status statement, not a description of the current GitHub baseline.

## Historical development milestones

The following original version labels are retained for traceability. Exact release dates and formal publication evidence are unavailable; these entries are not retroactively assigned Semantic Versioning tags.

### v0.4 — Step 4: Quality assurance

- Prepared QA automation, API test scenarios, performance testing plans and user acceptance testing (UAT) documentation.

### v0.3 — Step 3: Analytics and API documentation

- Added pie and bar chart analytics and OpenAPI documentation.

### v0.2 — Step 2: Functional enhancement

- Added category management and monthly financial summaries.

### v0.1 — Step 1: Foundation

- Established baseline authentication, transaction CRUD and the initial database schema.

---

For current limitations and pending release verification, see the [README](README.md) and [release gates](docs/STEP5_RELEASE_GATES.md). Planned changes are not recorded as completed changelog entries.
