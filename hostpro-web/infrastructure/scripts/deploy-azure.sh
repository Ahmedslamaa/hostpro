#!/bin/bash
# ════════════════════════════════════════════════════════════════════════════
# HOST PRO — Script de déploiement Azure complet
# Usage : ./deploy-azure.sh [dev|staging|prod]
# Prérequis : az CLI installé, connecté (az login)
# ════════════════════════════════════════════════════════════════════════════

set -euo pipefail

ENVIRONMENT="${1:-prod}"
RESOURCE_GROUP="hostpro-${ENVIRONMENT}-rg"
LOCATION="westeurope"
PREFIX="hostpro"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  HOST PRO — Déploiement Azure"
echo "  Environnement : ${ENVIRONMENT}"
echo "  Région : ${LOCATION}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# ── 1. Vérifier la connexion Azure ──────────────────────────────────────────
echo "▶ Vérification de la connexion Azure..."
az account show --query "{subscription:name, tenant:tenantId}" -o table

# ── 2. Créer le Resource Group ──────────────────────────────────────────────
echo "▶ Création du Resource Group '${RESOURCE_GROUP}'..."
az group create \
  --name "${RESOURCE_GROUP}" \
  --location "${LOCATION}" \
  --tags project=hostpro environment="${ENVIRONMENT}" owner=hostpro-team

# ── 3. Générer et stocker les secrets ──────────────────────────────────────
echo "▶ Génération des secrets..."
DB_PASSWORD=$(openssl rand -base64 32 | tr -d "=+/" | head -c 24)
JWT_SECRET=$(openssl rand -hex 64)

# Key Vault bootstrap (pour le premier déploiement)
BOOTSTRAP_KV_NAME="${PREFIX}-${ENVIRONMENT}-bootstrap-kv"
az keyvault create \
  --name "${BOOTSTRAP_KV_NAME}" \
  --resource-group "${RESOURCE_GROUP}" \
  --location "${LOCATION}" \
  --enable-soft-delete true \
  --retention-days 90 2>/dev/null || echo "Key Vault bootstrap déjà existant"

az keyvault secret set --vault-name "${BOOTSTRAP_KV_NAME}" --name "db-admin-password" --value "${DB_PASSWORD}" -o none
az keyvault secret set --vault-name "${BOOTSTRAP_KV_NAME}" --name "jwt-secret" --value "${JWT_SECRET}" -o none

SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# ── 4. Déploiement Bicep ─────────────────────────────────────────────────────
echo "▶ Déploiement de l'infrastructure via Bicep..."

# Mettre à jour l'ID de subscription dans le fichier parameters
sed -i "s/VOTRE_SUBSCRIPTION_ID/${SUBSCRIPTION_ID}/g" \
  "$(dirname "$0")/../azure/parameters.${ENVIRONMENT}.json"

az deployment group create \
  --name "hostpro-deploy-$(date +%Y%m%d-%H%M%S)" \
  --resource-group "${RESOURCE_GROUP}" \
  --template-file "$(dirname "$0")/../azure/main.bicep" \
  --parameters "$(dirname "$0")/../azure/parameters.${ENVIRONMENT}.json" \
  --verbose

# ── 5. Récupérer les outputs du déploiement ──────────────────────────────────
echo "▶ Récupération des outputs..."

APP_URL=$(az deployment group show \
  --resource-group "${RESOURCE_GROUP}" \
  --name "hostpro-deploy" \
  --query properties.outputs.appServiceUrl.value -o tsv 2>/dev/null || echo "non disponible")

PG_FQDN=$(az deployment group show \
  --resource-group "${RESOURCE_GROUP}" \
  --name "hostpro-deploy" \
  --query properties.outputs.pgServerFqdn.value -o tsv 2>/dev/null || echo "non disponible")

# ── 6. Construire et déployer l'application Next.js ─────────────────────────
echo "▶ Build de l'application Next.js..."
cd "$(dirname "$0")/../.."
npm ci
npm run build

echo "▶ Déploiement de l'application sur Azure App Service..."
APP_SERVICE_NAME="${PREFIX}-${ENVIRONMENT}-app"

# Créer un zip du répertoire standalone
cd .next/standalone
zip -r ../../app.zip . 2>/dev/null
cd ../..

az webapp deploy \
  --name "${APP_SERVICE_NAME}" \
  --resource-group "${RESOURCE_GROUP}" \
  --src-path app.zip \
  --type zip

# ── 7. Configuration des migrations Prisma ───────────────────────────────────
echo "▶ Exécution des migrations de base de données..."
# Les migrations sont exécutées via un webjob ou une startup command
az webapp config set \
  --name "${APP_SERVICE_NAME}" \
  --resource-group "${RESOURCE_GROUP}" \
  --startup-file "node_modules/.bin/prisma migrate deploy && node server.js"

# ── 8. Rapport final ─────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  ✅ Déploiement terminé avec succès !"
echo ""
echo "  🌐 Application : ${APP_URL}"
echo "  🗄️  PostgreSQL  : ${PG_FQDN}"
echo "  🔐 Key Vault   : ${PREFIX}-${ENVIRONMENT}-kv"
echo "  📊 App Insights: ${PREFIX}-${ENVIRONMENT}-insights"
echo ""
echo "  ⚠️  IMPORTANT : Configurez votre domaine personnalisé"
echo "  et le certificat SSL dans le portail Azure."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
