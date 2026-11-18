# Step 5 — Security Changes & Remaining Risks

## Implemented in release candidate (requires live tests)

- `auth_sessions` table for session revocation; JWT carries `sid`, every protected API request checks session status and expiry.
- `auth_rate_limits` database counters keyed by SHA-256(IP/account bucket). Registration: 6/IP/hour. Login: 20/IP/15-min and 10/account/15-min. Cleanup script deletes old rate limits and expired/revoked sessions after grace period.
- Production mutations require `Origin` matching configured `FRONTEND_ORIGIN`. Browser should use same-origin Vercel proxy; no wildcard CORS.
- Existing cookies are HttpOnly, Secure under production NODE_ENV and SameSite=Lax. Swagger remains off in production unless explicitly enabled.
- User-owned financial resources remain scoped in SQL by authenticated user ID.

## Required security validation before release

1. Verify logout then replay of copied cookie returns HTTP 401 (automated QA updated).
2. Run QA-016 login-rate-limit scenario, then verify rate limiting using separate IPs and the *real* reverse-proxy topology; ensure X-Forwarded-For cannot be spoofed.
3. Validate session expiration, concurrent sessions, idempotency/duplication of financial transactions and cookie behavior under same-origin proxy.
4. Perform CSRF threat review, authenticated API endpoint fuzzing, broken object level authorization testing and sensitivity/privacy logging review.
5. Enable security headers/TLS, secret rotation process, least-privilege DB user, dependency advisories scanning, and alerting/monitoring.
6. Verify high availability/load performance under expected user traffic; review staging proxy and cookies.

## Not yet implemented

- OAuth2/OIDC SSO and third-party API client permissions; do not share browser session cookies with external apps.
- Full immutable audit ledger, data retention/deletion policy, SOC alerting and managed monitoring system.
- Data export/deletion requests, regulatory assessment, full incident runbook and penetration-test sign-off.
- Predictive budget, receipt scanning and multi-currency functionality from future roadmap.

**Do not call this a security certification.** Changes are prepared in source and require real runtime verification.
