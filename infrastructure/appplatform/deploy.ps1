# ============================================================
#  Pastoralist Knowledge Hub — App Platform Deploy Script
#  Run from PowerShell in the project root folder
#  Usage: .\infrastructure\appplatform\deploy.ps1
# ============================================================

$ErrorActionPreference = "Stop"

function Write-Info  { param($msg) Write-Host "[INFO]  $msg" -ForegroundColor Green }
function Write-Warn  { param($msg) Write-Host "[NOTE]  $msg" -ForegroundColor Yellow }
function Write-Section { param($msg) Write-Host "`n━━━ $msg ━━━" -ForegroundColor Cyan }

Write-Host @"

  ██████╗ ██╗██╗  ██╗    ██╗  ██╗██╗   ██╗██████╗ 
  ██╔══██╗██║██║ ██╔╝    ██║  ██║██║   ██║██╔══██╗
  ██████╔╝██║█████╔╝     ███████║██║   ██║██████╔╝
  ██╔═══╝ ██║██╔═██╗     ██╔══██║██║   ██║██╔══██╗
  ██║     ██║██║  ██╗    ██║  ██║╚██████╔╝██████╔╝
  ╚═╝     ╚═╝╚═╝  ╚═╝    ╚═╝  ╚═╝ ╚═════╝ ╚═════╝ 
  Pastoralist Indigenous Knowledge Hub — Deploying...

"@ -ForegroundColor Green

# ── Step 1: Check doctl ───────────────────────────────────────
Write-Section "Step 1: Checking doctl"
try {
    $account = doctl account get --format Email --no-header
    Write-Info "Authenticated as: $account"
} catch {
    Write-Host "[ERROR] doctl not authenticated. Run: doctl auth init" -ForegroundColor Red
    exit 1
}

# ── Step 2: Create Spaces bucket for media ────────────────────
Write-Section "Step 2: Setting up DO Spaces for media storage"
Write-Warn "You need a Spaces access key. Get one at:"
Write-Warn "https://cloud.digitalocean.com/spaces -> Manage Keys -> Generate New Key"
Write-Host ""
$SPACES_KEY    = Read-Host "Paste your Spaces KEY"
$SPACES_SECRET = Read-Host "Paste your Spaces SECRET"

Write-Info "Spaces credentials saved. You will add these to App Platform in Step 4."

# ── Step 3: Create the App ────────────────────────────────────
Write-Section "Step 3: Creating App Platform application"

$appSpecPath = "infrastructure\appplatform\app.yaml"

if (-not (Test-Path $appSpecPath)) {
    Write-Host "[ERROR] app.yaml not found at $appSpecPath" -ForegroundColor Red
    exit 1
}

Write-Info "Creating app from spec..."
try {
    $appOutput = doctl apps create --spec $appSpecPath --format ID --no-header
    $APP_ID = $appOutput.Trim()
    Write-Info "App created! ID: $APP_ID"
} catch {
    Write-Warn "App may already exist. Listing your apps..."
    doctl apps list
    $APP_ID = Read-Host "Enter your existing App ID from the list above"
}

# ── Step 4: Set secrets ───────────────────────────────────────
Write-Section "Step 4: Setting secret environment variables"

# Generate JWT secrets
$JWT_SECRET         = -join ((1..48) | ForEach-Object { [char](Get-Random -Min 65 -Max 90) })
$JWT_REFRESH_SECRET = -join ((1..48) | ForEach-Object { [char](Get-Random -Min 65 -Max 90) })

Write-Info "Setting JWT secrets..."
doctl apps update $APP_ID --spec $appSpecPath | Out-Null

Write-Warn "Now set these secrets manually in the App Platform dashboard:"
Write-Host ""
Write-Host "  1. Go to: https://cloud.digitalocean.com/apps/$APP_ID/settings" -ForegroundColor White
Write-Host "  2. Click on the 'backend' component" -ForegroundColor White
Write-Host "  3. Click 'Environment Variables'" -ForegroundColor White
Write-Host "  4. Add these secret values:" -ForegroundColor White
Write-Host ""
Write-Host "     JWT_SECRET         = $JWT_SECRET" -ForegroundColor Yellow
Write-Host "     JWT_REFRESH_SECRET = $JWT_REFRESH_SECRET" -ForegroundColor Yellow
Write-Host "     DO_SPACES_KEY      = $SPACES_KEY" -ForegroundColor Yellow
Write-Host "     DO_SPACES_SECRET   = $SPACES_SECRET" -ForegroundColor Yellow
Write-Host ""
Read-Host "Press Enter once you have added those secrets in the dashboard"

# ── Step 5: Watch deployment ──────────────────────────────────
Write-Section "Step 5: Watching deployment progress"
Write-Info "App is deploying... (this takes 3-5 minutes)"
Write-Warn "You can also watch live at: https://cloud.digitalocean.com/apps/$APP_ID"

$maxWait = 30
$i = 0
do {
    Start-Sleep -Seconds 15
    $status = doctl apps get $APP_ID --format ActiveDeployment.Phase --no-header
    Write-Info "Status: $status (check $i of $maxWait)"
    $i++
} while ($status -notmatch "ACTIVE|ERROR" -and $i -lt $maxWait)

# ── Step 6: Run migrations ────────────────────────────────────
Write-Section "Step 6: Running database migrations"
Write-Info "Triggering migration run via App Platform console..."
Write-Warn "Go to: https://cloud.digitalocean.com/apps/$APP_ID"
Write-Warn "Click: backend component -> Console tab"
Write-Warn "Run:   npx prisma migrate deploy && npm run seed"
Write-Host ""

# ── Step 7: Summary ──────────────────────────────────────────
Write-Section "Deployment Complete!"

$appUrl = doctl apps get $APP_ID --format LiveURL --no-header
Write-Host ""
Write-Info "Your app is live at: $appUrl"
Write-Host ""
Write-Host "  Frontend : $appUrl" -ForegroundColor Green
Write-Host "  API Docs : $appUrl/api/docs (via backend component)" -ForegroundColor Green
Write-Host "  Dashboard: https://cloud.digitalocean.com/apps/$APP_ID" -ForegroundColor Green
Write-Host ""
Write-Warn "Next step — push your code to GitHub and every push to 'main' will auto-deploy:"
Write-Host "  cd $PWD" -ForegroundColor White
Write-Host "  git push origin main" -ForegroundColor White
Write-Host ""
Write-Host "Done! 🌍 Pastoralist Knowledge Hub is live." -ForegroundColor Green
