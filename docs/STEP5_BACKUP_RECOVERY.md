# Step 5 — PostgreSQL Backup and Recovery SOP

**Status:** scripts provided; no live backup or restore has been executed or verified in the current delivery.

## Backup plan

- Establish owner-approved **RPO/RTO**, encryption keys, retention, off-site storage and schedule before production. Example proposal only: daily logical dump + managed provider PITR as available, 30-day protected retention, monthly restore drill.
- PostgreSQL `pg_dump -Fc` produces a portable logical archive. `pg_restore` can restore it into a separate database. Logical dumps are not equivalent to physical continuous backups or PITR.
- Use least-privilege backup credentials; avoid exposing database URLs in terminals, logs, shell histories, tickets or ZIPs. Prefer managed secret stores.
- `pg_dump` consistency is supported under concurrent writes, but check application-specific restore consistency and backup coverage.

### Backup (PowerShell, PostgreSQL client utilities installed)

```powershell
# Supply a secret database URL securely from your environment, not as a typed literal in recorded commands.
$DatabaseUrl = $env:DATABASE_URL
.\scripts\ops\backup-postgres.ps1 -DatabaseUrl $DatabaseUrl -OutputDirectory .\backups
```

The script creates a timestamped `.dump` file and validates its TOC using `pg_restore --list`. It does not encrypt or upload the backup; the operator must use restricted encrypted storage. ZIP excludes `.dump` by default.

### Recovery drill (STAGING/QA ONLY)

1. Provision an empty disposable database with `staging` or `qa` in its name and restricted access.
2. Obtain explicit reviewer approval to overwrite staging objects.
3. Use `restore-staging.ps1` with the backup and staging-only confirmation phrase.
4. Run a post-restore checklist: login with controlled test account, transaction counts, category relationships, analytics totals and `schema_migrations` consistency. Ensure sensitive restored production records are never exposed to general QA users.
5. Record backup file hash, time, restored target, duration, errors, data checks and reviewer sign-off. Delete temporary restores safely according to policy.

```powershell
.\scripts\ops\restore-staging.ps1 -BackupFile .\backups\SAMPLE.dump `
  -TargetUrl $env:STAGING_DATABASE_URL `
  -ConfirmStagingRestore RESTORE_TO_STAGING_ONLY
```

**Guardrails:** restore script rejects a target whose DB name lacks `staging`/`qa`; do not treat this as a replacement for human approval. Never point it at production. It uses `--clean --if-exists` and can destroy data inside the approved staging database.

## Operational log template

| Field | Actual evidence (operator to fill) |
|---|---|
| Backup timestamp / UTC | PENDING |
| Backup destination / encryption | PENDING |
| Backup SHA256 | PENDING |
| Restored into | PENDING |
| Restore outcome | PENDING |
| Financial reconciliation | PENDING |
| RPO / RTO achievement | NOT MEASURED |
| Reviewer / date | PENDING |

Reference: https://www.postgresql.org/docs/17/app-pgdump.html and https://www.postgresql.org/docs/17/app-pgrestore.html
