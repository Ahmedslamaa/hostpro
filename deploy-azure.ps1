# ============================================================
# HOST PRO — Script de déploiement Azure complet
# Exécuter : .\deploy-azure.ps1
# ============================================================

$RESOURCE_GROUP  = "hostpro-rg"
$LOCATION        = "francecentral"
$APP_NAME        = "hostpro-api"
$FRONTEND_NAME   = "hostpro-web"
$DB_SERVER       = "hostpro-db-server"
$DB_NAME         = "hostpro"
$DB_USER         = "hostproadmin"
$DB_PASSWORD     = "HostPro@2025!"
$STORAGE_ACCOUNT = "hostprostorage$(Get-Random -Maximum 9999)"
$ACR_NAME        = "hostproacr$(Get-Random -Maximum 9999)"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  HOST PRO — Deploiement Azure" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. Connexion Azure
Write-Host "[1/9] Connexion Azure..." -ForegroundColor Yellow
az login --output none
if ($LASTEXITCODE -ne 0) { Write-Host "ERREUR connexion Azure" -ForegroundColor Red; exit 1 }

# Afficher l'abonnement actif
$sub = az account show --query "{name:name, id:id}" -o json | ConvertFrom-Json
Write-Host "  Abonnement : $($sub.name)" -ForegroundColor Green

# 2. Resource Group
Write-Host "[2/9] Creation du Resource Group '$RESOURCE_GROUP'..." -ForegroundColor Yellow
az group create --name $RESOURCE_GROUP --location $LOCATION --output none
Write-Host "  OK" -ForegroundColor Green

# 3. PostgreSQL
Write-Host "[3/9] Creation PostgreSQL flexible server..." -ForegroundColor Yellow
az postgres flexible-server create `
  --resource-group $RESOURCE_GROUP `
  --name $DB_SERVER `
  --location $LOCATION `
  --admin-user $DB_USER `
  --admin-password $DB_PASSWORD `
  --sku-name Standard_B1ms `
  --tier Burstable `
  --storage-size 32 `
  --version 16 `
  --public-access 0.0.0.0 `
  --output none

az postgres flexible-server db create `
  --resource-group $RESOURCE_GROUP `
  --server-name $DB_SERVER `
  --database-name $DB_NAME `
  --output none

$DB_URL = "postgresql+asyncpg://${DB_USER}:${DB_PASSWORD}@${DB_SERVER}.postgres.database.azure.com/${DB_NAME}?ssl=require"
Write-Host "  PostgreSQL cree : $DB_SERVER" -ForegroundColor Green

# 4. Azure Blob Storage
Write-Host "[4/9] Creation Azure Blob Storage..." -ForegroundColor Yellow
az storage account create `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --location $LOCATION `
  --sku Standard_LRS `
  --output none

$STORAGE_CONN = az storage account show-connection-string `
  --name $STORAGE_ACCOUNT `
  --resource-group $RESOURCE_GROUP `
  --query connectionString -o tsv

az storage container create `
  --name "property-photos" `
  --connection-string $STORAGE_CONN `
  --public-access blob `
  --output none

Write-Host "  Storage cree : $STORAGE_ACCOUNT" -ForegroundColor Green

# 5. Azure Container Registry
Write-Host "[5/9] Creation Container Registry..." -ForegroundColor Yellow
az acr create `
  --resource-group $RESOURCE_GROUP `
  --name $ACR_NAME `
  --sku Basic `
  --admin-enabled true `
  --output none

$ACR_SERVER   = "${ACR_NAME}.azurecr.io"
$ACR_USERNAME = az acr credential show --name $ACR_NAME --query username -o tsv
$ACR_PASSWORD = az acr credential show --name $ACR_NAME --query "passwords[0].value" -o tsv
Write-Host "  ACR cree : $ACR_SERVER" -ForegroundColor Green

# 6. Build & Push Docker image
Write-Host "[6/9] Build et push image Docker..." -ForegroundColor Yellow
Set-Location "$PSScriptRoot\hostpro-api"
az acr build `
  --registry $ACR_NAME `
  --image hostpro-api:latest `
  . `
  --output none
Set-Location $PSScriptRoot
Write-Host "  Image pushee sur $ACR_SERVER/hostpro-api:latest" -ForegroundColor Green

# 7. Azure App Service (Backend)
Write-Host "[7/9] Deploiement Backend (App Service)..." -ForegroundColor Yellow
az appservice plan create `
  --name "hostpro-plan" `
  --resource-group $RESOURCE_GROUP `
  --sku B1 `
  --is-linux `
  --output none

az webapp create `
  --resource-group $RESOURCE_GROUP `
  --plan "hostpro-plan" `
  --name $APP_NAME `
  --deployment-container-image-name "${ACR_SERVER}/hostpro-api:latest" `
  --output none

