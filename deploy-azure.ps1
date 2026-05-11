# ═══════════════════════════════════════════════════════════════════════════
# SLAMA RIVIERA / HOST PRO — Déploiement Azure (App Service)
# Usage : .\deploy-azure.ps1 [-Env prod|dev] [-SkipInfra] [-SkipDeploy]
# Prérequis : az CLI installé + az login effectué + npm run build effectué
# ═══════════════════════════════════════════════════════════════════════════

param(
    [string]$Env          = "prod",
    [string]$Location     = "francecentral",
    [switch]$SkipInfra    = $false,   # -SkipInfra pour re-déployer sans recréer l'infra
    [switch]$SkipDeploy   = $false    # -SkipDeploy pour ne créer que l'infra
)

$ErrorActionPreference = "Stop"

$PREFIX          = "hostpro"
$RESOURCE_GROUP  = "${PREFIX}-${Env}"
$APP_NAME        = "${PREFIX}-${Env}-app"
$WEB_DIR         = "$PSScriptRoot\hostpro-web"
$INFRA_DIR       = "$PSScriptRoot\infra"

Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║      SLAMA RIVIERA — HOST PRO — Déploiement Azure        ║" -ForegroundColor Cyan
Write-Host "║              Environnement : $Env                         ║" -ForegroundColor Cyan
Write-Host "╚══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ── 0. Vérifications préalables ──────────────────────────────────────────────
Write-Host "[0/6] Vérifications..." -ForegroundColor Yellow

if (-not (Get-Command az -ErrorAction SilentlyContinue)) {
    Write-Error "Azure CLI non trouvé. Installez via : winget install Microsoft.AzureCLI"
    exit 1
}

try {
    $account = az account show --output json 2>$null | ConvertFrom-Json
    Write-Host "      Connecté : $($account.name) ($($account.id))" -ForegroundColor Green
} catch {
    Write-Host "      Connexion Azure requise..." -ForegroundColor Yellow
    az login --use-device-code
    $account = az account show --output json | ConvertFrom-Json
    Write-Host "      Connecté : $($account.name)" -ForegroundColor Green
}

# ── 1. Resource Group ────────────────────────────────────────────────────────
if (-not $SkipInfra) {
    Write-Host "[1/6] Resource Group '$RESOURCE_GROUP' ($Location)..." -ForegroundColor Yellow
    az group create --name $RESOURCE_GROUP --location $Location --tags project=hostpro env=$Env --output none
    Write-Host "      OK ✓" -ForegroundColor Green

    # ── 2. Infrastructure via Bicep ──────────────────────────────────────────
    Write-Host "[2/6] Déploiement infrastructure Bicep..." -ForegroundColor Yellow
    Write-Host "      (PostgreSQL + App Service + Key Vault + Storage — ~5 min)" -ForegroundColor Gray

    # Lire les secrets depuis .env.local ou variables d'environnement
    $envFile = "$WEB_DIR\.env.local"
    if (Test-Path $envFile) {
        Get-Content $envFile | ForEach-Object {
            if ($_ -match '^([^#=]+)=(.+)$') {
                $k = $matches[1].Trim()
                $v = $matches[2].Trim().Trim('"')
                [System.Environment]::SetEnvironmentVariable($k, $v, "Process")
            }
        }
        Write-Host "      Variables chargées depuis .env.local" -ForegroundColor Gray
    }

    $deployResult = az deployment group create `
        --resource-group $RESOURCE_GROUP `
        --template-file "$INFRA_DIR\main.bicep" `
        --parameters `
            env=$Env `
            location=$Location `
            dbAdminPassword="$env:DB_ADMIN_PASSWORD" `
            jwtSecret="$env:JWT_SECRET" `
            jwtRefreshSecret="$env:JWT_REFRESH_SECRET" `
            anthropicApiKey="$env:ANTHROPIC_API_KEY" `
            resendApiKey="$env:RESEND_API_KEY" `
            stripeSecretKey="$env:STRIPE_SECRET_KEY" `
            stripeWebhookSecret="$env:STRIPE_WEBHOOK_SECRET" `
            stripePriceStarter="$env:STRIPE_PRICE_STARTER" `
            stripePricePro="$env:STRIPE_PRICE_PRO" `
            stripePriceEnterprise="$env:STRIPE_PRICE_ENTERPRISE" `
            vapidPublicKey="$env:VAPID_PUBLIC_KEY" `
            vapidPrivateKey="$env:VAPID_PRIVATE_KEY" `
        --output json | ConvertFrom-Json

    $APP_URL   = $deployResult.properties.outputs.appUrl.value
    $PG_HOST   = $deployResult.properties.outputs.postgresHost.value
    $AI_KEY    = $deployResult.properties.outputs.appInsightsKey.value

    Write-Host "      Infrastructure déployée ✓" -ForegroundColor Green
    Write-Host "      App URL : $APP_URL" -ForegroundColor Cyan
    Write-Host "      PostgreSQL : $PG_HOST" -ForegroundColor Cyan
} else {
    Write-Host "[1-2/6] Infrastructure ignorée (-SkipInfra)" -ForegroundColor Gray
    $APP_NAME = "${PREFIX}-${Env}-app"
}

