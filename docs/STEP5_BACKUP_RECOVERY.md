# Step 5 — PostgreSQL Backup and Recovery SOP

**Documentation baseline:** 2026-11-26 UTC, commit `98e0c51`.
**Status:** Release candidate previously deployed; backup/restore scripts exist, but actual scheduled backups, encrypted storage and successful restore drills have not been independently established. No backup, restore, migration or database access is performed by this documentation revision.

## 1. Objectives and proposed backup policy

RPO (recovery point objective) is the maximum acceptable data loss measured in time. RTO (recovery time objective) is the maximum acceptable service recovery duration. Actual achievement must be measured, not inferred from a backup schedule.

| Parameter | Proposed starting policy — not approved or implemented |
|---|---|
| RPO | 24 hours |
| RTO | 4 hours |
| Logical backup frequency | Daily and before significant migrations |
| Retention | 30 days, subject to privacy and owner review |
| Storage | Restricted, encrypted, independent of the database host; protect encryption keys separately |
| Recovery drill | Monthly and after significant schema/hosting changes |
| Managed recovery | Assess provider backups/PITR according to actual plan and verify recovery coverage |
| Owner and escalation | Project owner to confirm responsibility, schedule and failure alert handling |

Confirm the actual Render database identity, plan, expiry, storage, version, access restrictions and recovery features privately. Long-term database hosting remains a maintenance priority. Do not rely on the host's availability or assume a provider snapshot/PITR service exists without verification. Daily successful copies can support a 24-hour RPO, but missed or corrupt backups can exceed it. Logical archives are not continuous WAL/PITR and do not independently cover cluster roles, provider configuration, secrets or application deployment artifacts.

## 2. Existing tooling and limitations

| Capability | Source / status |
|---|---|
| Logical dump | [backup-postgres.ps1](../scripts/ops/backup-postgres.ps1) uses `pg_dump --format=custom --no-owner --no-acl` |
| Archive structure check | Script invokes `pg_restore --list`; not a restore or full data-integrity test |
| Staging restore | [restore-staging.ps1](../scripts/ops/restore-staging.ps1) uses `--exit-on-error --clean --if-exists --no-owner --no-acl` |
| Staging guard | Exact confirmation phrase plus DB-name marker `qa` or `staging` at underscore/name boundaries; not proof of target identity |
| Git exclusions | [`.gitignore`](../.gitignore) excludes `backups/`, `*.dump`, `*.backup`, `*.sql.gz` and env files; not a substitute for restricted storage |
| Scheduling/encryption/off-site upload | Not implemented by these scripts; operator responsibility |
| Restore atomicity | No `--single-transaction`; a failure can leave a partially restored target |
| Secret handling | Existing scripts pass connection URLs in child process arguments; local process visibility risk, even when using environment variables |

The dump omits ownership and ACLs. Recreate appropriate permissions and verify least privilege in the restored environment. Archive listing alone is insufficient. The backup script removes an incomplete dump on `pg_dump` failure, but a failed listing can leave an unusable file; mark it invalid and do not count it as a backup. Timestamps use local time in filenames; record actual UTC start/end in the operational log. Do not run concurrent copies into the same timestamped filename. Review compatible PostgreSQL client/server versions and available storage before use.

**Security note:** the existing URL-based scripts are suitable only after a trusted operator reviews credential handling and target identity. Prefer a reviewed libpq service/password-file or managed authentication approach that avoids password-bearing command-line arguments for routine sensitive-data backups; that script hardening is separate maintenance. Do not show secrets or paste live URLs into chat, tickets, terminals being recorded, shell history or Git. Avoid printing environment variables. Use synthetic data for initial rehearsals.

## 3. Backup procedure (operator-controlled, not yet verified)

1. Obtain owner authorization and identify the source database privately. Start with an isolated QA database and synthetic data. Confirm the correct database name/host, access scope, TLS and PostgreSQL client compatibility (`pg_dump --version`, `pg_restore --version`). Confirm both utilities are available.
2. Select a restricted encrypted storage location outside the repository; ensure adequate space and no automatic public sync/sharing. Existing script does not encrypt archives. Treat dumps as sensitive, including account/password-hash and session/rate-limit records. Do not expose archives to general QA users.
3. For an approved rehearsal on a trusted Windows operator machine, provide the authorized connection configuration securely in the environment. The example assumes `DATABASE_URL` already identifies the approved source and a restricted encrypted directory already exists. Do not execute this example if those conditions or the credential exposure risk are unresolved.

```powershell
# Example procedure only: confirm approved isolated source and secure destination first.
$BackupDirectory = 'D:\RestrictedBackups\ExpenseTracker'
.\scripts\ops\backup-postgres.ps1 -DatabaseUrl $env:DATABASE_URL -OutputDirectory $BackupDirectory
```

4. Check exit status, script outcome and archive listing. Compute SHA-256 for the completed archive and record UTC timestamps, source identifier (nonsecret), file size, hash, client/server versions and operator. Example hash command after identifying the correct completed file:

```powershell
Get-FileHash -Algorithm SHA256 -LiteralPath 'D:\RestrictedBackups\ExpenseTracker\APPROVED_FILE.dump'
```

