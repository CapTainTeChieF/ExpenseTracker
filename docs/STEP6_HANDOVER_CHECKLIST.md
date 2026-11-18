# Step 6 — Handover Checklist and Acceptance Record

**Current handover state: documentation package prepared; release approval pending.**

## A. Software assets

- [x] `README.md` — complete English entrypoint with installation and upgrade.
- [x] `backend/src/`, `frontend/src/` — code from Step 4 with Step 5 security enhancements.
- [x] All SQL migrations `001`, `002`, `003` (not run on a live production DB here).
- [x] CI workflows, Render and Vercel hosting templates, scripts and backup procedure.
- [x] Previous Step 4 tests and QA/UAT forms.
- [x] SRS for approval, SDLC report draft, traceability CSV and integration guide.
- [ ] Verified `package-lock.json` files committed with resolved dependencies.
- [ ] Live staging/prod URLs recorded and smoke tested.
- [ ] All QA/UAT/performance test evidence attached.
- [ ] Verified database backup restore drill and RPO/RTO approved.
- [ ] Security/privacy owner approval and any legal requirements reviewed.

## B. Operational handover values (owner to fill)

| Item | Value |
|---|---|
| Production frontend URL | NOT DEPLOYED |
| Production API URL | NOT DEPLOYED |
| Staging frontend/API URLs | NOT DEPLOYED |
| Git repository / commit SHA | TO BE PROVIDED |
| DB hosting region / engine version | TO BE PROVIDED |
| Database migration state | UNVERIFIED |
| Monitoring and alerting contact | TO BE PROVIDED |
| Backup schedule / RPO / RTO | TO BE APPROVED |
| Deployment / incident owner | TO BE ASSIGNED |
| Security and privacy contact | TO BE ASSIGNED |
| UAT sign-off link | PENDING |
| Test execution evidence | PENDING |

## C. Suggested handover demonstration

1. Explain requirements and three iterative SDLC builds.
2. Demonstrate user sign-up/login; show category create/edit and Income/Expense CRUD.
3. Show analytics chart and monthly trends; show user isolation test.
4. Demonstrate logout token revocation and login throttling in isolated QA.
5. Explain CI pipeline, hosting design and backup restore drill evidence.
6. Review findings, remaining risks and next-release scope.

**Project owner signature:** __________________  **Security reviewer:** __________________  **QA/UAT reviewer:** __________________  **Date:** __________