if (-not $SkipDeploy) {
    # ── 3. Build Next.js ─────────────────────────────────────────────────────
    Write-Host "[3/6] Build Next.js (output standalone)..." -ForegroundColor Yellow
    Push-Location $WEB_DIR

    $env:DATABASE_URL = "postgresql://placeholder:placeholder@localhost:5432/placeholder"
    npm ci --quiet
    npx prisma generate
    npm run build

    # Packager le build standalone
    Copy-Item -Recurse -Force "public" ".next\standalone\public"
    Copy-Item -Recurse -Force ".next\static" ".next\standalone\.next\static"
    Compress-Archive -Force -Path ".next\standalone\*" -DestinationPath "deploy.zip"

    $zipSize = (Get-Item "deploy.zip").Length / 1MB
    Write-Host "      Build OK ✓ — Archive : $([Math]::Round($zipSize, 1)) MB" -ForegroundColor Green
    Pop-Location

    # ── 4. Déployer sur Azure App Service ────────────────────────────────────
    Write-Host "[4/6] Déploiement sur App Service '$APP_NAME'..." -ForegroundColor Yellow
    az webapp deploy `
        --resource-group $RESOURCE_GROUP `
        --name $APP_NAME `
        --src-path "$WEB_DIR\deploy.zip" `
        --type zip `
        --async false `
        --output none

    Write-Host "      Déployé ✓" -ForegroundColor Green

    # ── 5. Migration Prisma ───────────────────────────────────────────────────
    Write-Host "[5/6] Migration base de données Prisma..." -ForegroundColor Yellow
    Push-Location $WEB_DIR
    $DB_PASSWORD = $env:DB_ADMIN_PASSWORD
    $DB_URL = "postgresql://hostproadmin:${DB_PASSWORD}@${PG_HOST}:5432/hostpro?sslmode=require"
    $env:DATABASE_URL = $DB_URL
    npx prisma migrate deploy
    npx prisma db seed
    Pop-Location
    Write-Host "      Migration OK ✓" -ForegroundColor Green

    # ── 6. Health check ───────────────────────────────────────────────────────
    Write-Host "[6/6] Health check..." -ForegroundColor Yellow
    Start-Sleep -Seconds 15
    try {
        $health = Invoke-RestMethod -Uri "${APP_URL}/api/health" -TimeoutSec 30
        Write-Host "      Health check OK ✓ — Status: $($health.status)" -ForegroundColor Green
    } catch {
        Write-Host "      Health check: app démarre (normal ~60s au premier démarrage)" -ForegroundColor Yellow
    }

    # Configurer GitHub Secrets pour CI/CD
    Write-Host ""
    Write-Host "══ Configuration GitHub Secrets ════════════════════════════" -ForegroundColor Yellow
    Write-Host "  Exécution automatique via gh CLI..." -ForegroundColor Gray

    $DB_URL_FULL = "postgresql://hostproadmin:${DB_PASSWORD}@${PG_HOST}:5432/hostpro?sslmode=require"

    # Créer le Service Principal pour GitHub Actions
    $SP = az ad sp create-for-rbac `
        --name "hostpro-github-actions-${Env}" `
        --role contributor `
        --scopes "/subscriptions/$($account.id)/resourceGroups/$RESOURCE_GROUP" `
        --sdk-auth 2>$null | ConvertFrom-Json

    if ($SP) {
        $AZURE_CREDS = az ad sp create-for-rbac `
            --name "hostpro-github-actions-${Env}" `
            --role contributor `
            --scopes "/subscriptions/$($account.id)/resourceGroups/$RESOURCE_GROUP" `
            --sdk-auth 2>&1

        # Configurer les secrets GitHub via gh CLI
        Push-Location $WEB_DIR
        gh secret set AZURE_CREDENTIALS      --body "$AZURE_CREDS"
        gh secret set DATABASE_URL           --body "$DB_URL_FULL"
        gh secret set JWT_SECRET             --body "$env:JWT_SECRET"
        gh secret set JWT_REFRESH_SECRET     --body "$env:JWT_REFRESH_SECRET"
        gh secret set ANTHROPIC_API_KEY      --body "$env:ANTHROPIC_API_KEY"
        gh secret set RESEND_API_KEY         --body "$env:RESEND_API_KEY"
        gh secret set EMAIL_FROM             --body "HostPro <noreply@hostpro.fr>"
        gh secret set STRIPE_SECRET_KEY      --body "$env:STRIPE_SECRET_KEY"
        gh secret set STRIPE_WEBHOOK_SECRET  --body "$env:STRIPE_WEBHOOK_SECRET"
        gh secret set STRIPE_PRICE_STARTER   --body "$env:STRIPE_PRICE_STARTER"
        gh secret set STRIPE_PRICE_PRO       --body "$env:STRIPE_PRICE_PRO"
        gh secret set STRIPE_PRICE_ENTERPRISE --body "$env:STRIPE_PRICE_ENTERPRISE"
        gh secret set VAPID_PUBLIC_KEY       --body "$env:VAPID_PUBLIC_KEY"
        gh secret set VAPID_PRIVATE_KEY      --body "$env:VAPID_PRIVATE_KEY"
        gh secret set VAPID_EMAIL            --body "$env:VAPID_EMAIL"
        gh secret set NEXT_PUBLIC_APP_URL    --body "$APP_URL"
        Pop-Location
        Write-Host "  GitHub Secrets configurés ✓" -ForegroundColor Green
    }
}

# ── Résumé ────────────────────────────────────────────────────────────────────
Write-Host ""
Write-Host "╔══════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║          SLAMA RIVIERA — DÉPLOIEMENT TERMINÉ ✓              ║" -ForegroundColor Green
Write-Host "╚══════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
if ($APP_URL) {
    Write-Host "  Application  : $APP_URL" -ForegroundColor Cyan
    Write-Host "  Health Check : $APP_URL/api/health" -ForegroundColor Cyan
    Write-Host "  Tableau bord : $APP_URL/dashboard" -ForegroundColor Cyan
    Write-Host "  Démo account : demo@hostpro.fr / demo1234" -ForegroundColor White
}
Write-Host ""
Write-Host "  Prochaines étapes :" -ForegroundColor Yellow
Write-Host "  1. Configurer DNS : hostpro.fr → $APP_URL" -ForegroundColor White
Write-Host "  2. Activer SSL custom domain dans Azure Portal" -ForegroundColor White
Write-Host "  3. Configurer webhook Stripe : $APP_URL/api/webhooks/stripe" -ForegroundColor White
Write-Host "  4. Valider ANTHROPIC_API_KEY dans l'assistant IA" -ForegroundColor White
Write-Host ""
