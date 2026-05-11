# 🚀 HOST PRO — Guide de déploiement Azure

## Architecture cible

```
Azure Container Apps
  ├── hostpro-prod-web  (Next.js  → port 3000)
  └── hostpro-prod-api  (FastAPI  → port 8000)
        ├── Azure Database for PostgreSQL Flexible Server
        ├── Azure Cache for Redis
        └── Azure Blob Storage (photos + iCal exports)

Azure Container Registry  ← images Docker
Application Insights      ← monitoring & logs
```

---

## Prérequis

1. **Azure CLI** installé : https://aka.ms/install-azure-cli
2. **Docker Desktop** installé et en cours d'exécution
3. **Compte Microsoft Azure** avec abonnement actif

> 💡 Premier compte : https://azure.microsoft.com/fr-fr/free → 200$ de crédit gratuit

---

## Option A — Script automatique PowerShell ✅ Recommandé

```powershell
# Depuis le dossier racine du projet
.\deploy-azure.ps1
```

Le script fait **tout automatiquement** en ~15 minutes :
1. Crée le Resource Group Azure
2. Déploie Azure Container Registry
3. Déploie Azure Database for PostgreSQL
4. Déploie Azure Cache for Redis
5. Crée le compte Azure Blob Storage
6. Build et push les images Docker vers ACR
7. Crée l'environnement Container Apps
8. Lance le Container App API (FastAPI)
9. Lance le Container App Frontend (Next.js)

---

## Option B — Infrastructure as Code (Bicep)

```bash
# 1. Créer le Resource Group
az group create --name hostpro-prod --location francecentral

# 2. Déployer toute l'infrastructure en une commande
az deployment group create \
  --resource-group hostpro-prod \
  --template-file infra/main.bicep \
  --parameters env=prod \
  --parameters dbAdminPassword="VotreMotDePasseSecurisé!" \
  --parameters jwtSecretKey="$(python3 -c 'import secrets; print(secrets.token_hex(32))')" \
  --parameters frontendUrl="https://app.hostpro.fr"
```

---

## Option C — CI/CD GitHub Actions (déploiement continu)

Chaque `git push origin main` déclenche automatiquement :

```
Push → GitHub Actions
  ├── 1. Lint (TypeScript + Python)
  ├── 2. Build images Docker → push ACR
  ├── 3. Deploy infra Bicep (si changement infra)
  └── 4. Update Container Apps → healthcheck
```

### Secrets GitHub à configurer (Settings → Secrets and variables → Actions)

| Secret | Comment obtenir |
|--------|-----------------|
| `AZURE_CREDENTIALS` | `az ad sp create-for-rbac --sdk-auth` |
| `AZURE_SUBSCRIPTION_ID` | `az account show --query id -o tsv` |
| `AZURE_RESOURCE_GROUP` | `hostpro-prod` |
| `ACR_LOGIN_SERVER` | `hostproacrprod.azurecr.io` |
| `ACR_USERNAME` | `az acr credential show --name hostproacrprod --query username -o tsv` |
| `ACR_PASSWORD` | `az acr credential show --name hostproacrprod --query "passwords[0].value" -o tsv` |
| `DB_ADMIN_PASSWORD` | Votre mot de passe PostgreSQL |
| `JWT_SECRET_KEY` | `python3 -c "import secrets; print(secrets.token_hex(32))"` |

---

## Résultat après déploiement

```
🌐 Frontend  → https://hostpro-prod-web.azurecontainerapps.io
⚡ API       → https://hostpro-prod-api.azurecontainerapps.io
📚 Docs API  → https://hostpro-prod-api.azurecontainerapps.io/docs
```

---

## Domaine personnalisé (optionnel)

```bash
# Ajouter le domaine hostpro.fr au Container App frontend
az containerapp hostname add \
  --name hostpro-prod-web \
  --resource-group hostpro-prod \
  --hostname app.hostpro.fr
```

Puis configurer le DNS chez votre registrar :
```
CNAME  app    →  hostpro-prod-web.azurecontainerapps.io
CNAME  api    →  hostpro-prod-api.azurecontainerapps.io
```

---

## Budget estimé

| Ressource | SKU | Coût/mois |
|-----------|-----|-----------|
| Container App API | 1 vCPU / 2 GB | ~15€ |
| Container App Web | 0.5 vCPU / 1 GB | ~8€ |
| PostgreSQL Flexible | B1ms Burstable | ~14€ |
| Redis Cache | C0 Basic | ~14€ |
| Blob Storage | Standard LRS | ~1€ |
| Container Registry | Basic | ~5€ |
| Application Insights | Pay-per-use | ~2€ |
| **Total** | | **~59€/mois** |

> 💡 En dev/staging, les Container Apps scalent à 0 replica → **coût ≈ 0€** hors heures d'utilisation.
