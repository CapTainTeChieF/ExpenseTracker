# Step 6 — API Integration and Compatibility Guide

## Existing application contract

API base prefix `/api/v1`. Versioned REST design; JSON request/response. The frontend currently uses HttpOnly cookie `expense_session`; production authentication requires a same-origin proxy or deliberately configured same-site environment.

| Endpoint | Method(s) | Access |
|---|---|---|
| `/health` | GET | Public |
| `/auth/register`, `/auth/login` | POST | Public with rate limit |
| `/auth/logout` | POST | Authenticated; revokes DB session |
| `/auth/me` | GET | Authenticated |
| `/transactions` | GET, POST | Authenticated; user-owned |
| `/transactions/:id` | PATCH, DELETE | Authenticated; user-owned |
| `/categories` | GET, POST | Authenticated; user-owned |
| `/categories/:id` | PATCH, DELETE | Authenticated; user-owned |
| `/analytics/summary` | GET | Authenticated |
| `/analytics/monthly?month=YYYY-MM` | GET | Authenticated |
| `/analytics/trend?months=3|6|12&endMonth=YYYY-MM` | GET | Authenticated |

The example REST API is useful for integrating a **trusted, browser-based** client using the same identity/session model. It is **not yet an open partner API**. No OAuth 2.0 client credentials, scopes, external identity mapping, machine-to-machine API keys, webhooks, consent model or SDK are included. Do not redistribute session cookies or embed a logged-in browser session in third-party origins.

## Safe future integration strategy

1. Record business workflows and tenancy/consent requirements per partner app.
2. Select a trusted OIDC provider; define issuer, audience, client id, scopes, account mapping and revocation behavior.
3. Build a separate external API authentication guard with limited scopes. Keep user-scoped resource checks.
4. Define request rate limits, idempotency keys for create operations, pagination, webhook signature verification and API version support policy.
5. Create a separate sandbox/staging tenant for each external client; audit access and rotate credentials.
6. Publish OpenAPI specs from a controlled environment and a developer guide after review.

## Important constraints

- Financial amounts stored in PostgreSQL NUMERIC and exposed as string decimals.
- Currency is BDT only in implemented schema.
- Existing list queries have a 100-transaction limit and no cursor pagination.
- External third-party integration in production is **future scope**, not release-v1 acceptance.
