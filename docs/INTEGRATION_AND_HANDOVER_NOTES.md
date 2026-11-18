# API-First Integration & Handover Notes

## What is available now
- Backend and frontend are independently runnable.
- API base path `/api/v1`, with Swagger/OpenAPI documentation in development mode.
- User-scoped expense, category and analytics endpoints.
- The React frontend consumes the same backend API a future client might use.

## What is **not** available yet
- OAuth2/OIDC identity federation with another ERP, HRM or mobile app.
- A supported public API token, signed webhook, cross-site embeddable widget or multi-tenant organizations.
- SLA, production API gateway, rate limit policy, audit logging and access logs suitable for regulated finance.

## Future integration pathway
1. Define trusted external app/tenant identities and permission scopes.
2. Use an OIDC/OAuth2 authorization server to issue scoped access tokens; validate issuer, audience, expiry and permissions.
3. Implement backend resource-ownership checks for both personal users and organization context.
4. Publish stable versioned API specifications and integration test fixtures.
5. Add webhooks only with delivery retries, event IDs and signature verification.
6. Consider an embeddable component only after CSRF/cookie/site-origin and CSP requirements are designed.

## Handover artifacts for final SDLC stage
Final signed SRS, ERD, diagrams, deployment runbook, environment list, secret rotation procedure, backup/restore results, penetration/load test reports, requirement traceability, release changelog, and access to source repository.
