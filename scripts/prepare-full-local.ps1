# Local one-command Docker demo setup. HTTP only on localhost:8080.
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))
if (!(Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker Desktop required.' }
if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js required to generate a secure local secret.' }
if (!(Test-Path '.env')) {
  $secret = (& node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))")
  "LOCAL_DEMO_JWT_SECRET=$secret" | Set-Content '.env' -Encoding ascii
  Write-Host 'Generated root .env for local Docker demo (never commit it).'
}
& docker compose -f docker-compose.full.local.yml up -d --build --wait
if ($LASTEXITCODE -ne 0) { throw 'Docker full local stack failed: inspect docker compose logs' }
Write-Host 'Open http://localhost:8080 in your browser.'
Write-Host 'Stop without data loss: docker compose -f docker-compose.full.local.yml down'
