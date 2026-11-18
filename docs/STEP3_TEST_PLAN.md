# Iteration 3 - Test Plan and Evidence Worksheet

**Status:** Tests supplied; end-to-end execution results are not claimed. Run on your Windows machine, fill columns and keep evidence.

| ID | Test / actions | Expected | Actual | Pass/Fail | Evidence |
|---|---|---|---|---|---|
| TC-3-01 | `npm run test` (backend) | All tests pass | TODO | TBD | screenshot/log |
| TC-3-02 | `npm run typecheck`, `npm run build` backend | No errors | TODO | TBD | build log |
| TC-3-03 | `npm run build` frontend | Bundles render | TODO | TBD | build log |
| TC-3-04 | Register; add income 1000 and expense 250 in same selected month | monthly balance 750 | TODO | TBD | UI screenshot |
| TC-3-05 | Food expense 200 + Transport expense 50 | Pie values 200 and 50 | TODO | TBD | UI screenshot |
| TC-3-06 | Select 3, 6, 12 months | Bar count equals selection | TODO | TBD | chart screenshot |
| TC-3-07 | Fetch trend with no transactions in a month | `income` and `expense` both `"0"` | TODO | TBD | API JSON |
| TC-3-08 | `/analytics/trend?months=13` | HTTP 400 | TODO | TBD | API response |
| TC-3-09 | Fetch analytics without login | HTTP 401 | TODO | TBD | API response |
| TC-3-10 | User B signs in after User A data exists | Cannot view A data | TODO | TBD | test accounts |
| TC-3-11 | Update/delete expense from charted month | Chart and summary reflect new figures | TODO | TBD | screenshot |
| TC-3-12 | Visit `/docs` and `/docs/openapi.json` in development | Swagger UI and valid JSON | TODO | TBD | screenshot/JSON |
| TC-3-13 | Transaction rollback with forced DB failure | No partial/duplicate state | TODO | TBD | DB query |
| TC-3-14 | Dashboard refresh after insert | ≤ 2 seconds on defined environment | TODO | TBD | performance recording |
| TC-3-15 | Mobile 360px and desktop 1440px | No clipped controls/chart | TODO | TBD | screenshots |
| TC-3-16 | Cookies, CSRF, CORS, secrets, HTTPS, permissions | Security checklist complete | TODO | TBD | security report |

## Performance measurement definition
Measure **from successful server-side transaction commit to the dashboard displaying the new values**, for 30 trials. Capture P50/P95/max under a specified dataset size (e.g., 10,000 transactions/user), server and network. A promise of 2 seconds is a **target, not a verified achievement** in this package.

## Compatibility checks
- Browser UI still uses only `/api/v1` endpoints; no schema migration needed for v0.3.
- Previous Step 2 category and transaction scenarios must still pass.
- Verify Swagger generation does not accidentally publish sensitive data.

## Test evidence sign-off
- Developer: __________ Date: ________
- Reviewer: __________ Date: ________
- Outstanding defects: __________________________
