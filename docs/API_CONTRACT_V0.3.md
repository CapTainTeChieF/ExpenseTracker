# Expense Tracker API - v0.3 Contract

Base URL: `http://localhost:4000/api/v1`. The UI uses a secure-flag-aware, HTTP-only `expense_session` cookie. Cookie auth is **not** a general purpose third-party OAuth token; use a trusted SSO/OAuth flow later.

## Analytics endpoints

| Method | URL | User-scoped response |
|---|---|---|
| GET | `/analytics/summary` | `{currency,income,expense,balance,transactionCount}` all-time totals |
| GET | `/analytics/monthly?month=2026-11` | totals + categories `{kind,name,total,count}` |
| GET | `/analytics/trend?months=6&endMonth=2026-11` | `{currency,endMonth,months:[{month,income,expense}]}` |

All monetary fields are decimal **strings** (not floats). All amounts are BDT. The `months` parameter is an integer from `1` to `12` (default `6`), and `endMonth` is `YYYY-MM` (defaults to server's current month). Months without transactions appear with `"0"` totals.

Example:
```http
GET /api/v1/analytics/trend?months=3&endMonth=2026-11
Cookie: expense_session=... (obtained from login)
```

```json
{
  "currency":"BDT",
  "endMonth":"2026-11",
  "months":[
    {"month":"2026-09","income":"0","expense":"0"},
    {"month":"2026-10","income":"1000.00","expense":"250.00"},
    {"month":"2026-11","income":"3000.00","expense":"500.00"}
  ]
}
```

Invalid `months` / `endMonth` produces HTTP 400. Unauthenticated requests receive HTTP 401. The API requires authentication on all analytics endpoints.

## Existing endpoint compatibility
No breaking changes to:
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /transactions` (filter month/kind/category), `POST /transactions`, `PATCH /transactions/:id`, `DELETE /transactions/:id`
- `GET /categories`, `POST /categories`, `PATCH /categories/:id`, `DELETE /categories/:id`
- `GET /analytics/summary`, `GET /analytics/monthly?month=YYYY-MM`
- `GET /health` (public)

## Swagger
- Dev UI: `http://localhost:4000/docs`
- Dev JSON: `http://localhost:4000/docs/openapi.json`
- Disabled by default in `NODE_ENV=production`. Do not expose a public API explorer in production without an authorization policy and review.
- Swagger Try-it-out requires a user session cookie originating from a successful login. OpenAPI documentation is **not** an SSO implementation.

## Security limitations
The service uses credentialed cookies. In deployment, review CORS, allowed origins, CSRF defenses, SameSite settings, frontend/backend site relationship, session lifecycle and scopes. Do not embed passwords or tokens in third-party web apps. Client APIs should use a vetted OIDC/OAuth provider instead of passing `expense_session` cookies.