# Variables d'environnement
$SECRET_KEY = [System.Guid]::NewGuid().ToString("N") + [System.Guid]::NewGuid().ToString("N")
az webapp config appsettings set `
  --resource-group $RESOURCE_GROUP `
  --name $APP_NAME `
  --settings `
    DATABASE_URL="$DB_URL" `
    SECRET_KEY="$SECRET_KEY" `
    APP_ENV="production" `
    AZURE_STORAGE_CONNECTION_STRING="$STORAGE_CONN" `
    AZURE_STORAGE_CONTAINER="property-photos" `
    ALLOWED_ORIGINS="https://${FRONTEND_NAME}.azurestaticapps.net,https://hostpro.fr" `
    FRONTEND_URL="https://${FRONTEND_NAME}.azurestaticapps.net" `
    WEBSITES_PORT=8000 `
  --output none

# Accès ACR
az webapp config container set `
  --name $APP_NAME `
  --resource-group $RESOURCE_GROUP `
  --docker-registry-server-url "https://$ACR_SERVER" `
  --docker-registry-server-user $ACR_USERNAME `
  --docker-registry-server-password $ACR_PASSWORD `
  --output none

$BACKEND_URL = "https://${APP_NAME}.azurewebsites.net"
Write-Host "  Backend deploye : $BACKEND_URL" -ForegroundColor Green

# 8. Azure Static Web Apps (Frontend)
Write-Host "[8/9] Deploiement Frontend (Static Web Apps)..." -ForegroundColor Yellow

# Créer le fichier de config staticwebapp
$staticConfig = @{
    routes = @(
        @{ route = "/api/*"; rewrite = "/api/index.html" }
        @{ route = "/*"; rewrite = "/index.html" }
    )
    navigationFallback = @{ rewrite = "/index.html"; exclude = @("/_next/*", "/favicon.ico") }
    globalHeaders = @{
        "X-Content-Type-Options" = "nosniff"
        "X-Frame-Options" = "DENY"
    }
} | ConvertTo-Json -Depth 5

$staticConfig | Out-File -FilePath "$PSScriptRoot\hostpro-web\staticwebapp.config.json" -Encoding utf8

# Update .env.local pour la production
"NEXT_PUBLIC_API_URL=$BACKEND_URL" | Out-File -FilePath "$PSScriptRoot\hostpro-web\.env.production" -Encoding utf8

az staticwebapp create `
  --name $FRONTEND_NAME `
  --resource-group $RESOURCE_GROUP `
  --location "westeurope" `
  --sku Free `
  --output none

$FRONTEND_URL = "https://$(az staticwebapp show --name $FRONTEND_NAME --resource-group $RESOURCE_GROUP --query defaultHostname -o tsv)"
Write-Host "  Frontend deploye : $FRONTEND_URL" -ForegroundColor Green

# 9. Résumé
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  DEPLOIEMENT TERMINE !" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  Backend API  : $BACKEND_URL" -ForegroundColor Cyan
Write-Host "  Frontend     : $FRONTEND_URL" -ForegroundColor Cyan
Write-Host "  Database     : $DB_SERVER.postgres.database.azure.com" -ForegroundColor Cyan
Write-Host "  Storage      : $STORAGE_ACCOUNT.blob.core.windows.net" -ForegroundColor Cyan
Write-Host ""
Write-Host "  Docs API     : $BACKEND_URL/docs" -ForegroundColor White
Write-Host ""

# Sauvegarder les infos de déploiement
$deployInfo = @"
# HOST PRO — Infos de déploiement Azure
# Généré le $(Get-Date -Format "dd/MM/yyyy HH:mm")

RESOURCE_GROUP=$RESOURCE_GROUP
BACKEND_URL=$BACKEND_URL
FRONTEND_URL=$FRONTEND_URL
DB_SERVER=$DB_SERVER.postgres.database.azure.com
DB_NAME=$DB_NAME
DB_USER=$DB_USER
STORAGE_ACCOUNT=$STORAGE_ACCOUNT
ACR_NAME=$ACR_NAME
SECRET_KEY=$SECRET_KEY
"@

$deployInfo | Out-File -FilePath "$PSScriptRoot\azure-deploy-info.txt" -Encoding utf8
Write-Host "  Infos sauvegardees dans azure-deploy-info.txt" -ForegroundColor Yellow
Write-Host ""

# Prochaine etape : build frontend
Write-Host "PROCHAINE ETAPE : Buildez le frontend et deployez-le avec :" -ForegroundColor Yellow
Write-Host "  cd hostpro-web" -ForegroundColor White
Write-Host "  npm run build" -ForegroundColor White
Write-Host "  npx @azure/static-web-apps-cli deploy ./out --deployment-token <TOKEN>" -ForegroundColor White
