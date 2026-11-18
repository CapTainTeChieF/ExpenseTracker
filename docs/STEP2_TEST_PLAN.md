# Iteration 2 — Acceptance and Regression Test Plan

| ID | Test | Expected Result |
|---|---|---|
| TC-CAT-01 | Login → POST category `{name:'Books',kind:'EXPENSE'}` | Category appears in list/selector |
| TC-CAT-02 | POST `books` for same owner/kind | HTTP 409 on case-insensitive duplicate |
| TC-CAT-03 | Rename own category, then list | New name returned; type unchanged |
| TC-CAT-04 | Delete category in use | HTTP 409; transaction still exists |
| TC-CAT-05 | Delete unused category | `{deleted:true}` |
| TC-SEC-02 | User B PATCH/DELETE User A category ID | HTTP 404; no mutation |
| TC-ANA-02 | 1000 income and 250 expense in a chosen month | Income 1000, Expense 250, Balance 750 |
| TC-ANA-03 | Change month with no transactions | Zero totals, empty breakdown |
| TC-ANA-04 | Add 101+ transactions in selected month | Monthly summary includes all, list caps at 100 |
| TC-TRX-02 | Filter GET transactions by kind/month | Only matching user records |
| TC-TRX-03 | Edit transaction, clear category with `null` | Category becomes Uncategorized |
| TC-MIG-01 | Apply migration twice | Second run safely skips applied files |
| TC-PERF-01 | Timed save-to-visible-balance update | ≤2s under documented test conditions (not yet measured) |

Local automated tests:
```powershell
cd backend
npm run test
npm run typecheck
npm run build
cd ../frontend
npm run build
```

**Evidence expected:** Actual command outputs, dated screenshots, resolved issues, and stakeholder approval.

**Status:** Not yet executed against the user's Windows/PostgreSQL environment.
