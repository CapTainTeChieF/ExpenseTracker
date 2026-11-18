# Changelog

## v1.0.0-rc.1 — 2026-11-09, Steps 5 & 6 prepared

- Preserved Step 4 API and frontend modules, QA test harness, docs and earlier migrations.
- Added `003_sessions_and_auth_limits.sql` for persistent sessions and throttling buckets.
- Implemented DB-backed logout session revocation; protected routes now reject revoked copied tokens.
- Implemented bounded login/register rate limiting with hashed per-IP/email counters.
- Strengthened production mutation Origin enforcement and added optional controlled reverse proxy trust settings.
- Added Dockerfile, Render example, Vercel same-origin proxy generator/validation, deployment runbook and smoke tests.
- Added GitHub Actions CI and manually input release gate (neither asserts deployment occurred).
- Added PostgreSQL backup and staging-only restore scripts plus disaster recovery documentation.
- Added final SRS **for approval**, SDLC report draft, RTM CSV, API integration guide, presentation outline and handover checklist.
- Runtime status: full tests and production deployment not executed in authoring environment; sign-offs pending.

## v0.4
Step 4: QA automation, API scenarios, performance plan and UAT docs.

## v0.3
Step 3: Pie/bar analytics and OpenAPI docs.

## v0.2
Step 2: categories and monthly summaries.

## v0.1
Step 1: baseline authentication, CRUD and initial database.
