# HOST PRO - Script de demarrage
# Lance le backend (FastAPI) et le frontend (Next.js) en une seule commande

$PY = "C:\Users\ahmed\AppData\Local\Programs\Python\Python311\python.exe"
$API_DIR = "C:\Users\ahmed\hostpro\hostpro-api"
$WEB_DIR = "C:\Users\ahmed\hostpro\hostpro-web"

Write-Host "=== HOST PRO - Demarrage ===" -ForegroundColor Cyan

# Arreter les anciens processus
Write-Host "Arret des anciens processus..." -ForegroundColor Yellow
Get-Process -Name "python*" -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue
Get-Process -Name "node*" -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -eq "" } | Stop-Process -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 1

# Initialiser la base de donnees si elle n'existe pas
if (-not (Test-Path "$API_DIR\hostpro.db")) {
    Write-Host "Initialisation de la base de donnees..." -ForegroundColor Yellow
    $env:PYTHONPATH = $API_DIR
    & $PY "$API_DIR\app\db_init.py"
}

# Demarrer le backend
Write-Host "Demarrage du backend (port 8000)..." -ForegroundColor Green
$env:PYTHONPATH = $API_DIR
Start-Process -FilePath $PY `
    -ArgumentList "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload" `
    -WorkingDirectory $API_DIR `
    -WindowStyle Minimized

Start-Sleep -Seconds 4

# Verifier le backend
try {
    $health = Invoke-WebRequest -Uri "http://localhost:8000/health" -UseBasicParsing -TimeoutSec 5
    Write-Host "Backend OK - http://localhost:8000" -ForegroundColor Green
    Write-Host "API Docs  - http://localhost:8000/docs" -ForegroundColor Green
} catch {
    Write-Host "Backend pas encore pret, attente supplementaire..." -ForegroundColor Yellow
    Start-Sleep -Seconds 4
}

# Demarrer le frontend
Write-Host "Demarrage du frontend (port 3000)..." -ForegroundColor Green
Start-Process -FilePath "npm" `
    -ArgumentList "run", "dev" `
    -WorkingDirectory $WEB_DIR `
    -WindowStyle Minimized

Start-Sleep -Seconds 8

# Verifier le frontend
try {
    $front = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 10
    Write-Host "Frontend OK - http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "Frontend encore en compilation, ouvrez http://localhost:3000 dans 30 secondes" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "=== HOST PRO est pret ! ===" -ForegroundColor Cyan
Write-Host "Application : http://localhost:3000" -ForegroundColor White
Write-Host "API Docs    : http://localhost:8000/docs" -ForegroundColor White
Write-Host ""
Write-Host "Compte admin cree :" -ForegroundColor White
Write-Host "  Email    : admin@slamariviera.com" -ForegroundColor White
Write-Host "  Password : Admin1234!" -ForegroundColor White
