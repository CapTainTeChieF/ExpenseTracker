param(
  [Parameter(Mandatory=$true)][string]$BackupFile,
  [Parameter(Mandatory=$true)][string]$TargetUrl,
  [Parameter(Mandatory=$true)][string]$ConfirmStagingRestore
)
$ErrorActionPreference = 'Stop'
if ($ConfirmStagingRestore -cne 'RESTORE_TO_STAGING_ONLY') { throw 'Confirmation must be RESTORE_TO_STAGING_ONLY' }
# Deliberately require a staging marker in the DB name, plus an explicit operator confirmation.
$uri=[Uri]$TargetUrl
$dbName=$uri.AbsolutePath.TrimStart('/')
if ($dbName -notmatch '(^|_)staging($|_)|(^|_)qa($|_)') { throw 'Target database name must contain staging or qa; refusing production restore' }
if (-not (Test-Path $BackupFile)) { throw 'Backup file not found' }
if (-not (Get-Command pg_restore -ErrorAction SilentlyContinue)) { throw 'Install PostgreSQL client utilities and add pg_restore to PATH' }
Write-Host 'WARNING: target staging/QA database objects may be overwritten. Get operator approval before continuing.'
& pg_restore --dbname=$TargetUrl --no-owner --no-acl --exit-on-error --clean --if-exists $BackupFile
if ($LASTEXITCODE -ne 0) { throw 'Restore failed; review logs before continuing' }
Write-Host 'Restore completed. Verify application tables and test login/analytics with synthetic data.'
