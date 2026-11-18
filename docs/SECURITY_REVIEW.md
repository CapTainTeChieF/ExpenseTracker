# Step 4 — Security Review, Open Findings and Threat Model

**Status: STATIC CODE REVIEW / REMEDIATION REQUIRED.** This is a source review, not a penetration test or production assurance claim. Findings should be confirmed by the runtime suite, then independently reviewed.

## Assets and trust boundaries

- Assets: financial transaction history, user identity, category structure, session tokens, database credentials.
- Boundary 1: browser ↔ NestJS API via credentialed HTTP cookies.
- Boundary 2: NestJS authorization guard/service ↔ PostgreSQL rows.
- Boundary 3: future ERP/mobile/external clients ↔ versioned API (future trust model, not available yet).

| ID | Risk / observation | Preliminary severity | Proposed mitigation | Status |
|---|---|---|---|---|
| SEC-01 | Stateless JWT cookie is cleared on logout, but the server does not maintain a revocation list; a copied old token may remain usable until expiration | High | Server-side session store / token revocation and shorter lifetime; test replay post-logout | OPEN |
| SEC-02 | Login and registration endpoints have no implemented rate limit, account abuse prevention or brute-force monitoring | High | Per-IP + per-account throttling, monitoring, progressive delay; protect against DoS | OPEN |
| SEC-03 | Cookie SameSite=Lax plus Origin check helps, but no dedicated CSRF token/double-submit defense or full same-site subdomain threat model | Medium | Document trust model, consider CSRF token, validate origin/referer according to deployment | OPEN |
| SEC-04 | No production-grade audit log for account/financial modifications | Medium | Tamper-resistant audit trail with least-privilege access; avoid sensitive details | OPEN |
| SEC-05 | No automated dependency vulnerability scanner/SBOM in pipeline | Medium | Run `npm audit` and SCA checks in CI, prioritize exploitable findings | OPEN |
| SEC-06 | No demonstrated secret rotation, backup encryption, database TLS, recovery drill | High for production | Managed secret store, encrypted backup, tested restore, DB TLS in deployment | OPEN |
| SEC-07 | User-owned SQL operations include `user_id` filters and foreign-key constraints (positive observation) | Confirm at runtime | QA-005/006/010, DB integration assertions | NOT VERIFIED |
| SEC-08 | Frontend/backend origin is configurable; use of credentials requires strict allowed-origin policy | Deployment-specific | Restrict CORS, reject origins that aren't trusted, never use wildcard with credentials | REVIEW |
| SEC-09 | Financial GET responses lack explicit `Cache-Control: no-store` policy | Low/medium | Add no-store for sensitive data and assess proxy/CDN behaviors | OPEN |
| SEC-10 | Third-party integration lacks OAuth2/OIDC, scoped access tokens, consent, webhook signing and client registration | High if external clients are enabled now | Keep external clients disabled; add proper authorization before integrations | NOT IMPLEMENTED |

## Tests and attacks to verify (defensive only)

1. Anonymous requests to `/transactions`, `/categories` and analytics all return 401.
2. User B cannot PATCH or DELETE User A's transaction or category, nor aggregate User A's balances.
3. New registrations cannot inject arbitrary `user_id` or `admin` fields.
4. A category from a different user cannot be assigned to a transaction.
5. Wrong browser `Origin` is rejected for mutations.
6. Verify that the production cookie has `HttpOnly` and `Secure`; assess its SameSite mode.
7. Review CORS headers, access logs, cache headers, and error-message leakage.
8. Confirm logout token-replay behavior and close the finding before release.
9. Run rate-limit tests only after throttling is added, without stressing a shared environment.
10. Complete backup/restore verification in Step 5.

**Release rule:** HIGH findings must be fixed or formally risk-accepted with documented controls; a university demo may proceed only in an isolated non-production environment with clear limitations.
