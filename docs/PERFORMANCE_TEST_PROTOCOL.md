# Step 4 — Performance Test Protocol for the 2-Second Requirement

**Proposal NFR:** dashboard analytics must reflect a new database entry within 2 seconds. This has not been measured against a production-like dataset.

## Measurement definitions

- **API benchmark (automated, indicative only):** from HTTP transaction POST start through HTTP 2xx commit response and refreshed analytics GET response. Recorded by QA-015 over ten tiny isolated QA samples. Measures local API path, **not** visual paint and not server-only commit latency.
- **Real requirement (manual acceptance):** from confirmed transaction commit (HTTP POST response timing) to the updated monthly balance becoming visibly rendered in the browser. Record video or browser performance marks with wall-clock precision and correlate the API response.
- **Target gate:** each of the agreed acceptance trials <= **2,000 ms** on the defined target environment. Report all outliers, median (P50), 95th percentile (P95) and maximum. P95 alone does not prove every individual trial satisfies the stated requirement.

## Reproducible manual test

1. Use a dedicated test DB and non-production user; do not run against personal financial records.
2. Record host CPU/RAM, PostgreSQL version, browser/device, OS, network type and dataset size.
3. Populate a realistic fixture such as **10,000 transactions for one user** across 12 months. Use a dedicated seeding script reviewed for safety; **do not** seed or modify production data.
4. Log in and select an active month. Warm the dashboard with five non-measured navigations.
5. For 30 repetitions, create distinct valid transactions and capture: (a) POST response/commit time; (b) new balance rendered; (c) total elapsed milliseconds.
6. Repeat on a mobile viewport; assess accessibility and responsiveness separately.
7. Record P50, P95, maximum, failure count, endpoint response times, DB query plan for slow aggregations.
8. Investigate any >2,000ms result. Index, query-plan, caching and network changes require regression testing.

| Trial | Dataset count | Device/network | API create+fetch ms | Commit-to-UI ms | Pass <=2s | Evidence |
|---|---|---|---|---|---|---|
| 1-30 | TODO | TODO | TODO | TODO | NOT RUN | TODO |

## Exit criteria

- [ ] 30 valid measurements and raw timing data attached
- [ ] Device/host/network/dataset documented
- [ ] Every acceptance trial meets the 2-second target or a specific exception is approved
- [ ] No incorrect balance or stale chart after a successful mutation
- [ ] Additional load and concurrency tests performed where future scale requires them
