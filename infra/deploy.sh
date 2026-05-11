#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# HOST PRO — Script de déploiement Azure (first-time setup)
# Usage : bash infra/deploy.sh [dev|prod]
# Prérequis : az CLI installé et connecté (az login)
# ═══════════════════════════════════════════════════════════════════════════
set -euo pipefail

ENV=${1:-dev}
LOCATION="francecentral"
RG="hostpro-${ENV}"
PREFIX="hostpro"

echo "╔══════════════════════════════════════════════╗"
echo "║  HOST PRO — Déploiement Azure [$ENV]          ║"
echo "╚══════════════════════════════════════════════╝"

# ── 1. Vérifier az CLI ──────────────────────────────────────────────────
if ! command -v az &>/dev/null; then
  echo "❌ Azure CLI non trouvé. Installez depuis https://aka.ms/install-azure-cli"
  exit 1
fi

# Vérifier la connexion
if ! az account show &>/dev/null; then
  echo "🔐 Connexion Azure requise..."
  az login
fi

SUBSCRIPTION=$(az account show --query id -o tsv)
echo "✓ Abonnement : $SUBSCRIPTION"

# ── 2. Créer le Resource Group ──────────────────────────────────────────
echo ""
echo "[1/5] Création du Resource Group '$RG'..."
az group create --name "$RG" --location "$LOCATION" --output none
echo "      OK ✓"

# ── 3. Demander les paramètres secrets ──────────────────────────────────
echo ""
echo "[2/5] Configuration des paramètres..."

if [ -z "${DB_ADMIN_PASSWORD:-}" ]; then
  read -rsp "    Mot de passe PostgreSQL admin : " DB_ADMIN_PASSWORD
  echo ""
fi

if [ -z "${JWT_SECRET_KEY:-}" ]; then
  JWT_SECRET_KEY=$(python3 -c "import secrets; print(secrets.token_hex(32))" 2>/dev/null || openssl rand -hex 32)
  echo "    JWT Secret généré automatiquement."
fi

# ── 4. Déployer l'infrastructure Bicep ──────────────────────────────────
echo ""
echo "[3/5] Déploiement de l'infrastructure Bicep..."

PARAMS_FILE="infra/parameters.${ENV}.json"
if [ -f "$PARAMS_FILE" ]; then
  az deployment group create \
    --resource-group "$RG" \
    --template-file infra/main.bicep \
    --parameters "@$PARAMS_FILE" \
    --parameters dbAdminPassword="$DB_ADMIN_PASSWORD" \
    --parameters jwtSecretKey="$JWT_SECRET_KEY" \
    --output table
else
  az deployment group create \
    --resource-group "$RG" \
    --template-file infra/main.bicep \
    --parameters env="$ENV" prefix="$PREFIX" \
    --parameters dbAdminPassword="$DB_ADMIN_PASSWORD" \
    --parameters jwtSecretKey="$JWT_SECRET_KEY" \
    --output table
fi

echo "      Bicep déployé ✓"

# ── 5. Récupérer les outputs ─────────────────────────────────────────────
echo ""
echo "[4/5] Récupération des informations de connexion..."

DEPLOYMENT=$(az deployment group list --resource-group "$RG" --query "[0].name" -o tsv)

ACR_SERVER=$(az deployment group show -g "$RG" -n "$DEPLOYMENT" --query properties.outputs.acrLoginServer.value -o tsv)
API_URL=$(az deployment group show -g "$RG" -n "$DEPLOYMENT" --query properties.outputs.apiUrl.value -o tsv)
WEB_URL=$(az deployment group show -g "$RG" -n "$DEPLOYMENT" --query properties.outputs.webUrl.value -o tsv)
PG_HOST=$(az deployment group show -g "$RG" -n "$DEPLOYMENT" --query properties.outputs.postgresHost.value -o tsv)
STORAGE=$(az deployment group show -g "$RG" -n "$DEPLOYMENT" --query properties.outputs.storageAccountName.value -o tsv)

echo "      OK ✓"

# ── 6. Créer la Service Principal pour GitHub Actions ───────────────────
echo ""
echo "[5/5] Création de la Service Principal GitHub Actions..."

SP_JSON=$(az ad sp create-for-rbac \
  --name "hostpro-github-actions-${ENV}" \
  --role contributor \
  --scopes "/subscriptions/$SUBSCRIPTION/resourceGroups/$RG" \
  --sdk-auth 2>/dev/null || echo "SP déjà existant, skipping")

echo ""
echo "════════════════════════════════════════════════"
echo "  ✅ DÉPLOIEMENT TERMINÉ !"
echo "════════════════════════════════════════════════"
echo ""
echo "  🌐 API URL  : $API_URL"
echo "  🌐 Web URL  : $WEB_URL"
echo "  🐘 Postgres : $PG_HOST"
echo "  📦 ACR      : $ACR_SERVER"
echo "  💾 Storage  : $STORAGE"
echo ""
echo "  ── GitHub Actions Secrets à configurer ──────"
echo "  AZURE_SUBSCRIPTION_ID = $SUBSCRIPTION"
echo "  AZURE_RESOURCE_GROUP  = $RG"
echo "  ACR_LOGIN_SERVER      = $ACR_SERVER"
echo ""
if [ -n "${SP_JSON}" ] && [ "$SP_JSON" != "SP déjà existant, skipping" ]; then
  echo "  AZURE_CREDENTIALS (JSON ci-dessous) :"
  echo "$SP_JSON"
fi
echo ""
echo "  ── Prochaine étape ──────────────────────────"
echo "  1. Ajoutez les secrets dans GitHub (Settings → Secrets)"
echo "  2. Poussez sur la branche 'main' pour déclencher le déploiement"
echo "  3. Suivez le pipeline dans GitHub Actions"
echo ""
