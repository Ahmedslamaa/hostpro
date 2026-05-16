# ═══════════════════════════════════════════════════════════════════════════════
# HOST PRO — Script de setup base de données Azure PostgreSQL
# Lance ce script depuis PowerShell pour initialiser la base de données.
#
# Usage :
#   cd "C:\HOST PRO\HOST PRO - SAS PMS PLATFORM"
#   .\scripts\setup-db.ps1
# ═══════════════════════════════════════════════════════════════════════════════

$ErrorActionPreference = "Stop"

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "   HOST PRO — Setup base de données PostgreSQL" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# 1. Lire le DATABASE_URL depuis le secret GitHub ou demander à l'utilisateur
Write-Host "🔑 Récupération du DATABASE_URL depuis GitHub Secrets..." -ForegroundColor Yellow
try {
    $dbUrl = gh secret list --repo Ahmedslamaa/hostpro --json name | ConvertFrom-Json | Where-Object { $_.name -eq "DATABASE_URL" }
    if ($dbUrl) {
        Write-Host "   Secret DATABASE_URL trouvé dans GitHub." -ForegroundColor Green
    }
} catch {
    Write-Host "   Impossible de lire depuis GitHub." -ForegroundColor DarkYellow
}

Write-Host ""
Write-Host "Entrez votre DATABASE_URL Azure PostgreSQL :" -ForegroundColor Cyan
Write-Host "(Format: postgresql://username:password@hostname:5432/dbname?sslmode=require)" -ForegroundColor DarkGray
Write-Host ""
$dbUrlInput = Read-Host "DATABASE_URL"

if (-not $dbUrlInput) {
    Write-Host "❌ DATABASE_URL vide. Annulation." -ForegroundColor Red
    exit 1
}

# 2. Encoder correctement le mot de passe si nécessaire
Write-Host ""
Write-Host "🔧 Vérification de l'encodage URL du mot de passe..." -ForegroundColor Yellow

# Extraire et afficher le host pour vérification
if ($dbUrlInput -match "postgresql://([^:]+):([^@]+)@([^/]+)/(.+)") {
    $dbUser = $Matches[1]
    $dbPass = $Matches[2]
    $dbHost = $Matches[3]
    $dbName = $Matches[4]
    Write-Host "   Serveur : $dbHost" -ForegroundColor DarkGray
    Write-Host "   Utilisateur : $dbUser" -ForegroundColor DarkGray
    Write-Host "   Base : $dbName" -ForegroundColor DarkGray
    Write-Host "   Mot de passe : $('*' * [Math]::Min($dbPass.Length, 6))..." -ForegroundColor DarkGray
}

# 3. Aller dans le répertoire web
$webDir = Join-Path $PSScriptRoot "..\hostpro-web"
Push-Location $webDir

try {
    # 4. Patcher le schema pour PostgreSQL
    Write-Host ""
    Write-Host "📝 Patch du schema Prisma (sqlite → postgresql)..." -ForegroundColor Yellow
    $schema = Get-Content "prisma\schema.prisma" -Raw
    $schemaPg = $schema -replace 'provider = "sqlite"', 'provider = "postgresql"'
    Set-Content "prisma\schema.prisma" $schemaPg -Encoding utf8
    Write-Host "   Schema patché." -ForegroundColor Green

    # 5. Générer le client Prisma
    Write-Host ""
    Write-Host "⚙️  Génération du client Prisma..." -ForegroundColor Yellow
    $env:DATABASE_URL = $dbUrlInput
    npx prisma generate
    if ($LASTEXITCODE -ne 0) { throw "prisma generate failed" }

    # 6. Pousser le schema vers la base de données
    Write-Host ""
    Write-Host "🚀 Création des tables PostgreSQL (prisma db push)..." -ForegroundColor Yellow
    npx prisma db push --skip-generate
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ ERREUR : prisma db push a échoué." -ForegroundColor Red
        Write-Host ""
        Write-Host "Causes possibles :" -ForegroundColor Yellow
        Write-Host "  1. Le mot de passe contient des caractères spéciaux (@, #, !, etc.)" -ForegroundColor White
        Write-Host "     → Encodez-les en URL : @ = %40, # = %23, ! = %21" -ForegroundColor DarkGray
        Write-Host "  2. L'IP du runner GitHub Actions n'est pas autorisée dans le firewall Azure" -ForegroundColor White
        Write-Host "     → Azure Portal > Serveur PostgreSQL > Réseau > Ajouter IP actuelle" -ForegroundColor DarkGray
        Write-Host "  3. Le serveur PostgreSQL est arrêté" -ForegroundColor White
        Write-Host "     → Azure Portal > Serveur PostgreSQL > Vue d'ensemble > Démarrer" -ForegroundColor DarkGray
        throw "prisma db push failed"
    }

    Write-Host ""
    Write-Host "✅ Toutes les tables créées avec succès !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Tables créées :" -ForegroundColor Cyan
    npx prisma db execute --stdin <<< "SELECT tablename FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;" 2>$null | Out-Null

    # 7. Mettre à jour le secret GitHub
    Write-Host ""
    Write-Host "🔐 Mise à jour du secret DATABASE_URL dans GitHub..." -ForegroundColor Yellow
    $dbUrlInput | gh secret set DATABASE_URL --repo Ahmedslamaa/hostpro
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   Secret GitHub mis à jour." -ForegroundColor Green
    } else {
        Write-Host "   ⚠️  Impossible de mettre à jour le secret GitHub automatiquement." -ForegroundColor DarkYellow
        Write-Host "   Mettez à jour manuellement : https://github.com/Ahmedslamaa/hostpro/settings/secrets/actions" -ForegroundColor DarkYellow
    }

} finally {
    # 8. Restaurer le schema SQLite
    Write-Host ""
    Write-Host "🔄 Restauration du schema SQLite (dev)..." -ForegroundColor Yellow
    $schema = Get-Content "prisma\schema.prisma" -Raw
    $schemaSqlite = $schema -replace 'provider = "postgresql"', 'provider = "sqlite"'
    Set-Content "prisma\schema.prisma" $schemaSqlite -Encoding utf8
    Write-Host "   Schema restauré." -ForegroundColor Green
    Pop-Location
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host "   ✅ Base de données initialisée !" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaine étape : pusher sur main pour déclencher le déploiement complet." -ForegroundColor Cyan
Write-Host ""
