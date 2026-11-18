# Convenience script for WINDOWS PowerShell: local development only.
# Requires Node 24+, Docker Desktop/Compose, npm + Internet.
$ErrorActionPreference = 'Stop'
Set-Location (Resolve-Path (Join-Path $PSScriptRoot '..'))
function Run-Checked { param([string]$Command, [string[]]$Arguments)
  & $Command @Arguments
  if ($LASTEXITCODE -ne 0) { throw "$Command failed with exit code $LASTEXITCODE" }
}
if (!(Get-Command node -ErrorAction SilentlyContinue)) { throw 'Node.js is missing. Install Node 24+.' }
if (!(Get-Command docker -ErrorAction SilentlyContinue)) { throw 'Docker is missing. Install/start Docker Desktop.' }
if (!(Test-Path 'backend/.env')) {
  $secret = (& node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('hex'))")
  $template = Get-Content 'backend/.env.example' -Raw
  $template.Replace('REPLACE_WITH_A_LONG_RANDOM_SECRET_AT_LEAST_32_CHARACTERS',$secret) | Set-Content 'backend/.env' -Encoding utf8
  Write-Host 'Created backend/.env with a newly generated JWT secret.'
} else { Write-Host 'backend/.env exists; preserved without changes.' }
if (!(Test-Path 'frontend/.env')) { Copy-Item 'frontend/.env.example' 'frontend/.env' }
Run-Checked 'docker' @('compose','up','-d','--wait')
Push-Location backend
try {
  Run-Checked 'npm.cmd' @('install','--no-audit')
  Run-Checked 'npm.cmd' @('run','db:migrate')
  Run-Checked 'npm.cmd' @('run','test')
  Run-Checked 'npm.cmd' @('run','typecheck')
  Run-Checked 'npm.cmd' @('run','build')
} finally { Pop-Location }
Push-Location frontend
try {
  Run-Checked 'npm.cmd' @('install','--no-audit')
  Run-Checked 'npm.cmd' @('run','build')
} finally { Pop-Location }
Write-Host 'Setup complete. Start backend: cd backend; npm run start:dev'
Write-Host 'Then frontend in a second terminal: cd frontend; npm run dev'
