# HOST PRO — Guide de démarrage

## Prérequis
- Python 3.11+
- Node.js 20+
- Docker Desktop
- Azure CLI (`az`) — [installer](https://aka.ms/install-azure-cli)

---

## Développement local

### 1. Lancer la stack complète avec Docker

```bash
cd hostpro-api

# Démarrer PostgreSQL + Redis
docker compose up -d postgres redis

# Puis lancer l'API en mode dev (hot-reload)
docker compose up api
```

Ou tout en un coup :
```bash
docker compose up
```

| Service  | URL                              |
|----------|----------------------------------|
| API      | http://localhost:8000            |
| Swagger  | http://localhost:8000/docs       |
| Frontend | http://localhost:3000            |

---

### 2. Backend sans Docker (dev rapide)

```bash
cd hostpro-api

# Environnement virtuel
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Dépendances
pip install -r requirements.txt

# Variables d'environnement (SQLite local par défaut)
cp .env.example .env

# Lancer l'API (SQLite — pas besoin de PostgreSQL)
uvicorn app.main:app --reload --port 8000
```

---

### 3. Frontend

```bash
cd hostpro-web
npm install
npm run dev
```

L'URL de l'API est configurée dans `.env.local` :
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

---

### 4. Premier démarrage

1. Ouvrez http://localhost:3000
2. Cliquez sur **"Créer un compte"**
3. Remplissez :
   - Votre nom, email professionnel, mot de passe
   - Nom de votre structure (ex: "Slama Riviera")
4. Vous êtes connecté — essai gratuit 14 jours

---

## Variables d'environnement

### Développement (`hostpro-api/.env`)

```env
# Base de données (SQLite local par défaut)
DATABASE_URL=sqlite+aiosqlite:///./hostpro.db

# JWT
SECRET_KEY=hostpro-dev-secret-key-2025-change-me

# Redis (optionnel en dev)
REDIS_URL=redis://localhost:6379/0
```

### Production Azure (`hostpro-api/.env.azure.example`)

Voir `.env.azure.example` — toutes les variables Azure commentées.

---

## Déploiement Azure

### Option 1 — Script automatique (recommandé)

```powershell
# Windows PowerShell
.\deploy-azure.ps1
```

Le script crée automatiquement :
- Resource Group Azure
- Azure Database for PostgreSQL
- Azure Cache for Redis
- Azure Blob Storage (photos)
- Azure Container Registry (ACR)
- Azure Container Apps (API + Frontend)

### Option 2 — Infrastructure as Code (Bicep)

```bash
# Créer le Resource Group
az group create --name hostpro-prod --location francecentral

# Déployer toute l'infra
az deployment group create \
  --resource-group hostpro-prod \
  --template-file infra/main.bicep \
  --parameters env=prod dbAdminPassword=VotreMotDePasse jwtSecretKey=VotreCleJWT
```

### Option 3 — CI/CD GitHub Actions

Chaque `push` sur `main` déclenche le pipeline `.github/workflows/deploy-azure.yml` :
1. Build des images Docker
2. Push vers Azure Container Registry
3. Mise à jour des Container Apps

---

## Architecture Azure

```
                    ┌─────────────────────────────────────────┐
                    │         Azure Container Apps             │
                    │                                         │
  Internet ────────►│  hostpro-web (Next.js :3000)            │
                    │        │                                │
                    │        ▼                                │
                    │  hostpro-api (FastAPI :8000)            │
                    └──────┬──────────────────┬──────────────┘
                           │                  │
              ┌────────────▼───┐   ┌──────────▼────────────┐
              │ Azure Database │   │  Azure Cache for Redis │
              │  for PostgreSQL│   │                        │
              └────────────────┘   └────────────────────────┘
                           │
              ┌────────────▼────────────┐
              │   Azure Blob Storage    │
              │  (photos propriétés)    │
              └─────────────────────────┘
```

---

## Modules disponibles

| Module | Statut |
|--------|--------|
| Auth + Multi-tenant | ✅ |
| Gestion des biens | ✅ |
| Calendrier + iCal sync | ✅ |
| Réservations (CRUD complet) | ✅ |
| Channel Manager | ✅ |
| Tâches opérationnelles | ✅ |
| Messagerie centralisée | ✅ |
| Templates messages | ✅ |
| Conformité loi Le Meur | ✅ |
| Compteur nuitées | ✅ |
| Dashboard KPIs | ✅ |
| Upload photos (Azure Blob) | ✅ |
| Stripe Billing | 🔄 V1.5 |
| API Airbnb native | 🔄 V1.5 |
| Assistant IA | 🔄 V2 |

---

## Support

Pour toute question technique : architecture@hostpro.fr
