# HOST PRO — Guide de démarrage

## Prérequis
- Python 3.11+
- Node.js 18+
- Docker Desktop (pour Redis local)
- Un compte Supabase (base de données cloud gratuite)

---

## 1. Base de données cloud (Supabase — GRATUIT)

1. Créez un compte sur https://supabase.com
2. Créez un nouveau projet : "hostpro"
3. Dans **Settings > Database**, copiez :
   - **Connection string (URI)** → pour `DATABASE_URL_SYNC`
   - Remplacez `postgresql://` par `postgresql+asyncpg://` → pour `DATABASE_URL`

Exemple :
```
DATABASE_URL=postgresql+asyncpg://postgres.xxxx:password@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
DATABASE_URL_SYNC=postgresql://postgres.xxxx:password@aws-0-eu-west-3.pooler.supabase.com:5432/postgres
```

---

## 2. Backend (FastAPI)

```bash
cd hostpro-api

# Copier et remplir les variables d'environnement
cp .env.example .env
# Editez .env avec vos clés Supabase, Redis, etc.

# Créer l'environnement virtuel
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate     # Mac/Linux

# Installer les dépendances
pip install -r requirements.txt

# Lancer Redis (Docker)
docker run -d -p 6379:6379 --name redis redis:7-alpine

# Appliquer les migrations (crée toutes les tables)
alembic upgrade head

# Lancer l'API
uvicorn app.main:app --reload --port 8000
```

API disponible sur : http://localhost:8000
Documentation Swagger : http://localhost:8000/docs

---

## 3. Frontend (Next.js)

```bash
cd hostpro-web

# Installer les dépendances
npm install

# L'URL de l'API est déjà configurée dans .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Lancer le frontend
npm run dev
```

Application disponible sur : http://localhost:3000

---

## 4. Premier démarrage

1. Ouvrez http://localhost:3000
2. Cliquez sur "Créer un compte"
3. Remplissez :
   - Votre nom
   - Email professionnel
   - Mot de passe
   - Nom de votre structure (ex: "Slama Riviera")
4. Vous êtes connecté — essai gratuit 14 jours

---

## 5. Variables d'environnement importantes

### hostpro-api/.env

```env
# OBLIGATOIRE
DATABASE_URL=postgresql+asyncpg://...
DATABASE_URL_SYNC=postgresql://...
SECRET_KEY=votre-cle-secrete-32-chars-minimum
REDIS_URL=redis://localhost:6379/0

# OPTIONNEL pour la V1
RESEND_API_KEY=re_...          # Pour les emails
STRIPE_SECRET_KEY=sk_test_... # Pour la facturation
S3_ACCESS_KEY=...              # Pour les photos
```

---

## 6. Architecture déployée

```
Vercel (Frontend Next.js)
    ↕ REST API
Railway / Render (Backend FastAPI)
    ↕ PostgreSQL
Supabase (Base de données cloud)
    ↕ Cache/Queue
Upstash Redis (Redis cloud gratuit)
```

### Déploiement Vercel (Frontend)
```bash
cd hostpro-web
npx vercel --prod
# Ajoutez la variable : NEXT_PUBLIC_API_URL=https://votre-api.railway.app
```

### Déploiement Railway (Backend)
1. Créez un projet sur https://railway.app
2. Connectez votre dépôt GitHub
3. Ajoutez toutes les variables d'environnement
4. Railway détecte automatiquement le Dockerfile

---

## 7. Modules disponibles en V1

| Module | Statut |
|--------|--------|
| Auth + Multi-tenant | ✅ |
| Gestion des biens | ✅ |
| Calendrier + iCal sync | ✅ |
| Réservations (CRUD complet) | ✅ |
| Tâches opérationnelles | ✅ |
| Messagerie centralisée | ✅ |
| Templates messages | ✅ |
| Conformité loi Le Meur | ✅ |
| Compteur nuitées | ✅ |
| Suivi DPE | ✅ |
| Dashboard KPIs | ✅ |
| Alertes conformité | ✅ |
| Stripe Billing | 🔄 V1.5 |
| API Airbnb native | 🔄 V1.5 |
| IA francophone | 🔄 V2 |

---

## 8. Support

Pour toute question technique : architecture@hostpro.fr