5. Secure an independent encrypted copy and verify hash on retrieval. Restrict access and protect keys; test that authorized recovery operators can access them. Record the backup destination without credentials. Check retention only after verified recoverable copies exist; never remove the sole valid backup.
6. Record errors and alert the owner on missed/failed backups. A successful listing and hash demonstrate file structure/identity checks, not a successful restore. Schedule and test recovery as below. Backup execution, timing and encryption are not claimed complete here.

## 4. Recovery drill — staging/QA only

**Warning: the existing restore script can DROP and replace database objects in its target. It is not atomic. Never point it at production or any valuable existing database.** A naming guard is not a safety guarantee. Initial drill must use a disposable, empty, isolated database and a synthetic-data archive.

1. Obtain explicit reviewer authorization for the exact disposable target. Confirm host, database name, account and isolation from production independently. Keep application endpoints separated, restrict access and avoid any production credentials. If the archive includes private production data, require additional owner/privacy authorization and an access-restricted recovery environment; prefer synthetic data for academic verification.
2. Verify source archive identity/hash, provenance, client compatibility and intended recovery point. Record target identity and initial state privately. Ensure the target contains no valuable data; establish a clean replacement plan if the drill fails.
3. Only after these checks, run the staging script using a securely configured `STAGING_DATABASE_URL` and the reviewed archive. This example is intentionally not an instruction to execute during documentation work.

```powershell
# DESTRUCTIVE to the approved disposable staging/QA target only.
.\scripts\ops\restore-staging.ps1 `
  -BackupFile 'D:\RestrictedBackups\ExpenseTracker\APPROVED_FILE.dump' `
  -TargetUrl $env:STAGING_DATABASE_URL `
  -ConfirmStagingRestore RESTORE_TO_STAGING_ONLY
```

4. On failure: stop, preserve sanitized logs, mark the target invalid and investigate. Do not use partially restored data. Obtain authorization to provision a fresh disposable target for retry; do not repeatedly overwrite an unknown target.
5. On success: run the reconciliation checklist below before declaring a restore drill passed. Record elapsed time, errors and approvals. Dispose of temporary copies only according to approved privacy/retention policy after evidence is captured. No production cutover is part of a rehearsal.

### Reconciliation checklist

| Verification | Expected evidence |
|---|---|
| Archive integrity | Hash matches recorded archive; restore completed with no unreviewed errors |
| Schema | Five application tables and `schema_migrations`; expected migrations, constraints and indexes present |
| Data | Compare source snapshot counts and expected fixture values for users, categories and transactions; no orphaned/foreign category references |
| Financial reconciliation | Per-test-user income, expense, balance and category/month totals match the backup's reference snapshot, not a later live database state |
| Permissions | Correct application/migration permissions recreated; no unintended access or exposed secrets |
| Authentication | Synthetic test login, session behavior and cross-user isolation; do not reuse captured real cookies |
| Application | Health endpoint, synthetic record CRUD/analytics and deployment compatibility confirmed in isolated environment |
| Recovery objectives | Record actual data-loss window and full elapsed service-recovery time; compare with approved RPO/RTO |
| Reviewer | Evidence and actual decision signed by authorized reviewer |

## 5. Actual data incident / recovery decision

This is a proposed operator decision procedure, not an unattended production restore command. Stop or restrict writes under owner authorization where necessary. Preserve current state and incident evidence; establish incident timeline and last known good recoverable point. Quantify potential lost transactions and privacy impact. Review backup provenance and independently verify restore into a controlled replacement environment before considering production cutover. Require authorized owner approval, compatible application build, secure credentials and a rollback/cutover plan that avoids split writes. Coordinate session invalidation and credential rotation if incident scope requires them. Never invoke the staging restore script on production; restoring older data can remove later financial history. Record final reconciliation, RPO/RTO achieved and remaining risks.

## 6. Operational evidence log (not completed)

| Field | Actual evidence (operator to fill) |
|---|---|
| Owner / approved RPO/RTO / policy | PENDING |
| Backup timestamp start/end (UTC) / source identifier | PENDING |
| Client/server versions / archive size | PENDING |
| Backup SHA-256 / verification result | PENDING |
| Restricted encrypted destination / independent copy check | PENDING |
| Backup outcome / missed schedule alerts | PENDING |
| Restore approval / target / archive reference | PENDING |
| Restore timestamp / duration / outcome | PENDING |
| Schema, permissions and financial reconciliation | PENDING |
| Application verification / measured RPO and RTO | NOT MEASURED |
| Errors / corrective action / reviewer and date | PENDING |

Track these records in restricted evidence storage; publish only sanitized academic summaries. See [release gates](STEP5_RELEASE_GATES.md), [QA matrix](QA_TEST_MATRIX.md) (OPS-01 proposed evidence reference, NFR-05), and [deployment runbook](STEP5_DEPLOYMENT_RUNBOOK.md). Backup tooling is provided but NFR-05 remains pending.

PostgreSQL reference: [pg_dump](https://www.postgresql.org/docs/17/app-pgdump.html), [pg_restore](https://www.postgresql.org/docs/17/app-pgrestore.html). Match utility guidance to the actual installed database and client version.
