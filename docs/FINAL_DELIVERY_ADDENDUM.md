# Final Delivery Addendum (2026-11-09)

The core application remains release candidate `v1.0.0-rc.1`. The external kit adds:

- A full local-only Docker Compose topology: `docker-compose.full.local.yml`; backend + frontend + Postgres + migration job.
- Full-local and normal-local PowerShell convenience scripts in `scripts/`.
- A zero-dependency project structure doctor at `scripts/doctor.mjs`.
- A trusted same-origin browser API client + independent unit tests and a local Postman collection outside this source tree in `../02_INTEGRATION_KIT`.
- Comprehensive new English runbooks and Bengali quick-start outside the source tree.

**These additions do not constitute independently certified production deployment.** The hosted app, native Node builds, PostgreSQL QA, Playwright, performance criteria, cloud deployment and security/UAT signoffs still must be verified. No OAuth/OIDC external user federation or unrestricted machine-to-machine API was implemented.
