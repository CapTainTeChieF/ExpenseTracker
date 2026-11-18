param(
  [Parameter(Mandatory=$true)][string]$DatabaseUrl,
  [string]$OutputDirectory = "./backups"
)
$ErrorActionPreference = "Stop"
if (-not (Get-Command pg_dump -ErrorAction SilentlyContinue)) { throw "Install PostgreSQL client utilities and add pg_dump to PATH" }
New-Item -ItemType Directory -Force -Path $OutputDirectory | Out-Null
$time = Get-Date -Format "yyyyMMdd_HHmmss"
$dest = Join-Path (Resolve-Path $OutputDirectory) "expense_tracker_$time.dump"
& pg_dump --dbname=$DatabaseUrl --format=custom --no-owner --no-acl --file=$dest
if ($LASTEXITCODE -ne 0) { Remove-Item $dest -Force -ErrorAction SilentlyContinue; throw "pg_dump failed" }
& pg_restore --list $dest | Out-Null
if ($LASTEXITCODE -ne 0) { throw "Backup file verification failed" }
Write-Host "Created backup: $dest. Store encrypted with restricted access; test a restore separately."
