# REST API Contract — Expense Tracker v0.2 (Development)

Base: `http://localhost:4000/api/v1`  
Auth: HTTP-only `expense_session` cookie obtained via `/auth/login` or `/auth/register`.  
Each protected endpoint operates **only** on the caller's own data.

## Category CRUD

### GET /categories
Returns `[{"id":"uuid","name":"Food","kind":"EXPENSE"}]`.

### POST /categories
Body: `{"name":"Books", "kind":"EXPENSE"}`. Response: created category.

### PATCH /categories/:id
Body: `{"name":"Study Books"}`. The type is immutable. Response: renamed category.

### DELETE /categories/:id
Returns `{"deleted":true}`. Rejects when category is linked to a transaction (`409 Conflict`), or not owned (`404`).

Validation: Category name after whitespace normalization must contain 2–60 characters. `kind` must be `INCOME` or `EXPENSE`; duplicate names within the same user/type are case-insensitively prohibited by DB unique index.

## Analytics

### GET /analytics/summary
All-time financial totals. Existing v0.1 response is preserved:
```json
{"currency":"BDT","income":"1000.00","expense":"250.00","balance":"750.00","transactionCount":2}
```

### GET /analytics/monthly?month=2026-11
Required `month`: `YYYY-MM`.
```json
{
  "month": "2026-11", "currency": "BDT",
  "income": "1000.00", "expense": "250.00", "balance": "750.00",
  "transactionCount": 2,
  "categories": [{"kind":"EXPENSE","name":"Food","total":"250.00","count":1}]
}
```
The SQL date interval is `[month-01, next-month-01)` using `DATE` values (no timezone conversion).

## Transaction Filtering

### GET /transactions
Returns up to **100** own transactions, sorted latest first. Response remains an array (v0.1 compatible).

### GET /transactions?month=2026-11&kind=EXPENSE&categoryId=<uuid>
All filters optional. `month` format must be `YYYY-MM`, `kind` must be one of `INCOME`/`EXPENSE`, `categoryId` UUID. Invalid query returns 400. `user_id` is never client-supplied.

## Error behavior
- 400: Invalid DTO, Invalid Category relation, malformed Month.
- 401: Not logged in or expired session.
- 404: Category/Transaction does not belong to caller or does not exist.
- 409: Duplicate Category or Delete of used Category.

## Current limitations
- Cookie session is intended for local same-site development. External OAuth2/OIDC is a future enhancement.
- Pagination has not been introduced to preserve v0.1 response shape.
- API docs are handwritten for iteration 2; automated Swagger generation planned for iteration 3.
