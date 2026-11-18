# Verification & Test Plan — Step 1

## Manual smoke test
1. Run Postgres, migration, backend and frontend per README.
2. Open http://localhost:4000/api/v1/health → `{status:'ok', database:'connected'}`.
3. Open http://localhost:5173; register with strong password.
4. Add INCOME 1000.00, then EXPENSE 250.00; expected balance BDT 750.00.
5. Reload: records still visible.
6. Edit expense to 300.00; balance should be 700.00.
7. Delete expense; balance 1000.00.
8. Log out; direct GET /api/v1/transactions (no cookie) should return HTTP 401.
9. Register second user; user 1 transactions must not be visible.
10. Try PATCH/DELETE user 1 transaction using user 2 session; should be HTTP 404.
11. Repeat with incorrect/negative amount; input should be rejected.

## Automated tests to add next
- DB rollback integration test for user + category registration.
- API ownership tests for all mutation methods.
- Dashboard refresh performance measured under agreed test dataset/network.
- Error handling/retry tests, rate limiting and adversarial CSRF checks.

## Acceptance
A test only counts as PASSED if executed and recorded, not merely because source code exists.
